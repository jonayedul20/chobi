import React, { useRef, useState } from "react";
import { Loader2, UploadCloud } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

export default function UploadPhotos({ albumId, onDone }) {
  const { toast } = useToast();
  const inputRef = useRef(null);
  const [progress, setProgress] = useState(null);

  const handleFiles = async e => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    try {
      for (let i = 0; i < files.length; i++) {
        setProgress({ done: i, total: files.length, name: files[i].name });
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file: files[i] });
        await base44.entities.Photo.create({
          album_id: albumId,
          file_uri,
          file_name: files[i].name,
          size_bytes: files[i].size
        });
      }
      toast({
        title: "UPLOAD COMPLETE",
        description: `${files.length} original file(s) stored at full resolution.`
      });
      onDone?.();
    } catch (err) {
      toast({ title: "UPLOAD FAILED", description: err?.message || "Try again." });
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="border-2 border-dashed border-black bg-[#FFFDF5] p-4 space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        className="hidden"
        id={`upload-${albumId}`}
      />
      <label
        htmlFor={`upload-${albumId}`}
        className="flex items-center gap-2 cursor-pointer font-display font-bold uppercase text-xs bg-black text-[#CCFF00] px-4 py-2 inline-block hover:bg-[#CCFF00] hover:text-black transition-colors"
      >
        <UploadCloud className="w-4 h-4" /> SELECT ORIGINAL FILES
      </label>
      {progress && (
        <p className="font-mono text-[10px] text-[#777] uppercase break-all">
          Uploading {progress.done + 1}/{progress.total}: {progress.name} <Loader2 className="w-3 h-3 animate-spin inline" />
        </p>
      )}
      <p className="font-mono text-[10px] text-[#777]">
        Files are stored privately and untouched — visitors receive signed full-resolution copies.
      </p>
    </div>
  );
}