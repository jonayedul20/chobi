import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { base44 } from "@/api/base44Client";

export default function DeleteAlbumButton({ album, onDeleted }) {
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    setBusy(true);
    try {
      await base44.entities.Photo.deleteMany({ album_id: album.id });
      await base44.entities.ChatMessage.deleteMany({ album_id: album.id });
      await base44.entities.Album.delete(album.id);
      onDeleted?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 hover:border-destructive/40 transition-colors">
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display font-semibold tracking-tight">
            Delete album?
          </AlertDialogTitle>
          <AlertDialogDescription>
            "{album.title}" and all its photos and chat history will be permanently deleted. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={remove}
            disabled={busy}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {busy ? "Deleting…" : "Delete forever"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}