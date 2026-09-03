import React from "react";
import { Link } from "react-router-dom";
import { ImageIcon, Loader2, Lock, MessageCircle, Share2 } from "lucide-react";
import PhotoWall from "@/components/PhotoWall";
import CommandStrip from "@/components/CommandStrip";
import { getRemaining } from "@/lib/albums";

const FEATURES = [
  {
    icon: ImageIcon,
    title: "Full-resolution originals",
    text: "Every frame is stored and shared exactly as it was shot. No compression, ever.",
  },
  {
    icon: Lock,
    title: "Private, protected links",
    text: "Each album gets its own unique link — optionally guarded by a password.",
  },
  {
    icon: MessageCircle,
    title: "Real-time discussion",
    text: "Chat with everyone viewing the album, right next to the photos.",
  },
];

export default function HeroWall({ album, photos, loading, onOpen, onDownloadAll }) {
  if (loading || (album && !album.has_password && photos === null)) {
    return (
      <div className="bg-background min-h-[60vh] lg:min-h-[calc(100vh-57px)] flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-primary" />
      </div>
    );
  }

  if (!album) {
    return (
      <div className="bg-muted flex flex-col items-center">
        <div className="px-6 pt-16 md:pt-24 pb-12 text-center">
          <h1 className="font-display font-semibold tracking-tighter text-foreground text-[clamp(40px,6vw,80px)] leading-[1.05]">
            Chobi <span className="text-primary">Archive</span>
          </h1>
          <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
            Full-resolution photo storage. No quality loss. Ever.
          </p>
          <Link
            to="/login"
            className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Sign in to get started →
          </Link>
        </div>
        <div className="w-full max-w-5xl px-4 md:px-8 pb-16 grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <div key={f.title} className="rounded-2xl bg-card border border-border/60 p-6 text-center">
              <div className="mx-auto w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold text-sm tracking-tight">{f.title}</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const remaining = getRemaining(album.expires_at);
  const photoCount = album.has_password ? null : photos?.length ?? 0;

  return (
    <div className="bg-background min-h-[60vh] lg:min-h-[calc(100vh-57px)] flex flex-col">
      <div className="bg-muted px-6 py-14 md:py-16 text-center border-b border-border/50">
        <h1 className="font-display font-semibold tracking-tighter text-foreground text-[clamp(34px,5.5vw,72px)] leading-[1.05] break-words">
          {album.title}
        </h1>
        <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          {album.description || "Full-resolution photo storage. No quality loss. Ever."}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {photoCount !== null && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-card border border-border/60 px-3 py-1 text-xs text-muted-foreground">
              <ImageIcon className="w-3.5 h-3.5" /> {photoCount} {photoCount === 1 ? "photo" : "photos"}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-card border border-border/60 px-3 py-1 text-xs text-muted-foreground">
            {album.has_password ? <Lock className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            {album.has_password ? "Password protected" : "Open access"}
          </span>
          {album.expires_at && !remaining.expired && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-card border border-border/60 px-3 py-1 text-xs text-muted-foreground">
              Expires in {remaining.label}
            </span>
          )}
        </div>
      </div>
      {album.has_password ? (
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md rounded-3xl bg-card border border-border/60 shadow-sm p-10 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-accent flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h2 className="mt-5 font-display font-semibold text-xl tracking-tight">This album is locked</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter the password to view and download the full-resolution photos.
            </p>
            <Link
              to={`/a/${album.slug}`}
              className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Enter password →
            </Link>
          </div>
        </div>
      ) : photos?.length ? (
        <div className="px-4 md:px-8 py-10">
          <PhotoWall photos={photos} onOpen={onOpen} />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md rounded-3xl bg-muted p-10 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-card border border-border/60 flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-muted-foreground" />
            </div>
            <h2 className="mt-5 font-display font-semibold text-xl tracking-tight">Photos coming soon</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This album hasn't been published yet. Check back shortly.
            </p>
          </div>
        </div>
      )}
      <div className="mt-auto">
        <CommandStrip album={album} onDownloadAll={onDownloadAll} />
      </div>
    </div>
  );
}