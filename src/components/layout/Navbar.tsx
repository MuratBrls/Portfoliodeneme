"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-black/80">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 text-sm uppercase tracking-wide md:px-6">
        <div className="flex items-center gap-2 md:gap-4">
          <Link
            href="/"
            className="hidden rounded-full border border-black/20 bg-black/5 px-3 py-1.5 text-xs font-medium text-black transition-all duration-200 hover:bg-black hover:text-white hover:shadow-sm dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white dark:hover:text-black md:inline-block"
          >
            Home
          </Link>
          <Link href="/" className="font-semibold tracking-[0.2em] text-black dark:text-white transition-opacity hover:opacity-80 md:tracking-[0.3em]">
            KOLEKTIF
          </Link>
        </div>
        <div className="flex items-center gap-2 md:gap-6">
          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 text-xs font-medium text-black dark:text-white md:flex">
            <Link
              href="/artists"
              className="rounded-full border border-transparent px-3 py-1.5 transition-all duration-200 hover:border-black/20 hover:bg-black/5 dark:hover:border-white/20 dark:hover:bg-white/5"
            >
              Artists
            </Link>
            <Link
              href="/editorial"
              className="rounded-full border border-transparent px-3 py-1.5 transition-all duration-200 hover:border-black/20 hover:bg-black/5 dark:hover:border-white/20 dark:hover:bg-white/5"
            >
              Editorial
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-transparent px-3 py-1.5 transition-all duration-200 hover:border-black/20 hover:bg-black/5 dark:hover:border-white/20 dark:hover:bg-white/5"
            >
              Contact
            </Link>
          </div>
          
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full border border-black/20 bg-black/5 p-2 text-black transition-all duration-200 hover:bg-black hover:text-white hover:shadow-sm dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white dark:hover:text-black"
            aria-label="Toggle theme"
          >
            {mounted ? (
              theme === "dark" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2" />
                  <path d="M12 20v2" />
                  <path d="m4.93 4.93 1.41 1.41" />
                  <path d="m17.66 17.66 1.41 1.41" />
                  <path d="M2 12h2" />
                  <path d="M20 12h2" />
                  <path d="m6.34 17.66-1.41 1.41" />
                  <path d="m19.07 4.93-1.41 1.41" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              )
            ) : (
              <div className="h-4 w-4" />
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-full border border-black/20 bg-black/5 p-2 text-black transition-all duration-200 hover:bg-black hover:text-white hover:shadow-sm dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white dark:hover:text-black md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M3 12h18" />
                <path d="M3 6h18" />
                <path d="M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-black/5 bg-white/95 backdrop-blur-md dark:border-white/10 dark:bg-black/95 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 text-xs font-medium uppercase tracking-wide text-black dark:text-white">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-full border border-transparent px-4 py-2 transition-all duration-200 hover:border-black/20 hover:bg-black/5 dark:hover:border-white/20 dark:hover:bg-white/5"
            >
              Home
            </Link>
            <Link
              href="/artists"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-full border border-transparent px-4 py-2 transition-all duration-200 hover:border-black/20 hover:bg-black/5 dark:hover:border-white/20 dark:hover:bg-white/5"
            >
              Artists
            </Link>
            <Link
              href="/editorial"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-full border border-transparent px-4 py-2 transition-all duration-200 hover:border-black/20 hover:bg-black/5 dark:hover:border-white/20 dark:hover:bg-white/5"
            >
              Editorial
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-full border border-transparent px-4 py-2 transition-all duration-200 hover:border-black/20 hover:bg-black/5 dark:hover:border-white/20 dark:hover:bg-white/5"
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

