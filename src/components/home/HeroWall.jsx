import React from "react";
import { Link } from "react-router-dom";
import { Loader2, Lock } from "lucide-react";
import PhotoWall from "@/components/PhotoWall";
import CommandStrip from "@/components/CommandStrip";

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
      <div className="bg-muted min-h-[60vh] lg:min-h-[calc(100vh-57px)] flex flex-col items-center justify-center gap-5 p-8 text-center">
        <h1 className="font-display font-semibold tracking-tighter text-foreground text-[clamp(40px,6vw,80px)] leading-[1.05]">
          RawSnap <span className="text-primary">Archive</span>
        </h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-xl">
          Full-resolution photo storage. No quality loss. Ever.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-[60vh] lg:min-h-[calc(100vh-57px)] flex flex-col">
      <div className="bg-muted px-6 py-14 md:py-20 text-center">
        <h1 className="font-display font-semibold tracking-tighter text-foreground text-[clamp(34px,5.5vw,72px)] leading-[1.05] break-words">
          {album.title}
        </h1>
        <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          {album.description || "Full-resolution photo storage. No quality loss. Ever."}
        </p>
        {album.has_password && (
          <div className="mt-8 flex flex-col items-center gap-3">
            <Lock className="w-6 h-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">This album is password protected.</p>
            <Link
              to={`/a/${album.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Enter password →
            </Link>
          </div>
        )}
      </div>
      {!album.has_password && photos?.length ? (
        <div className="px-4 md:px-8 py-10">
          <PhotoWall photos={photos} onOpen={onOpen} />
        </div>
      ) : !album.has_password ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <p className="text-sm text-muted-foreground">No photos published in this album yet.</p>
        </div>
      ) : null}
      <div className="mt-auto">
        <CommandStrip album={album} onDownloadAll={onDownloadAll} />
      </div>
    </div>
  );
}