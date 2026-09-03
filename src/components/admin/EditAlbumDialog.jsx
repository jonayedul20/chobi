import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { EXPIRY_OPTIONS, EXPIRY_HOURS, toLocalInputValue } from "@/lib/albums";

export default function EditAlbumDialog({ album, onOpenChange, onSaved }) {
  const { toast } = useToast();
  const [title, setTitle] = useState(album.title);
  const [description, setDescription] = useState(album.description || "");
  const [password, setPassword] = useState("");
  const [removePassword, setRemovePassword] = useState(false);
  const [isPublic, setIsPublic] = useState(album.is_public !== false);
  const [expiry, setExpiry] = useState(album.expires_at ? "custom" : "never");
  const [customDate, setCustomDate] = useState(toLocalInputValue(album.expires_at));
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      const payload = { album_id: album.id, title, description, is_public: isPublic };
      if (removePassword) payload.remove_password = true;
      else if (password) payload.password = password;
      if (expiry === "never") payload.expires_at = null;
      else if (expiry === "custom")
        payload.expires_at = customDate ? new Date(customDate).toISOString() : album.expires_at;
      else payload.expires_at = new Date(Date.now() + EXPIRY_HOURS[expiry] * 3600000).toISOString();

      await base44.functions.invoke("updateAlbum", payload);
      toast({ title: "ALBUM UPDATED" });
      onOpenChange(false);
      onSaved?.();
    } catch (err) {
      toast({ title: "UPDATE FAILED", description: err?.response?.data?.error || "Try again." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none border-2 border-black bg-[#FFFDF5] max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display font-extrabold uppercase tracking-tight">
            EDIT // {album.title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-title" className="font-display font-bold uppercase text-xs">TITLE</Label>
            <Input id="edit-title" value={title} onChange={e => setTitle(e.target.value)} className="rounded-none border-2 border-black font-display font-bold uppercase" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-desc" className="font-display font-bold uppercase text-xs">DESCRIPTION</Label>
            <Input id="edit-desc" value={description} onChange={e => setDescription(e.target.value)} className="rounded-none border-2 border-black font-body" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-password" className="font-display font-bold uppercase text-xs">NEW PASSWORD</Label>
            <Input id="edit-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="LEAVE BLANK = KEEP CURRENT" className="rounded-none border-2 border-black font-mono" />
            <div className="flex items-center gap-2 pt-1">
              <Switch id="edit-remove-password" checked={removePassword} onCheckedChange={setRemovePassword} />
              <Label htmlFor="edit-remove-password" className="font-display font-bold uppercase text-xs">REMOVE PASSWORD</Label>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="font-display font-bold uppercase text-xs">EXPIRY</Label>
            <Select value={expiry} onValueChange={setExpiry}>
              <SelectTrigger className="rounded-none border-2 border-black font-mono text-xs h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-none border-2 border-black">
                {EXPIRY_OPTIONS.map(o => (
                  <SelectItem key={o.value} value={o.value} className="font-mono text-xs uppercase rounded-none">{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {expiry === "custom" && (
              <Input type="datetime-local" value={customDate} onChange={e => setCustomDate(e.target.value)} className="rounded-none border-2 border-black font-mono text-xs" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <Switch id="edit-public" checked={isPublic} onCheckedChange={setIsPublic} />
            <Label htmlFor="edit-public" className="font-display font-bold uppercase text-xs">
              {isPublic ? "PUBLIC ON HOME" : "LINK ONLY"}
            </Label>
          </div>
          <button
            onClick={save}
            disabled={busy || !title.trim()}
            className="w-full bg-[#CCFF00] text-black border-2 border-black px-4 py-2 font-display font-bold uppercase text-xs disabled:opacity-50 hover:bg-black hover:text-[#CCFF00] transition-colors"
          >
            {busy ? "SAVING…" : "SAVE CHANGES"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}