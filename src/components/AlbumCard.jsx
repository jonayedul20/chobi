import React from "react";
import { Link } from "react-router-dom";
import { Lock, LockOpen } from "lucide-react";
import CountdownBadge from "@/components/CountdownBadge";

export default function AlbumCard({ album }) {
  return (
    <Link
      to={`/a/${album.slug}`}
      className="block rounded-[22px] border border-[rgba(61,90,69,0.17)] bg-white/58 p-[14px] transition-[box-shadow,background] duration-[250ms] hover:bg-white hover:shadow-[0_14px_28px_rgba(45,76,53,0.12)]"
    >
      <h3 className="break-words px-2 pb-2 pt-2 text-[21px] font-semibold leading-[1.2] tracking-[-0.5px]">
        {album.title}
      </h3>
      {album.description && (
        <p className="mb-1 mt-[9px] line-clamp-2 break-words px-2 text-sm leading-[1.45] text-muted-foreground">
          {album.description}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2 px-2 pb-2">
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-[18px] bg-[#e1ebe1] px-2.5 py-1.5 text-[11px] text-muted-foreground">
          {album.has_password
            ? <Lock className="h-3.5 w-3.5 text-primary" />
            : <LockOpen className="h-3.5 w-3.5 text-primary" />}
          {album.has_password ? "Password protected" : "Open"}
        </span>
        <CountdownBadge expiresAt={album.expires_at} />
      </div>
    </Link>
  );
}