import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { isExpired } from "../../shared/albumSecurity.ts";

// Only these fields ever leave the server. password_hash and password_salt
// are deliberately absent — they must never reach the browser.
function toPublicAlbum(album) {
  return {
    id: album.id,
    title: album.title,
    slug: album.slug,
    description: album.description || "",
    has_password: !!album.has_password,
    is_public: album.is_public !== false,
    status: album.status || "active",
    expires_at: album.expires_at || null,
    created_date: album.created_date
  };
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);

    let isAdmin = false;
    try {
      const user = await base44.auth.me();
      isAdmin = user?.role === "admin";
    } catch {
      // guest — not signed in
    }

    const albums = (await base44.asServiceRole.entities.Album.list("-created_date", 100)) ?? [];

    // Admins see everything. Everyone else sees active, public albums only —
    // link-only albums stay off the home page and are reachable by their slug.
    const visible = albums.filter(a => (isAdmin ? true : !isExpired(a) && a.is_public !== false));

    return Response.json({ albums: visible.map(toPublicAlbum) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
