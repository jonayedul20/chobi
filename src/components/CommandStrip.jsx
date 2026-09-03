import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Download, Link2, Lock, LockOpen } from "lucide-react";
import CountdownBadge from "@/components/CountdownBadge";
import { albumShareUrl } from "@/lib/albums";
import { useToast } from "@/components/ui/use-toast";

export default function CommandStrip({ album, showViewLink = true, onDownloadAll }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(albumShareUrl(album.slug));
      setCopied(true);
      toast({ title: "SHARE LINK COPIED" });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast({ title: "COPY FAILED", description: albumShareUrl(album.slug) });
    }
  };

  return (
    <div className="sticky bottom-14 lg:bottom-0 z-20 border-t-2 border-[#333] bg-[#111111] px-4 py-3 flex flex-wrap items-center gap-3">
      <CountdownBadge expiresAt={album.expires_at} />
      <button
        onClick={copy}
        className="inline-flex items-center gap-2 px-4 py-2 font-display font-bold uppercase text-xs bg-[#CCFF00] text-black hover:bg-white transition-colors"
      >
        <Link2 className="w-4 h-4" /> {copied ? "LINK COPIED" : "SHARE LINK"}
      </button>
      {onDownloadAll && (
        <button
          onClick={onDownloadAll}
          className="inline-flex items-center gap-2 px-4 py-2 font-display font-bold uppercase text-xs bg-transparent text-white border-2 border-[#333] hover:border-[#CCFF00] hover:text-[#CCFF00] transition-colors"
        >
          <Download className="w-4 h-4" /> DOWNLOAD ALL
        </button>
      )}
      <span className="inline-flex items-center gap-2 border-2 border-[#333] px-3 py-2 font-mono text-xs text-white uppercase">
        {album.has_password ? <Lock className="w-4 h-4 text-[#CCFF00]" /> : <LockOpen className="w-4 h-4 text-[#CCFF00]" />}
        {album.has_password ? "LOCKED" : "OPEN"}
      </span>
      {showViewLink && (
        <Link to={`/a/${album.slug}`} className="ml-auto font-mono text-xs text-white underline hover:text-[#CCFF00]">
          VIEW ALBUM →
        </Link>
      )}
    </div>
  );
}