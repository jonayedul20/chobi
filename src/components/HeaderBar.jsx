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
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/60">
      <div className="flex items-center gap-3 px-4 md:px-8 py-3 max-w-[1600px] mx-auto">
        <Link to="/" className="font-display font-semibold text-xl tracking-tight text-foreground shrink-0">
          Cho<span className="text-primary">bi</span>
        </Link>
        {showSearch && (
          <div className="relative hidden md:block flex-1 max-w-sm ml-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => onSearch?.(e.target.value)}
              placeholder="Search the archive"
              className="pl-9 h-9 rounded-full border border-transparent bg-muted text-sm placeholder:text-muted-foreground"
            />
          </div>
        )}
        <div className="ml-auto flex items-center gap-3">
          {isAdmin && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 py-1.5 text-xs font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" /> New album
            </Link>
          )}
          {user ? (
            <Avatar className="w-8 h-8 rounded-full border border-border">
              <AvatarFallback className="bg-muted text-foreground text-xs font-medium rounded-full">{initials}</AvatarFallback>
            </Avatar>
          ) : (
            <Link
              to="/login"
              className="text-sm font-medium text-primary hover:underline underline-offset-4"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}