import React from "react";

export default function PhotoWall({ photos, onOpen }) {
  return (
    <div className="columns-2 md:columns-3 xl:columns-4 gap-0">
      {photos.map((p, i) => (
        <button
          key={p.id}
          onClick={() => onOpen?.(i)}
          className="block w-full border border-[#333] overflow-hidden group text-left cursor-zoom-in"
        >
          <img
            src={p.signed_url}
            alt={p.file_name || "photo"}
            loading="lazy"
            className="w-full block transition-transform duration-300 group-hover:scale-105"
          />
        </button>
      ))}
    </div>
  );
}