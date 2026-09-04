import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const slug = String(body.slug || "");
    if (!slug) return Response.json({ error: "MISSING_SLUG" }, { status: 400 });

    const albums = await base44.asServiceRole.entities.Album.filter({ slug });
    const album = albums?.[0];
    if (!album) return Response.json({ error: "NOT_FOUND" }, { status: 404 });

    // Password hash and salt are never included. has_password only says
    // whether a gate should be shown, not what the password is.
    return Response.json({
      album: {
        id: album.id,
        title: album.title,
        slug: album.slug,
        description: album.description || "",
        has_password: !!album.has_password,
        status: album.status || "active",
        expires_at: album.expires_at || null
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
