import React from "react";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import LiveFeed from "@/components/home/LiveFeed";

export default function ArchiveSidebar({ albums, user }) {
  return (
    <div className="flex flex-col">
      <div className="border-b-2 border-black p-4">
        <h2 className="font-display font-extrabold uppercase text-xl tracking-tight">ACTIVE ALBUMS</h2>
        <ul className="mt-3 space-y-2">
          {albums.length === 0 && (
            <li className="font-mono text-xs text-[#777] uppercase">Nothing active right now.</li>
          )}
          {albums.slice(0, 6).map(a => (
            <li key={a.id}>
              <Link
                to={`/a/${a.slug}`}
                className="flex items-center justify-between gap-2 border-2 border-black px-3 py-2 hover:bg-[#CCFF00] transition-colors"
              >
                <span className="font-body font-medium text-sm uppercase truncate">{a.title}</span>
                {a.has_password && <Lock className="w-3.5 h-3.5 shrink-0" />}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <LiveFeed albums={albums} user={user} />
    </div>
  );
}