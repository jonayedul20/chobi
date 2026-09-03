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
        <button className="inline-flex items-center gap-1.5 border-2 border-black px-3 py-1.5 font-display font-bold uppercase text-xs hover:bg-red-600 hover:border-red-600 hover:text-white transition-colors">
          <Trash2 className="w-3.5 h-3.5" /> DELETE
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-none border-2 border-black bg-[#FFFDF5] max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display font-extrabold uppercase tracking-tight">
            DELETE ALBUM?
          </AlertDialogTitle>
          <AlertDialogDescription className="font-body">
            "{album.title}" and all its photos and chat history will be permanently deleted. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-none border-2 border-black font-display font-bold uppercase">
            CANCEL
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={remove}
            disabled={busy}
            className="rounded-none bg-red-600 text-white font-display font-bold uppercase hover:bg-black"
          >
            {busy ? "DELETING…" : "DELETE FOREVER"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}