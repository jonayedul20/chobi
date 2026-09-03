import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Copy, ExternalLink, Lock, LockOpen, Pencil, Upload } from "lucide-react";
import { base44 } from "@/api/base44Client";
import CountdownBadge from "@/components/CountdownBadge";
import { isAlbumExpired, albumShareUrl } from "@/lib/albums";
import { useToast } from "@/components/ui/use-toast";
import UploadPhotos from "@/components/admin/UploadPhotos";
import EditAlbumDialog from "@/components/admin/EditAlbumDialog";
import DeleteAlbumButton from "@/components/admin/DeleteAlbumButton";

const actionBtn =
  "inline-flex items-center gap-1.5 border-2 border-black px-3 py-1.5 font-display font-bold uppercase text-xs hover:bg-black hover:text-white transition-colors";

export default function AlbumAdminCard({ album, onChanged }) {
  const { toast } = useToast();
  const [photoCount, setPhotoCount] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const expired = isAlbumExpired(album);

  const loadCount = () =>
    base44.entities.Photo.filter({ album_id: album.id }, "created_date", 500)
      .then(l => setPhotoCount(l?.length ?? 0))
      .catch(() => setPhotoCount(0));

  useEffect(() => {
    loadCount();
  }, [album.id]);

  const copy = async () => {
    await navigator.clipboard.writeText(albumShareUrl(album.slug));
    toast({ title: "SHARE LINK COPIED" });
  };

  return (
    <div className="border-2 border-black bg-white">
      <div className="bg-black px-4 py-2 flex items-center justify-between gap-2">
        <h3 className="font-display font-extrabold uppercase text-white truncate tracking-tight">{album.title}</h3>
        <span className={`font-mono text-[10px] shrink-0 uppercase ${expired ? "text-[#777]" : "text-[#CCFF00]"}`}>
          {expired ? "EXPIRED" : "ACTIVE"}
        </span>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <CountdownBadge expiresAt={album.expires_at} />
          <span className="inline-flex items-center gap-1 border-2 border-black px-3 py-1 font-mono text-xs uppercase">
            {album.has_password ? <Lock className="w-3.5 h-3.5" /> : <LockOpen className="w-3.5 h-3.5" />}
            {album.has_password ? "LOCKED" : "OPEN"}
          </span>
          <span className="border-2 border-black px-3 py-1 font-mono text-xs uppercase">
            {album.is_public ? "PUBLIC" : "LINK ONLY"}
          </span>
          <span className="border-2 border-black px-3 py-1 font-mono text-xs uppercase">
            FRAMES: {photoCount ?? "…"}
          </span>
        </div>
        <p className="font-mono text-[10px] text-[#777] break-all">{albumShareUrl(album.slug)}</p>
        <div className="flex flex-wrap gap-2">
          <Link to={`/a/${album.slug}`} className={`${actionBtn} bg-[#CCFF00] text-black hover:text-[#CCFF00]`}>
            <ExternalLink className="w-3.5 h-3.5" /> OPEN
          </Link>
          <button onClick={copy} className={actionBtn}>
            <Copy className="w-3.5 h-3.5" /> COPY LINK
          </button>
          <button onClick={() => setUploading(u => !u)} className={actionBtn}>
            <Upload className="w-3.5 h-3.5" /> PHOTOS
          </button>
          <button onClick={() => setEditing(true)} className={actionBtn}>
            <Pencil className="w-3.5 h-3.5" /> EDIT
          </button>
          <DeleteAlbumButton album={album} onDeleted={onChanged} />
        </div>
        {uploading && <UploadPhotos albumId={album.id} onDone={loadCount} />}
        {editing && <EditAlbumDialog album={album} onOpenChange={setEditing} onSaved={onChanged} />}
      </div>
    </div>
  );
}