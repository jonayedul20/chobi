import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PasswordGate({ album, error, busy, onSubmit }) {
  const [pw, setPw] = useState("");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl bg-card border border-border/60 shadow-sm p-10 text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-accent flex items-center justify-center">
          <Lock className="w-6 h-6 text-primary" />
        </div>
        <h1 className="mt-5 font-display font-semibold text-2xl tracking-tight break-words">{album.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This album is password protected. Enter the password to view and download the original
          full-resolution photos.
        </p>
        <form
          onSubmit={e => {
            e.preventDefault();
            if (pw) onSubmit(pw);
          }}
          className="mt-6 space-y-3"
        >
          <Input
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            placeholder="Password"
            autoFocus
            className="h-11 text-center"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={!pw || busy} className="w-full rounded-full h-11 font-medium">
            {busy ? "Checking…" : "Unlock album"}
          </Button>
        </form>
        <Link
          to="/"
          className="mt-6 inline-block text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to archive
        </Link>
      </div>
    </div>
  );
}