import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { isExpired, hashPassword } from "../../shared/albumSecurity.ts";

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

    const photos = (await base44.asServiceRole.entities.Photo.filter({ album_id: album.id }, "created_date", 200)) ?? [];
    const signed = await Promise.all(photos.map(async (photo) => {
      const res = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({
        file_uri: photo.file_uri,
        expires_in: 3600
      });
      return {
        id: photo.id,
        file_name: photo.file_name,
        size_bytes: photo.size_bytes,
        signed_url: res.signed_url
      };
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