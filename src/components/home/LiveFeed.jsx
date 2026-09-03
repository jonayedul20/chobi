import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";

const fmt = d =>
  new Date(d).toLocaleString([], { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });

export default function LiveFeed({ albums, user }) {
  const [messages, setMessages] = useState(null);

  useEffect(() => {
    if (!user) return;
    let on = true;
    base44.entities.ChatMessage.list("-created_date", 20)
      .then(list => on && setMessages(list ?? []))
      .catch(() => on && setMessages([]));
    const unsub = base44.entities.ChatMessage.subscribe(ev => {
      if (ev.type === "create") setMessages(prev => [ev.data, ...(prev ?? [])].slice(0, 20));
      if (ev.type === "delete") setMessages(prev => (prev ?? []).filter(m => m.id !== ev.data.id));
    });
    return () => {
      on = false;
      if (unsub) unsub();
    };
  }, [user?.id]);

  const albumById = Object.fromEntries((albums ?? []).map(a => [a.id, a]));

  if (!user) {
    return (
      <div className="p-4">
        <h2 className="font-display font-extrabold uppercase text-xl tracking-tight">LIVE FEED</h2>
        <p className="mt-3 text-sm text-[#777] font-body">
          Sign in with your Google account to follow the conversation.
        </p>
        <Link
          to="/login"
          className="mt-3 inline-block bg-[#CCFF00] text-black border-2 border-black px-4 py-2 font-display font-bold uppercase text-xs hover:bg-black hover:text-[#CCFF00] transition-colors"
        >
          SIGN IN WITH GOOGLE
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="font-display font-extrabold uppercase text-xl tracking-tight">LIVE FEED</h2>
      <ul className="mt-3 space-y-3 max-h-96 overflow-auto">
        {messages === null && <li className="font-mono text-xs text-[#777] uppercase">Loading…</li>}
        {messages?.length === 0 && <li className="font-mono text-xs text-[#777] uppercase">No messages yet.</li>}
        {(messages ?? []).map(m => (
          <li key={m.id} className="border-l-4 border-black pl-3">
            <div className="flex items-baseline gap-2">
              <span className="font-body font-bold text-xs uppercase">{m.author_name || "GUEST"}</span>
              <span className="font-mono text-[10px] text-[#777]">{fmt(m.created_date)}</span>
            </div>
            <p className="text-sm break-words font-body">{m.text}</p>
            {albumById[m.album_id] && (
              <Link to={`/a/${albumById[m.album_id].slug}`} className="font-mono text-[10px] text-[#777] underline">
                {albumById[m.album_id].title}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}