import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";

const fmt = d =>
  new Date(d).toLocaleString([], { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });

export default function LiveFeed({ albums }) {
  const [messages, setMessages] = useState(null);

  useEffect(() => {
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
  }, []);

  const albumById = Object.fromEntries((albums ?? []).map(a => [a.id, a]));

  return (
    <div className="p-5 md:p-6">
      <h2 className="font-display font-semibold text-lg tracking-tight">Live feed</h2>
      <ul className="mt-4 space-y-3 max-h-96 overflow-auto">
        {messages === null && <li className="text-sm text-muted-foreground">Loading…</li>}
        {messages?.length === 0 && <li className="text-sm text-muted-foreground">No messages yet.</li>}
        {(messages ?? []).map(m => (
          <li key={m.id} className="border-l-2 border-border pl-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-medium">{m.author_name || "Guest"}</span>
              <span className="text-[11px] text-muted-foreground">{fmt(m.created_date)}</span>
            </div>
            <p className="text-sm break-words">{m.text}</p>
            {albumById[m.album_id] && (
              <Link to={`/a/${albumById[m.album_id].slug}`} className="text-[11px] text-primary hover:underline">
                {albumById[m.album_id].title}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}