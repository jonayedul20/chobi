import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    let payload;
    try {
      payload = await req.json();
    } catch {
      return Response.json({ error: "INVALID_BODY" }, { status: 400 });
    }

    const albumId = typeof payload.album_id === "string" ? payload.album_id.trim() : "";
    const text = typeof payload.text === "string" ? payload.text.trim().slice(0, 1000) : "";
    let authorName = typeof payload.author_name === "string" ? payload.author_name.trim().slice(0, 60) : "";

    if (!albumId || !text) {
      return Response.json({ error: "MISSING_FIELDS" }, { status: 400 });
    }

    const albums = await base44.asServiceRole.entities.Album.filter({ id: albumId });
    const album = albums?.[0];
    if (!album) return Response.json({ error: "NOT_FOUND" }, { status: 404 });

    const expired =
      album.status === "expired" ||
      (album.expires_at && new Date(album.expires_at).getTime() < Date.now());
    if (expired) return Response.json({ error: "EXPIRED" }, { status: 410 });

    // Signed-in users always post under their account identity.
    try {
      const user = await base44.auth.me();
      if (user) authorName = user.full_name || user.email || "Guest";
    } catch {
      // guest — keep the provided display name
    }

    // Denormalized read permission: only messages from albums anyone can open
    // are readable through the entity API. Everything else goes through
    // getAlbumMessages, which checks the album password first.
    const isListed = album.is_public !== false && !album.has_password;

    await base44.asServiceRole.entities.ChatMessage.create({
      album_id: albumId,
      text,
      author_name: authorName || "Guest",
      is_listed: isListed
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}