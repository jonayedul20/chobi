import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { isExpired, hashPassword } from "../../shared/albumSecurity.ts";

// Signing a file URL costs an integration credit per call, and the old
// version signed every photo's URLs fresh for every viewer, every visit —
// cost scaled with traffic. Now URLs are minted once, cached on the Photo
// record, and shared by all viewers until they near expiry. Cost scales
// with photos per day instead of viewers.
const SIGN_SECONDS = 24 * 60 * 60; // ask for 24h-lived URLs
const REFRESH_BUFFER_MS = 45 * 60 * 1000; // re-sign when less than this remains

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const slug = String(body.slug || "");
    const password = body.password ? String(body.password) : "";

    const albums = await base44.asServiceRole.entities.Album.filter({ slug });
    const album = albums && albums[0];
    if (!album) return Response.json({ error: "NOT_FOUND" }, { status: 404 });
    if (isExpired(album)) return Response.json({ error: "EXPIRED" });

    if (album.has_password) {
      if (!password) return Response.json({ error: "PASSWORD_REQUIRED" });
      const hash = await hashPassword(password, album.password_salt);
      if (hash !== album.password_hash) return Response.json({ error: "WRONG_PASSWORD" }, { status: 403 });
    }

    const sign = async (fileUri) => {
      if (!fileUri) return "";
      const res = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({
        file_uri: fileUri,
        expires_in: SIGN_SECONDS
      });
      return res.signed_url || "";
    };

    const photos = (await base44.asServiceRole.entities.Photo.filter({ album_id: album.id }, "created_date", 200)) ?? [];

    const now = Date.now();
    const stale = photos.filter(p => {
      if (!p.url_original || !p.signed_until) return true;
      return new Date(p.signed_until).getTime() - now < REFRESH_BUFFER_MS;
    });

    // Signed URLs carry a JWT whose exp claim is the real expiry. The
    // platform may cap lifetimes below what we request, so read the actual
    // value instead of trusting SIGN_SECONDS — otherwise cached URLs could
    // outlive their validity and serve dead links.
    const actualExpiryMs = (url) => {
      try {
        const token = new URL(url).searchParams.get("token");
        const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
        if (payload.exp) return payload.exp * 1000;
      } catch { /* fall through to the conservative default */ }
      return now + 3600 * 1000;
    };

    if (stale.length > 0) {
      await Promise.all(stale.map(async (p) => {
        const [o, t, w] = await Promise.all([sign(p.file_uri), sign(p.thumb_uri), sign(p.web_uri)]);
        p.url_original = o;
        p.url_thumb = t;
        p.url_web = w;
        p.signed_until = new Date(actualExpiryMs(o)).toISOString();
      }));
      await base44.asServiceRole.entities.Photo.bulkUpdate(stale.map(p => ({
        id: p.id,
        url_original: p.url_original,
        url_thumb: p.url_thumb,
        url_web: p.url_web,
        signed_until: p.signed_until
      })));
    }

    const signed = photos.map(photo => ({
      id: photo.id,
      file_name: photo.file_name,
      size_bytes: photo.size_bytes,
      width: photo.width || null,
      height: photo.height || null,
      // signed_url stays the original — it is what downloads use.
      // Photos uploaded before derivatives existed fall back to it.
      signed_url: photo.url_original,
      thumb_url: photo.url_thumb || photo.url_web || photo.url_original,
      web_url: photo.url_web || photo.url_original
    }));

    return Response.json({
      album: {
        id: album.id,
        title: album.title,
        slug: album.slug,
        description: album.description,
        expires_at: album.expires_at || null,
        has_password: album.has_password
      },
      photos: signed
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
