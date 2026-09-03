import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";

const fmt = d =>
  new Date(d).toLocaleString([], { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });

export default function LiveFeed({ albums, user }) {
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
  const list = messages ?? [];

  return (
    <div>
      <p className="mb-3 text-xs font-bold uppercase tracking-[2px] text-muted-foreground">
        Real time
      </p>
      <h2 className="mb-[25px] font-display text-[36px] font-medium leading-[1.08] tracking-[-1.3px]">
        Live feed
      </h2>
      <ul className="flex max-h-[26rem] flex-col gap-[21px] overflow-auto">
        {messages === null && <li className="text-sm text-muted-foreground">Loading…</li>}
        {list.length === 0 && <li className="text-sm text-muted-foreground">No messages yet.</li>}
        {list.map((m, i) => {
          const album = albumById[m.album_id];
          const notLast = i < list.length - 1;
          return (
            <li
              key={m.id}
              className={cn("relative pb-5", notLast && "border-b border-dashed border-[#9bb19d]")}
            >
              {notLast && (
                <span
                  aria-hidden
                  className="absolute -bottom-[3px] left-[7px] h-[6px] w-[34px] -rotate-[4deg] border-t-2 border-[#6f8a73] opacity-70"
                />
              )}
              <strong className="block text-[15px] font-semibold">{m.author_name || "Guest"}</strong>
              <p className="mb-1.5 mt-1.5 break-words text-sm leading-[1.45] text-muted-foreground">
                {m.text}
              </p>
              <div className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                <span>{fmt(m.created_date)}</span>
                {album && (
                  <Link
                    to={`/a/${album.slug}`}
                    className="font-semibold text-primary underline-offset-2 hover:underline"
                  >
                    {album.title}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}