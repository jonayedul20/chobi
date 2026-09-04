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
    const albumId = String(body.album_id || "");
    if (!albumId) return Response.json({ error: "album_id is required" }, { status: 400 });

    const updates = {};
    if (body.title !== undefined) updates.title = String(body.title).trim();
    if (body.description !== undefined) updates.description = String(body.description).trim();
    if (body.is_public !== undefined) updates.is_public = !!body.is_public;
    if (body.expires_at !== undefined) {
      updates.expires_at = body.expires_at ? new Date(body.expires_at).toISOString() : "";
    }
    if (body.status !== undefined) updates.status = body.status === "expired" ? "expired" : "active";

    if (body.remove_password) {
      updates.has_password = false;
      updates.password_hash = "";
      updates.password_salt = "";
    } else if (body.password) {
      updates.password_salt = makeSalt();
      updates.password_hash = await hashPassword(String(body.password), updates.password_salt);
      updates.has_password = true;
    }

    const album = await base44.entities.Album.update(albumId, updates);

    // An album's visibility decides who may read its chat. Re-sync the
    // denormalized flag on existing messages — otherwise adding a password
    // leaves old messages readable, and removing one leaves them stranded.
    const shouldList = album.is_public !== false && !album.has_password;
    const messages =
      (await base44.asServiceRole.entities.ChatMessage.filter(
        { album_id: albumId },
        "created_date",
        500
      )) ?? [];
    const stale = messages.filter(m => !!m.is_listed !== shouldList);
    if (stale.length > 0) {
      await base44.asServiceRole.entities.ChatMessage.bulkUpdate(
        stale.map(m => ({ id: m.id, is_listed: shouldList }))
      );
    }

    return Response.json({ album });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}