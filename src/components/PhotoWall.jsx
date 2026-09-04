import React from "react";
import { Heart } from "lucide-react";

export default function PhotoWall({ photos, onOpen }) {
  return (
    <div className="columns-2 md:columns-3 xl:columns-4 gap-4">
      {photos.map((p, i) => (
        <button
          key={p.id}
          onClick={() => onOpen?.(i)}
          className="relative mb-4 block w-full rounded-2xl overflow-hidden group text-left cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <img
            src={p.thumb_url || p.signed_url}
            alt={p.file_name || "photo"}
            loading="lazy"
            decoding="async"
            style={p.width && p.height ? { aspectRatio: `${p.width} / ${p.height}` } : undefined}
            className="w-full block transition-transform duration-500 group-hover:scale-[1.03]"
          />
          {p.fav_count > 0 && (
            <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
              <Heart className="h-3 w-3 fill-current" /> {p.fav_count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
