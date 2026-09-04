import React from "react";

export default function PhotoWall({ photos, onOpen }) {
  return (
    <div className="columns-2 md:columns-3 xl:columns-4 gap-4">
      {photos.map((p, i) => (
        <button
          key={p.id}
          onClick={() => onOpen?.(i)}
          className="mb-4 block w-full rounded-2xl overflow-hidden group text-left cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <img
            // thumb_url is a small web copy; it falls back to the original on
            // photos uploaded before derivatives existed.
            src={p.thumb_url || p.signed_url}
            alt={p.file_name || "photo"}
            loading="lazy"
            decoding="async"
            width={p.width || undefined}
            height={p.height || undefined}
            // Reserving the real aspect ratio stops the masonry grid from
            // reflowing as each image arrives.
            style={p.width && p.height ? { aspectRatio: `${p.width} / ${p.height}` } : undefined}
            className="w-full block bg-muted transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </button>
      ))}
    </div>
  );
}
