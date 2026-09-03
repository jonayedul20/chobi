import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { makeSalt, hashPassword } from "../../shared/albumSecurity.ts";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const title = String(body.title || "").trim();
    if (!title) return Response.json({ error: "Title is required" }, { status: 400 });

    const albumData = {
      title,
      description: String(body.description || "").trim(),
      is_public: body.is_public !== false,
      status: "active",
      slug: Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 6),
      has_password: false,
      password_hash: "",
      password_salt: ""
    };
    if (body.expires_at) {
      albumData.expires_at = new Date(body.expires_at).toISOString();
    }
    if (body.password) {
      albumData.password_salt = makeSalt();
      albumData.password_hash = await hashPassword(String(body.password), albumData.password_salt);
      albumData.has_password = true;
    }
    const album = await base44.entities.Album.create(albumData);
    return Response.json({ album });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}