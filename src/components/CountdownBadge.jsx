import React, { useEffect, useState } from "react";
import { getRemaining } from "@/lib/albums";

export default function CountdownBadge({ expiresAt }) {
  const [remaining, setRemaining] = useState(() => getRemaining(expiresAt));
  useEffect(() => {
    const t = setInterval(() => setRemaining(getRemaining(expiresAt)), 1000);
    return () => clearInterval(t);
  }, [expiresAt]);

  if (!expiresAt) {
    return <span className="inline-block px-3 py-1 font-mono text-xs bg-black text-white border-2 border-black uppercase">NO EXPIRY</span>;
  }
  if (remaining.expired) {
    return <span className="inline-block px-3 py-1 font-mono text-xs bg-black text-[#CCFF00] border-2 border-black uppercase">EXPIRED</span>;
  }
  return <span className="inline-block px-3 py-1 font-mono text-xs bg-[#CCFF00] text-black border-2 border-black uppercase">EXPIRES IN: {remaining.label}</span>;
}