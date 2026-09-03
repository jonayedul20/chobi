import React from "react";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function HeaderBar({ search = "", onSearch, showSearch = true }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const initials = (user?.full_name || user?.email || "?").trim().slice(0, 2).toUpperCase();

  return (
    <header className="bg-black sticky top-0 z-30">
      <div className="flex items-center gap-3 px-4 py-3 max-w-[1600px] mx-auto">
        <Link to="/" className="font-display font-extrabold uppercase text-white text-xl tracking-tight shrink-0">
          RAW<span className="text-[#CCFF00]">SNAP</span>
        </Link>
        {showSearch && (
          <div className="relative hidden md:block flex-1 max-w-sm ml-4">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777]" />
            <Input
              value={search}
              onChange={e => onSearch?.(e.target.value)}
              placeholder="SEARCH THE ARCHIVE"
              className="pl-8 rounded-none border-2 border-[#333] bg-[#111111] text-white placeholder:text-[#777] font-mono text-xs h-9"
            />
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">
          {isAdmin && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 bg-[#CCFF00] text-black px-3 py-1.5 font-display font-bold uppercase text-xs hover:bg-white transition-colors"
            >
              <Plus className="w-4 h-4" /> NEW ALBUM
            </Link>
          )}
          {user ? (
            <Avatar className="border-2 border-[#CCFF00] rounded-none w-8 h-8">
              <AvatarFallback className="bg-black text-[#CCFF00] font-display font-bold text-xs rounded-none">{initials}</AvatarFallback>
            </Avatar>
          ) : (
            <Link
              to="/login"
              className="border-2 border-[#CCFF00] text-[#CCFF00] px-3 py-1.5 font-display font-bold uppercase text-xs hover:bg-[#CCFF00] hover:text-black transition-colors"
            >
              SIGN IN
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}