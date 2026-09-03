import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Send } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Input } from "@/components/ui/input";

const fmt = d =>
  new Date(d).toLocaleString([], { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });

export default function AlbumChat({ albumId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    let on = true;
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
  }, [albumId]);

  const sorted = useMemo(
    () => [...(messages ?? [])].sort((a, b) => new Date(a.created_date) - new Date(b.created_date)),
    [messages]
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [sorted.length]);

  const send = async e => {
    e.preventDefault();
    const t = text.trim();
    if (!t || sending) return;
    setSending(true);
    try {
      await base44.entities.ChatMessage.create({
        album_id: albumId,
        text: t,
        author_name: user?.full_name || user?.email || "GUEST"
      });
      setText("");
    } catch {
      // failed sends simply don't appear
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="p-5">
        <p className="font-display font-extrabold uppercase text-lg leading-tight tracking-tight">MEMBERS-ONLY CHAT</p>
        <p className="mt-2 text-sm text-[#777] font-body">
          Sign in with your Google account to join this album's group chat.
        </p>
        <Link
          to={`/login?returnTo=${encodeURIComponent(window.location.pathname)}`}
          className="mt-4 inline-block bg-[#CCFF00] text-black border-2 border-black px-4 py-2 font-display font-bold uppercase text-xs hover:bg-black hover:text-[#CCFF00] transition-colors"
        >
          SIGN IN WITH GOOGLE
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {sorted.length === 0 && (
          <p className="font-mono text-xs text-[#777] uppercase">No messages yet — start the conversation.</p>
        )}
        {sorted.map(m => (
          <div key={m.id} className="border-l-4 border-black pl-3">
            <div className="flex items-baseline gap-2">
              <span className="font-body font-bold text-xs uppercase">{m.author_name || "GUEST"}</span>
              <span className="font-mono text-[10px] text-[#777]">{fmt(m.created_date)}</span>
            </div>
            <p className="text-sm break-words font-body">{m.text}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="border-t-2 border-black p-3 flex gap-2">
        <Input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="TYPE A MESSAGE"
          className="rounded-none border-2 border-black font-body"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="bg-[#CCFF00] text-black border-2 border-black px-3 font-display font-bold uppercase text-xs disabled:opacity-50 hover:bg-black hover:text-[#CCFF00] transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}