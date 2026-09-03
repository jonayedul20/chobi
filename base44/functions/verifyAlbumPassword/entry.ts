import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { isExpired, hashPassword } from "../../shared/albumSecurity.ts";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const slug = String(body.slug || "");
    const password = body.password ? String(body.password) : "";

    const albums = await base44.entities.Album.filter({ slug });
    const album = albums && albums[0];
    if (!album) return Response.json({ error: "NOT_FOUND" }, { status: 404 });
    if (isExpired(album)) return Response.json({ valid: false, reason: "EXPIRED" });
    if (!album.has_password) return Response.json({ valid: true });
    if (!password) return Response.json({ valid: false, reason: "PASSWORD_REQUIRED" });

    const hash = await hashPassword(password, album.password_salt);
    return Response.json({ valid: hash === album.password_hash });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}