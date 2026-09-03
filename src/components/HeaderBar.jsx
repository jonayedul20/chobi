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
    <header className="sticky top-0 z-30 animate-sage-rise flex h-[92px] items-center gap-6 md:gap-[34px] border-b border-[rgba(61,90,69,0.2)] bg-[rgba(230,236,230,0.74)] px-4 backdrop-blur-[18px] md:px-[74px]">
      <Link
        to="/"
        className="shrink-0 font-display text-[29px] font-semibold leading-none tracking-[-1.4px] text-foreground"
      >
        Cho<span className="text-primary">bi</span>
      </Link>
      {showSearch && (
        <div className="relative hidden w-[342px] md:block">
          <Search className="pointer-events-none absolute left-[17px] top-[12px] h-[18px] w-[18px] text-[#58715e]" />
          <Input
            value={search}
            onChange={e => onSearch?.(e.target.value)}
            placeholder="Search the archive"
            aria-label="Search the archive"
            className="h-[42px] rounded-[24px] border-[rgba(61,90,69,0.18)] bg-white/40 pl-11 pr-4 text-sm placeholder:text-muted-foreground transition-[background,box-shadow] duration-200 focus-visible:bg-white focus-visible:ring-0 focus-visible:shadow-[0_0_0_4px_rgba(61,90,69,0.16)]"
          />
        </div>
      )}
      <div className="ml-auto flex items-center gap-5 md:gap-[26px]">
        {user ? (
          <Avatar className="h-10 w-10 rounded-full border border-[rgba(61,90,69,0.24)]">
            <AvatarFallback className="rounded-full bg-[#c8d7c9] text-[13px] font-semibold text-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
        ) : (
          <Link
            to="/login"
            className="text-[15px] font-semibold text-primary transition-colors duration-200 hover:text-foreground"
          >
            Sign in
          </Link>
        )}
        {isAdmin && (
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 rounded-[24px] bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-[background,box-shadow,transform] duration-200 hover:bg-[#294432] hover:shadow-[0_8px_20px_rgba(36,64,45,0.18)] active:translate-y-px"
          >
            <Plus className="h-[15px] w-[15px]" /> New album
          </Link>
        )}
      </div>
    </header>
  );
}