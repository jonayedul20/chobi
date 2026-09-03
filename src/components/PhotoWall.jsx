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
            src={p.signed_url}
            alt={p.file_name || "photo"}
            loading="lazy"
            className="w-full block transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </button>
      ))}
    </div>
  );
}