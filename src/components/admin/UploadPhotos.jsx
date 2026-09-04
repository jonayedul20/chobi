import React, { useRef, useState } from "react";
import { Loader2, UploadCloud } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { buildDerivatives } from "@/lib/imageResize";

export default function UploadPhotos({ albumId, onDone }) {
  const { toast } = useToast();
  const inputRef = useRef(null);
  const [progress, setProgress] = useState(null);

  const handleFiles = async e => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    let plainCount = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress({ done: i, total: files.length, name: file.name, stage: "Resizing" });

        // Derivatives are best-effort. If the browser can't decode the format
        // (HEIC, for one), we still store the original and the gallery falls
        // back to it.
        const { thumb, web, width, height } = await buildDerivatives(file);
        if (!thumb) plainCount++;

        setProgress({ done: i, total: files.length, name: file.name, stage: "Uploading" });

        const original = await base44.integrations.Core.UploadPrivateFile({ file });
        const thumbRes = thumb
          ? await base44.integrations.Core.UploadPrivateFile({ file: thumb })
          : null;
        const webRes = web
          ? await base44.integrations.Core.UploadPrivateFile({ file: web })
          : null;

        await base44.entities.Photo.create({
          album_id: albumId,
          file_uri: original.file_uri,
          thumb_uri: thumbRes?.file_uri || "",
          web_uri: webRes?.file_uri || "",
          file_name: file.name,
          size_bytes: file.size,
          width: width || undefined,
          height: height || undefined
        });
      }

      toast({
        title: "Upload complete",
        description:
          plainCount > 0
            ? `${files.length} original(s) stored. ${plainCount} could not be resized and will load at full size.`
            : `${files.length} original file(s) stored, with web-sized copies for fast viewing.`
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
          {progress.stage} {progress.done + 1}/{progress.total}: {progress.name}{" "}
          <Loader2 className="w-3 h-3 animate-spin inline" />
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        Originals are stored privately and untouched. Guests browse fast web-sized copies and
        download the full-resolution files.
      </p>
    </div>
  );
}
