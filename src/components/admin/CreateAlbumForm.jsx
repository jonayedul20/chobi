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
  const [expiry, setExpiry] = useState("7d");
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
      toast({ title: "ALBUM CREATED", description: "A unique share link has been generated." });
      setTitle("");
      setDescription("");
      setPassword("");
      setCustomDate("");
      setExpiry("7d");
      onCreated?.();
    } catch (err) {
      toast({ title: "CREATE FAILED", description: err?.response?.data?.error || "Something went wrong." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="border-2 border-black bg-white">
      <div className="bg-black px-4 py-3 border-b-2 border-black">
        <h2 className="font-display font-extrabold uppercase text-[#CCFF00] tracking-tight">NEW ALBUM</h2>
      </div>
      <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="album-title" className="font-display font-bold uppercase text-xs">TITLE *</Label>
          <Input id="album-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="WEDDING // 09.2026" className="rounded-none border-2 border-black font-display font-bold uppercase" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="album-password" className="font-display font-bold uppercase text-xs">PASSWORD (OPTIONAL)</Label>
          <Input id="album-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="LEAVE BLANK = NO PASSWORD" className="rounded-none border-2 border-black font-mono" />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="album-desc" className="font-display font-bold uppercase text-xs">DESCRIPTION</Label>
          <Input id="album-desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="WHAT'S INSIDE" className="rounded-none border-2 border-black font-body" />
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
        </div>
        {expiry === "custom" ? (
          <div className="space-y-1.5">
            <Label htmlFor="album-expiry" className="font-display font-bold uppercase text-xs">EXPIRES AT</Label>
            <Input id="album-expiry" type="datetime-local" value={customDate} onChange={e => setCustomDate(e.target.value)} className="rounded-none border-2 border-black font-mono text-xs" />
          </div>
        ) : (
          <div className="space-y-1.5 flex items-end">
            <div className="flex items-center gap-2 pb-2">
              <Switch id="album-public" checked={isPublic} onCheckedChange={setIsPublic} />
              <Label htmlFor="album-public" className="font-display font-bold uppercase text-xs">
                {isPublic ? "PUBLIC ON HOME" : "LINK ONLY"}
              </Label>
            </div>
          </div>
        )}
        <div className="md:col-span-2">
          <Button type="submit" disabled={!title.trim() || busy} className="w-full rounded-none bg-[#CCFF00] text-black hover:bg-black hover:text-[#CCFF00] font-display font-bold uppercase border-2 border-black">
            {busy ? "CREATING…" : "+ CREATE ALBUM"}
          </Button>
        </div>
      </div>
    </form>
  );
}