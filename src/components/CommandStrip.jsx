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
      toast({ title: "Share link copied" });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast({ title: "Copy failed", description: albumShareUrl(album.slug) });
    }
  };

  return (
    <div className="sticky bottom-14 lg:bottom-0 z-20 border-t border-border bg-background/80 backdrop-blur-xl px-4 md:px-6 py-3 flex flex-wrap items-center gap-3">
      <CountdownBadge expiresAt={album.expires_at} />
      <button
        onClick={copy}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Link2 className="w-4 h-4" /> {copied ? "Link copied" : "Share link"}
      </button>
      {onDownloadAll && (
        <button
          onClick={onDownloadAll}
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-medium hover:border-primary hover:text-primary transition-colors"
        >
          <Download className="w-4 h-4" /> Download all
        </button>
      )}
      <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-2 text-xs text-muted-foreground">
        {album.has_password ? <Lock className="w-4 h-4" /> : <LockOpen className="w-4 h-4" />}
        {album.has_password ? "Password protected" : "Open"}
      </span>
      {showViewLink && (
        <Link to={`/a/${album.slug}`} className="ml-auto text-sm font-medium text-primary hover:underline underline-offset-4">
          View album →
        </Link>
      )}
    </div>
  );
}