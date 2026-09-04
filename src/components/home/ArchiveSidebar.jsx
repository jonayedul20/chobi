import React from "react";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";

const PANEL =
  "rounded-[28px] border border-[rgba(61,90,69,0.2)] bg-[rgba(250,252,249,0.64)] backdrop-blur shadow-[0_12px_34px_rgba(46,77,55,0.08)]";

export default function ArchiveSidebar({ albums }) {
  return (
    <aside className={`${PANEL} p-[30px]`}>
      <p className="mb-3 text-xs font-bold uppercase tracking-[2px] text-muted-foreground">
        Archive
      </p>
      <h2 className="font-display text-[36px] font-medium leading-[1.08] tracking-[-1.3px]">
        Active albums
      </h2>
      <ul className="mb-8 mt-5 space-y-2">
        {albums.length === 0 && (
          <li className="text-sm text-muted-foreground">Nothing active right now.</li>
        )}
        {albums.slice(0, 6).map(a => (
          <li key={a.id}>
            <Link
              to={`/a/${a.slug}`}
              className="flex items-center justify-between gap-2 rounded-[18px] border border-[rgba(61,90,69,0.17)] px-4 py-2.5 text-sm font-medium transition-[background,box-shadow] duration-200 hover:bg-white hover:shadow-[0_14px_28px_rgba(45,76,53,0.12)]"
            >
              <span className="truncate">{a.title}</span>
              {a.has_password && <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}