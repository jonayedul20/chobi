import React from "react";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import { formatBytes } from "@/lib/albums";

export default function PhotoLightbox({ photos, index, onIndex, onClose }) {
  const photo = photos[index];
  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#111111] flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#333]">
        <span className="font-mono text-xs text-[#CCFF00]">
          {String(index + 1).padStart(3, "0")} / {String(photos.length).padStart(3, "0")}
        </span>
        <button onClick={onClose} aria-label="Close" className="text-white hover:text-[#CCFF00] p-1">
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center relative min-h-0 p-2">
        <img src={photo.signed_url} alt={photo.file_name || "photo"} className="max-h-full max-w-full object-contain" />
        {index > 0 && (
          <button onClick={() => onIndex(index - 1)} aria-label="Previous photo" className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/80 border border-[#333] text-white p-2 hover:text-[#CCFF00]">
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {index < photos.length - 1 && (
          <button onClick={() => onIndex(index + 1)} aria-label="Next photo" className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/80 border border-[#333] text-white p-2 hover:text-[#CCFF00]">
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-[#333] flex-wrap">
        <span className="font-mono text-xs text-white/70 truncate">
          {photo.file_name} {photo.size_bytes ? `· ${formatBytes(photo.size_bytes)}` : ""}
        </span>
        <a
          href={photo.signed_url}
          download
          target="_blank"
          rel="noreferrer"
          className="bg-[#CCFF00] text-black font-display font-bold uppercase text-xs px-4 py-2 inline-flex items-center gap-2 hover:bg-white transition-colors"
        >
          <Download className="w-4 h-4" /> DOWNLOAD ORIGINAL
        </a>
      </div>
    </div>
  );
}