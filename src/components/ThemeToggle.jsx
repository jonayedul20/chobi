import React, { useState } from "react";
import { Moon, Sun } from "lucide-react";

const KEY = "chobi_theme";

// Sun/moon switch in the header. Until the visitor taps it, the app follows
// their system theme (set by the bootstrap script in index.html); a tap
// pins their choice in localStorage and wins from then on.
export default function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(KEY, next ? "dark" : "light");
    } catch {
      // Private mode: the choice still applies until the tab closes.
    }
    setDark(next);
  };

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgba(61,90,69,0.24)] dark:border-white/15 text-foreground transition-colors duration-200 hover:bg-white/60 dark:hover:bg-white/10"
    >
      {dark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  );
}
