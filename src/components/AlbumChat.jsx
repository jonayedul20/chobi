import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Send, UserRound } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const NAME_KEY = "chobi_display_name";
const POLL_MS = 3000;

const fmt = d =>
  new Date(d).toLocaleString([], { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });

// `onCount` should be a stable function (a useState setter is ideal) — it is
// called whenever the message count changes so the parent can badge the tab.
export default function AlbumChat({ albumId, slug, hasPassword = false, onCount }) {
  const { user } = useAuth();
  const [guestName, setGuestName] = useState(() => localStorage.getItem(NAME_KEY) || "");
  const [nameDraft, setNameDraft] = useState("");
  const [messages, setMessages] = useState(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  // Password-protected albums can't read ChatMessage directly: row-level
  // security has no way to know a guest typed the right password. Those
  // albums poll a gated backend function instead of using realtime updates.
  const fetchGated = useCallback(async () => {
    const pw = sessionStorage.getItem(`rawsnap_pw_${slug}`) ?? "";
    const res = await base44.functions.invoke("getAlbumMessages", { slug, password: pw });
    return res.data?.messages ?? [];
  }, [slug]);

  useEffect(() => {
    let on = true;

    if (hasPassword) {
      const tick = () =>
        fetchGated()
          .then(list => on && setMessages(list))
          .catch(() => on && setMessages(prev => prev ?? []));
      tick();
      const timer = setInterval(tick, POLL_MS);
      return () => {
        on = false;
        clearInterval(timer);
      };
    }

    base44.entities.ChatMessage.filter({ album_id: albumId }, "created_date", 200)
      .then(list => on && setMessages(list ?? []))
      .catch(() => on && setMessages([]));
    const unsub = base44.entities.ChatMessage.subscribe(ev => {
      if (ev.data?.album_id !== albumId) return;
      setMessages(prev => {
        const base = prev ?? [];
        if (ev.type === "delete") return base.filter(m => m.id !== ev.data.id);
        const idx = base.findIndex(m => m.id === ev.data.id);
        if (idx >= 0) {
          const copy = [...base];
          copy[idx] = ev.data;
          return copy;
        }
        return [...base, ev.data];
      });
    });
    return () => {
      on = false;
      if (unsub) unsub();
    };
  }, [albumId, hasPassword, fetchGated]);

  const sorted = useMemo(
    () => [...(messages ?? [])].sort((a, b) => new Date(a.created_date) - new Date(b.created_date)),
    [messages]
  );

  useEffect(() => {
    onCount?.(messages === null ? null : messages.length);
  }, [messages, onCount]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [sorted.length]);

  const saveName = e => {
    e.preventDefault();
    const n = nameDraft.trim();
    if (!n) return;
    localStorage.setItem(NAME_KEY, n);
    setGuestName(n);
  };

  const send = async e => {
    e.preventDefault();
    const t = text.trim();
    if (!t || sending) return;
    setSending(true);
    try {
      await base44.functions.invoke("postChatMessage", {
        album_id: albumId,
        text: t,
        author_name: user?.full_name || user?.email || guestName || "Guest"
      });
      setText("");
      // Polling mode won't show the message for up to POLL_MS, so pull once now.
      if (hasPassword) {
        const list = await fetchGated().catch(() => null);
        if (list) setMessages(list);
      }
    } catch {
      // failed sends simply don't appear
    } finally {
      setSending(false);
    }
  };

  if (!user && !guestName) {
    return (
      <div className="p-6 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
          <UserRound className="w-5 h-5 text-primary" />
        </div>
        <h3 className="mt-4 font-display font-semibold text-lg tracking-tight">Join the conversation</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Tell us your name to start chatting — no account needed.
        </p>
        <form onSubmit={saveName} className="mt-5 w-full max-w-xs space-y-3">
          <Input
            value={nameDraft}
            onChange={e => setNameDraft(e.target.value)}
            placeholder="Your name"
            maxLength={60}
            autoFocus
          />
          <Button type="submit" disabled={!nameDraft.trim()} className="w-full rounded-full">
            Start chatting
          </Button>
        </form>
        <p className="mt-4 text-xs text-muted-foreground">
          Or{" "}
          <Link
            to={`/login?returnTo=${encodeURIComponent(window.location.pathname)}`}
            className="text-primary hover:underline"
          >
            sign in
          </Link>{" "}
          for a persistent identity.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {sorted.length === 0 && (
          <p className="text-xs text-muted-foreground">No messages yet — start the conversation.</p>
        )}
        {sorted.map(m => (
          <div key={m.id} className="rounded-xl bg-muted/60 px-3 py-2">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-medium">{m.author_name || "Guest"}</span>
              <span className="text-[11px] text-muted-foreground">{fmt(m.created_date)}</span>
            </div>
            <p className="text-sm break-words">{m.text}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="border-t border-border p-3 flex gap-2">
        <Input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type a message"
          maxLength={1000}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!text.trim() || sending}
          className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
