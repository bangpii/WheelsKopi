"use client";

import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "wheelskopi-theme";

export function ThemeToggle() {
  const toggleTheme = () => {
    const root = document.documentElement;
    const isDark = root.classList.toggle("dark");
    localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Ganti tema terang atau gelap"
      className="group relative flex size-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <Sun className="hidden size-[18px] transition-transform duration-300 group-hover:rotate-12 dark:block" />
      <Moon className="size-[18px] transition-transform duration-300 group-hover:-rotate-12 dark:hidden" />
    </button>
  );
}
