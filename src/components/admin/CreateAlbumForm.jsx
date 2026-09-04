import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { EXPIRY_OPTIONS, EXPIRY_HOURS } from "@/lib/albums";

export default function CreateAlbumForm({ onCreated }) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [password, setPassword] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  // Default to no expiry. A silently expiring link is a bad surprise on a
  // client gallery — expiry is opt-in, chosen per album.
  const [expiry, setExpiry] = useState("never");
  const [customDate, setCustomDate] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async e => {
    e.preventDefault();
    if (!title.trim() || busy) return;
    let expires_at = null;
    if (expiry === "custom" && customDate) expires_at = new Date(customDate).toISOString();
    else if (EXPIRY_HOURS[expiry]) expires_at = new Date(Date.now() + EXPIRY_HOURS[expiry] * 3600000).toISOString();

    setBusy(true);
    try {
      await base44.functions.invoke("createAlbum", {
        title: title.trim(),
        description: description.trim(),
        password: password || null,
        is_public: isPublic,
        expires_at
      });
      toast({ title: "Album created", description: "A unique share link has been generated." });
      setTitle("");
      setDescription("");
      setPassword("");
      setCustomDate("");
      setExpiry("7d");
      onCreated?.();
    } catch (err) {
      toast({ title: "Create failed", description: err?.response?.data?.error || "Something went wrong." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl bg-card border border-border/60 shadow-sm p-6 md:p-8">
      <h2 className="font-display font-semibold text-xl tracking-tight">New album</h2>
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="album-title">Title</Label>
          <Input id="album-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Wedding · September 2026" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="album-password">Password (optional)</Label>
          <Input id="album-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank for open access" />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="album-desc">Description</Label>
          <Input id="album-desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="What's inside" />
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
        </div>
        {expiry === "custom" ? (
          <div className="space-y-1.5">
            <Label htmlFor="album-expiry">Expires at</Label>
            <Input id="album-expiry" type="datetime-local" value={customDate} onChange={e => setCustomDate(e.target.value)} className="text-sm" />
          </div>
        ) : (
          <div className="flex items-end">
            <div className="flex items-center gap-2 pb-2">
              <Switch id="album-public" checked={isPublic} onCheckedChange={setIsPublic} />
              <Label htmlFor="album-public" className="text-sm font-normal text-muted-foreground">
                {isPublic ? "Public on home" : "Link only"}
              </Label>
            </div>
          </div>
        )}
        <div className="md:col-span-2">
          <Button type="submit" disabled={!title.trim() || busy} className="w-full rounded-full h-11 font-medium">
            {busy ? "Creating…" : "Create album"}
          </Button>
        </div>
      </div>
    </form>
  );
}