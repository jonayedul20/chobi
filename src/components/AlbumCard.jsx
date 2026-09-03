import React from "react";
import { Link } from "react-router-dom";
import { Lock, LockOpen } from "lucide-react";
import CountdownBadge from "@/components/CountdownBadge";

export default function AlbumCard({ album }) {
  return (
    <Link
      to={`/a/${album.slug}`}
      className="block rounded-2xl bg-card border border-border/70 p-6 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-0.5 transition-all duration-300"
    >
      <h3 className="font-display font-semibold text-xl leading-tight tracking-tight break-words">
        {album.title}
      </h3>
      {album.description && (
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{album.description}</p>
      )}
      <div className="mt-5 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
          {album.has_password
            ? <Lock className="w-3.5 h-3.5 text-primary" />
            : <LockOpen className="w-3.5 h-3.5 text-primary" />}
          {album.has_password ? "Password protected" : "Open"}
        </span>
        <CountdownBadge expiresAt={album.expires_at} />
      </div>
    </Link>
  );
}