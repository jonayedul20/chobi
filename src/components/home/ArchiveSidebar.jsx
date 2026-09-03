import React from "react";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import LiveFeed from "@/components/home/LiveFeed";

export default function ArchiveSidebar({ albums, user }) {
  return (
    <div className="flex flex-col">
      <div className="border-b border-border p-5 md:p-6">
        <h2 className="font-display font-semibold text-lg tracking-tight">Active albums</h2>
        <ul className="mt-4 space-y-2">
          {albums.length === 0 && (
            <li className="text-sm text-muted-foreground">Nothing active right now.</li>
          )}
          {albums.slice(0, 6).map(a => (
            <li key={a.id}>
              <Link
                to={`/a/${a.slug}`}
                className="flex items-center justify-between gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-accent hover:border-transparent transition-colors"
              >
                <span className="truncate">{a.title}</span>
                {a.has_password && <Lock className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <LiveFeed albums={albums} user={user} />
    </div>
  );
}