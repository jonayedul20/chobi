import React from "react";
import { Link } from "react-router-dom";
import { Lock, LockOpen } from "lucide-react";
import CountdownBadge from "@/components/CountdownBadge";

export default function AlbumCard({ album }) {
  return (
    <Link
      to={`/a/${album.slug}`}
      className="block border-2 border-black bg-[#111111] hover:bg-black transition-colors"
    >
      <div className="p-4 flex flex-col gap-3">
        <h3 className="font-display font-extrabold uppercase text-white text-lg leading-tight tracking-tight break-words">
          {album.title}
        </h3>
        {album.description && (
          <p className="text-xs text-[#777] font-body line-clamp-2">{album.description}</p>
        )}
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 font-mono text-xs border-2 border-[#333] text-white uppercase">
            {album.has_password ? <Lock className="w-3.5 h-3.5 text-[#CCFF00]" /> : <LockOpen className="w-3.5 h-3.5 text-[#CCFF00]" />}
            {album.has_password ? "LOCKED" : "OPEN"}
          </span>
          <CountdownBadge expiresAt={album.expires_at} />
        </div>
      </div>
    </Link>
  );
}