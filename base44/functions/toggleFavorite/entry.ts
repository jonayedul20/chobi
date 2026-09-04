import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { isExpired, hashPassword } from "../../shared/albumSecurity.ts";

// Guests have no accounts, so a favorite belongs to an anonymous per-browser
// client_id. Access is still gated the same way as photos and chat: the
// album's password is verified server-side before anything is written.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const photoId = String(body.photo_id || "");
    const clientId = String(body.client_id || "").slice(0, 64);
    const password = body.password ? String(body.password) : "";
    if (!photoId || !clientId) return Response.json({ error: "MISSING_FIELDS" }, { status: 400 });

    const photos = await base44.asServiceRole.entities.Photo.filter({ id: photoId });
    const photo = photos?.[0];
    if (!photo) return Response.json({ error: "NOT_FOUND" }, { status: 404 });

    const albums = await base44.asServiceRole.entities.Album.filter({ id: photo.album_id });
    const album = albums?.[0];
    if (!album || isExpired(album)) return Response.json({ error: "EXPIRED" }, { status: 410 });

    if (album.has_password) {
      if (!password) return Response.json({ error: "PASSWORD_REQUIRED" }, { status: 401 });
      const hash = await hashPassword(password, album.password_salt);
      if (hash !== album.password_hash) return Response.json({ error: "WRONG_PASSWORD" }, { status: 403 });
    }

    const existing =
      (await base44.asServiceRole.entities.Favorite.filter({ photo_id: photoId, client_id: clientId })) ?? [];

    let faved;
    if (existing.length > 0) {
      await Promise.all(existing.map(f => base44.asServiceRole.entities.Favorite.delete(f.id)));
      faved = false;
    } else {
      await base44.asServiceRole.entities.Favorite.create({
        photo_id: photoId,
        album_id: album.id,
        client_id: clientId
      });
      faved = true;
    }

    const all = (await base44.asServiceRole.entities.Favorite.filter({ photo_id: photoId }, "created_date", 1000)) ?? [];
    return Response.json({ faved, count: all.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
