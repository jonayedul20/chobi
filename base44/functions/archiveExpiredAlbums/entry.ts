import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { isExpired } from "../../shared/albumSecurity.ts";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const albums = (await base44.asServiceRole.entities.Album.filter({ status: "active" }, "created_date", 500)) ?? [];
    const expiredIds = albums.filter(a => isExpired(a)).map(a => a.id);
    if (expiredIds.length > 0) {
      await base44.asServiceRole.entities.Album.bulkUpdate(expiredIds.map(id => ({ id, status: "expired" })));
    }
    return Response.json({ ok: true, archived: expiredIds.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}