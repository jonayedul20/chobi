import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PasswordGate({ album, error, busy, onSubmit }) {
  const [pw, setPw] = useState("");

  return (
    <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center p-4">
      <div className="w-full max-w-md border-2 border-black bg-white">
        <div className="border-b-2 border-black bg-black px-5 py-3 flex items-center justify-between">
          <span className="font-display font-extrabold uppercase tracking-tight text-[#CCFF00]">RESTRICTED ACCESS</span>
          <Link to="/" className="font-mono text-[10px] text-white/60 underline hover:text-white">BACK</Link>
        </div>
        <div className="p-6 space-y-4">
          <h1 className="font-display font-extrabold uppercase text-2xl leading-tight tracking-tight">{album.title}</h1>
          <p className="text-sm text-[#777] font-body">
            This album is password protected. Enter the password to view and download the original full-resolution photos.
          </p>
          <form
            onSubmit={e => {
              e.preventDefault();
              if (pw) onSubmit(pw);
            }}
            className="space-y-3"
          >
            <Input
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              placeholder="PASSWORD"
              autoFocus
              className="rounded-none border-2 border-black font-mono"
            />
            {error && (
              <p className="font-mono text-xs bg-[#CCFF00] border-2 border-black px-3 py-2 uppercase">{error}</p>
            )}
            <Button
              type="submit"
              disabled={!pw || busy}
              className="w-full rounded-none bg-[#CCFF00] text-black hover:bg-black hover:text-[#CCFF00] font-display font-bold uppercase"
            >
              {busy ? "CHECKING…" : "UNLOCK ALBUM"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}