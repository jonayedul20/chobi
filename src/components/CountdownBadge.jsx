import React, { useEffect, useState } from "react";
import { getRemaining } from "@/lib/albums";

export default function CountdownBadge({ expiresAt }) {
  const [remaining, setRemaining] = useState(() => getRemaining(expiresAt));
  useEffect(() => {
    const t = setInterval(() => setRemaining(getRemaining(expiresAt)), 1000);
    return () => clearInterval(t);
  }, [expiresAt]);

  if (!expiresAt) {
    return <span className="inline-block rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">No expiry</span>;
  }
  if (remaining.expired) {
    return <span className="inline-block rounded-full bg-destructive/10 px-3 py-1 text-xs text-destructive">Expired</span>;
  }
  return <span className="inline-block rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">Expires in {remaining.label}</span>;
}