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
        title: "Upload complete",
        description: `${files.length} original file(s) stored at full resolution.`
      });
      onDone?.();
    } catch (err) {
      toast({ title: "Upload failed", description: err?.message || "Try again." });
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/40 p-4 space-y-2">
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
        className="inline-flex items-center gap-2 cursor-pointer rounded-full bg-primary text-primary-foreground px-4 py-2 text-xs font-medium hover:bg-primary/90 transition-colors"
      >
        <UploadCloud className="w-4 h-4" /> Select original files
      </label>
      {progress && (
        <p className="text-xs text-muted-foreground break-all">
          Uploading {progress.done + 1}/{progress.total}: {progress.name} <Loader2 className="w-3 h-3 animate-spin inline" />
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        Files are stored privately and untouched — visitors receive signed full-resolution copies.
      </p>
    </div>
  );
}