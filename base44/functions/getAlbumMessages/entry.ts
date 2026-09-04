import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { isExpired, hashPassword } from "../../shared/albumSecurity.ts";

// Returns one album's chat messages, but only after proving the caller may
// open that album. Used by password-protected albums, where row-level
// security cannot tell whether a guest entered the password.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const slug = String(body.slug || "");
    const password = body.password ? String(body.password) : "";

    const albums = await base44.asServiceRole.entities.Album.filter({ slug });
    const album = albums?.[0];
    if (!album) return Response.json({ error: "NOT_FOUND" }, { status: 404 });
    if (isExpired(album)) return Response.json({ error: "EXPIRED" }, { status: 410 });

    if (album.has_password) {
      if (!password) return Response.json({ error: "PASSWORD_REQUIRED" }, { status: 401 });
      const hash = await hashPassword(password, album.password_salt);
      if (hash !== album.password_hash) {
        return Response.json({ error: "WRONG_PASSWORD" }, { status: 403 });
      }
    }

    const messages =
      (await base44.asServiceRole.entities.ChatMessage.filter(
        { album_id: album.id },
        "created_date",
        500
      )) ?? [];

    return Response.json({
      messages: messages.map(m => ({
        id: m.id,
        album_id: m.album_id,
        text: m.text,
        author_name: m.author_name || "Guest",
        created_date: m.created_date
      }))
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
