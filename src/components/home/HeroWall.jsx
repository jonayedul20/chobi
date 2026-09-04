import React from "react";
import { Link } from "react-router-dom";
import { ImageIcon, Loader2, Lock, Share2 } from "lucide-react";
import { Image } from "@/components/ui/image";
import { cn } from "@/lib/utils";
import CommandStrip from "@/components/CommandStrip";
import { getRemaining } from "@/lib/albums";

const PANEL =
  "rounded-[28px] border border-[rgba(61,90,69,0.2)] bg-[rgba(250,252,249,0.64)] backdrop-blur shadow-[0_12px_34px_rgba(46,77,55,0.08)]";
const PILL =
  "inline-flex items-center gap-1.5 rounded-[20px] bg-[#d6e3d6] px-[13px] py-2 text-xs font-bold text-primary";
const BLANK = "rounded-[17px] border border-dashed border-[#9bb19d] p-6 text-center";

export default function HeroWall({
  album,
  photos,
  loading,
  onOpen,
  onDownloadAll,
  downloadLabel = "Download all",
  downloadBusy = false
}) {
  if (loading || (album && !album.has_password && photos === null)) {
    return (
      <div className={`${PANEL} flex min-h-[480px] items-center justify-center`}>
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  if (!album) {
    return (
      <div className={`${PANEL} p-[30px] text-center md:p-10`}>
        <h2 className="font-display text-[36px] font-medium leading-[1.08] tracking-[-1.3px]">
          Featured album
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The archive is warming up — the newest album will feature here.
        </p>
      </div>
    );
  }

  const remaining = getRemaining(album.expires_at);
  const photoCount = album.has_password ? null : photos?.length ?? 0;

  return (
    <div className={`${PANEL} flex flex-col p-6 md:p-[30px]`}>
      <div className="mb-[25px] flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mb-3 text-xs font-bold uppercase tracking-[2px] text-muted-foreground">
            Featured album
          </p>
          <h2 className="font-display text-[clamp(26px,2.6vw,36px)] font-medium leading-[1.08] tracking-[-1.3px] break-words">
            {album.title}
          </h2>
          {album.description && (
            <p className="mt-2 max-w-[540px] text-sm text-muted-foreground">{album.description}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`${PILL} animate-sage-pulse`}>Live</span>
          {photoCount !== null && (
            <span className={PILL}>
              <ImageIcon className="h-3.5 w-3.5" /> {photoCount} {photoCount === 1 ? "photo" : "photos"}
            </span>
          )}
          <span className={PILL}>
            {album.has_password ? <Lock className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
            {album.has_password ? "Password protected" : "Open access"}
          </span>
          {album.expires_at && !remaining.expired && (
            <span className={PILL}>Expires in {remaining.label}</span>
          )}
        </div>
      </div>

      {album.has_password ? (
        <div className={`${BLANK} flex flex-col items-center gap-4 py-10`}>
          <Lock className="h-6 w-6 text-primary" />
          <p className="max-w-sm text-sm text-muted-foreground">
            This album is password protected. Enter the password on its page to view and download
            the full-resolution photos.
          </p>
          <Link
            to={`/a/${album.slug}`}
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors duration-200 hover:bg-[#294432]"
          >
            Enter password →
          </Link>
        </div>
      ) : photos?.length ? (
        <>
          <div className="grid auto-rows-[11rem] grid-cols-2 gap-3 md:grid-cols-[1.25fr_.75fr]">
            {photos.map((p, i) => (
              <button
                key={p.id}
                onClick={() => onOpen?.(i)}
                className={cn(
                  "group cursor-pointer overflow-hidden rounded-[18px] border-0 bg-transparent p-0",
                  i === 0 && "row-span-2"
                )}
              >
                <Image
                  src={p.thumb_url || p.signed_url}
                  alt={p.file_name || "Album photo"}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </button>
            ))}
          </div>
          <div className="mt-[22px] flex items-center justify-between gap-3 text-sm text-muted-foreground">
            <span className="truncate">
              {photoCount} full-resolution {photoCount === 1 ? "original" : "originals"}
            </span>
            {onDownloadAll && (
              <button
                onClick={onDownloadAll}
                disabled={downloadBusy}
                className="shrink-0 cursor-pointer rounded-[22px] border border-[#9ab09c] bg-transparent px-4 py-2.5 text-sm font-medium text-primary transition-[background,box-shadow] duration-200 hover:bg-[#dce8dc] hover:shadow-[0_5px_12px_rgba(61,90,69,0.12)] disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:shadow-none"
              >
                {downloadLabel}
              </button>
            )}
          </div>
        </>
      ) : (
        <div className={`${BLANK} flex flex-col items-center gap-3 py-10`}>
          <ImageIcon className="h-6 w-6 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Photos coming soon</h3>
          <p className="text-sm text-muted-foreground">
            This album hasn't been published yet. Check back shortly.
          </p>
        </div>
      )}

      <div className="mt-auto pt-6">
        <CommandStrip
          album={album}
          onDownloadAll={onDownloadAll}
          downloadLabel={downloadLabel}
          downloadBusy={downloadBusy}
        />
      </div>
    </div>
  );
}