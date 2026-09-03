import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
      toast({ title: "Album updated" });
      onOpenChange(false);
      onSaved?.();
    } catch (err) {
      toast({ title: "Update failed", description: err?.response?.data?.error || "Try again." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display font-semibold tracking-tight">
            Edit album
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-title">Title</Label>
            <Input id="edit-title" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-desc">Description</Label>
            <Input id="edit-desc" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-password">New password</Label>
            <Input
              id="edit-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Leave blank to keep current"
            />
            <div className="flex items-center gap-2 pt-1">
              <Switch id="edit-remove-password" checked={removePassword} onCheckedChange={setRemovePassword} />
              <Label htmlFor="edit-remove-password" className="text-sm font-normal text-muted-foreground">
                Remove password
              </Label>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Expiry</Label>
            <Select value={expiry} onValueChange={setExpiry}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPIRY_OPTIONS.map(o => (
                  <SelectItem key={o.value} value={o.value} className="text-sm">{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {expiry === "custom" && (
              <Input type="datetime-local" value={customDate} onChange={e => setCustomDate(e.target.value)} className="text-sm" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <Switch id="edit-public" checked={isPublic} onCheckedChange={setIsPublic} />
            <Label htmlFor="edit-public" className="text-sm font-normal text-muted-foreground">
              {isPublic ? "Public on home" : "Link only"}
            </Label>
          </div>
          <Button onClick={save} disabled={busy || !title.trim()} className="w-full rounded-full h-11 font-medium">
            {busy ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}