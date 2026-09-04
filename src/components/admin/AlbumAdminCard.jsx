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

const chip = "inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground";
const actionBtn =
  "inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs font-medium hover:bg-muted transition-colors";

export default function AlbumAdminCard({ album, onChanged }) {
  const { toast } = useToast();
  const [photoCount, setPhotoCount] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const expired = isAlbumExpired(album);

  const loadCount = () =>
    base44.entities.Photo.filter({ album_id: album.id }, "created_date", 500)
      .then(l => {
        const n = l?.length ?? 0;
        setPhotoCount(n);
        return n;
      })
      .catch(() => {
        setPhotoCount(0);
        return 0;
      });

  useEffect(() => {
    let on = true;
    loadCount().then(n => {
      // A freshly created album has nothing to show and no obvious next step.
      // Open the uploader for it instead of hiding it behind a button.
      if (on && n === 0) setUploading(true);
    });
    return () => {
      on = false;
    };
  }, [album.id]);

  const copy = async () => {
    await navigator.clipboard.writeText(albumShareUrl(album.slug));
    toast({ title: "Share link copied" });
  };

  return (
    <div className="rounded-2xl bg-card border border-border/60 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display font-semibold text-lg tracking-tight truncate">{album.title}</h3>
        <span className={`text-xs font-medium shrink-0 ${expired ? "text-muted-foreground" : "text-primary"}`}>
          {expired ? "Expired" : "Active"}
        </span>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <CountdownBadge expiresAt={album.expires_at} />
        <span className={chip}>
          {album.has_password ? <Lock className="w-3.5 h-3.5" /> : <LockOpen className="w-3.5 h-3.5" />}
          {album.has_password ? "Locked" : "Open"}
        </span>
        <span className={chip}>{album.is_public ? "Public" : "Link only"}</span>
        <span className={chip}>
          {photoCount === null ? "…" : photoCount === 0 ? "No photos yet" : `${photoCount} photos`}
        </span>
      </div>
      <p className="text-xs text-muted-foreground break-all">{albumShareUrl(album.slug)}</p>
      <div className="flex flex-wrap gap-2">
        <Link to={`/a/${album.slug}`} className={`${actionBtn} border-primary text-primary hover:bg-accent`}>
          <ExternalLink className="w-3.5 h-3.5" /> Open
        </Link>
        <button onClick={copy} className={actionBtn}>
          <Copy className="w-3.5 h-3.5" /> Copy link
        </button>
        <button
          onClick={() => setUploading(u => !u)}
          className={
            photoCount === 0
              ? `${actionBtn} border-primary bg-primary text-primary-foreground hover:bg-primary/90`
              : actionBtn
          }
        >
          <Upload className="w-3.5 h-3.5" /> Upload photos
        </button>
        <button onClick={() => setEditing(true)} className={actionBtn}>
          <Pencil className="w-3.5 h-3.5" /> Edit
        </button>
        <DeleteAlbumButton album={album} onDeleted={onChanged} />
      </div>
      {uploading && <UploadPhotos albumId={album.id} onDone={loadCount} />}
      {editing && <EditAlbumDialog album={album} onOpenChange={setEditing} onSaved={onChanged} />}
    </div>
  );
}