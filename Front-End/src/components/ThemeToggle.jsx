"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <button
        aria-label="Toggle Theme"
        className={`grid h-11 w-11 place-items-center rounded-full border border-line bg-white/60 text-black dark:border-white/10 dark:bg-white/10 dark:text-white ${className}`}
      >
        <Moon size={18} />
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative grid h-11 w-11 place-items-center rounded-full border border-0 bg-white/60 text-black/80 transition-all duration-300 hover:scale-105 hover:bg-white hover:text-black dark:border-white/15 dark:bg-white/10 dark:text-white/90 dark:hover:bg-white/20 dark:hover:text-white ${className}`}
    >
      <div className="relative h-5 w-5">
        <Sun
          size={20}
          className={`absolute inset-0 transition-all duration-300 transform ${
            isDark
              ? "rotate-0 scale-100 opacity-100 text-amber-400"
              : "-rotate-90 scale-0 opacity-0"
          }`}
        />
        <Moon
          size={20}
          className={`absolute inset-0 transition-all duration-300 transform ${
            isDark
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100 text-slate-700"
          }`}
        />
      </div>
    </button>
  );
}
