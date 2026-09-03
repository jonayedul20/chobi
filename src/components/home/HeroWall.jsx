import React from "react";
import { Link } from "react-router-dom";
import { Loader2, Lock } from "lucide-react";
import PhotoWall from "@/components/PhotoWall";
import CommandStrip from "@/components/CommandStrip";

export default function HeroWall({ album, photos, loading, onOpen, onDownloadAll }) {
  if (loading || (album && !album.has_password && photos === null)) {
    return (
      <div className="bg-[#111111] min-h-[60vh] lg:min-h-[calc(100vh-56px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#CCFF00]" />
      </div>
    );
  }

  if (!album) {
    return (
      <div className="bg-[#111111] min-h-[60vh] lg:min-h-[calc(100vh-56px)] flex flex-col items-center justify-center gap-4 p-8 text-center">
        <h1 className="font-display font-extrabold uppercase text-white text-[clamp(36px,7vw,80px)] leading-[0.95] tracking-tight">
          RAW_SNAP <span className="text-[#CCFF00]">//</span> ARCHIVE
        </h1>
        <p className="font-mono text-xs text-[#777] uppercase">Full-resolution photo storage. No quality loss. Ever.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#111111] min-h-[60vh] lg:min-h-[calc(100vh-56px)] flex flex-col">
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 z-10 p-4 md:p-8 pointer-events-none bg-gradient-to-b from-black/80 to-transparent">
          <h1 className="font-display font-extrabold uppercase text-white text-[clamp(36px,7vw,80px)] leading-[0.95] tracking-tight break-words">
            RAW_SNAP <span className="text-[#CCFF00]">//</span> {album.title}
          </h1>
        </div>
        {album.has_password ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 p-8 pt-32 text-center [background:repeating-linear-gradient(45deg,#111111_0_24px,#161616_24px_48px)]">
            <Lock className="w-10 h-10 text-[#CCFF00]" />
            <p className="font-display font-extrabold uppercase text-white text-2xl tracking-tight">PASSWORD PROTECTED</p>
            <Link
              to={`/a/${album.slug}`}
              className="bg-[#CCFF00] text-black font-display font-bold uppercase text-xs px-4 py-2"
            >
              ENTER PASSWORD →
            </Link>
          </div>
        ) : photos?.length ? (
          <div className="pt-28 md:pt-36">
            <PhotoWall photos={photos} onOpen={onOpen} />
          </div>
        ) : (
          <div className="min-h-[50vh] flex items-center justify-center pt-28">
            <p className="font-mono text-xs text-[#777] uppercase">No frames published in this album yet.</p>
          </div>
        )}
      </div>
      <div className="mt-auto">
        <CommandStrip album={album} onDownloadAll={onDownloadAll} />
      </div>
    </div>
  );
}