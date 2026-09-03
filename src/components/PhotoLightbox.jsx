import React from "react";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import { formatBytes } from "@/lib/albums";

export default function PhotoLightbox({ photos, index, onIndex, onClose }) {
  const photo = photos[index];
  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
        <span className="text-xs text-white/60">
          {index + 1} / {photos.length}
        </span>
        <button
          onClick={onClose}
          aria-label="Close"
          className="text-white hover:bg-white/10 p-2 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center relative min-h-0 p-2">
        <img src={photo.signed_url} alt={photo.file_name || "photo"} className="max-h-full max-w-full object-contain" />
        {index > 0 && (
          <button
            onClick={() => onIndex(index - 1)}
            aria-label="Previous photo"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 text-white p-2.5 hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {index < photos.length - 1 && (
          <button
            onClick={() => onIndex(index + 1)}
            aria-label="Next photo"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 text-white p-2.5 hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-white/10 flex-wrap">
        <span className="text-xs text-white/60 truncate">
          {photo.file_name} {photo.size_bytes ? `· ${formatBytes(photo.size_bytes)}` : ""}
        </span>
        <a
          href={photo.signed_url}
          download
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-primary text-primary-foreground text-xs font-medium px-4 py-2 inline-flex items-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <Download className="w-4 h-4" /> Download original
        </a>
      </div>
    </div>
  );
}