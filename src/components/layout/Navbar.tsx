"use client";

import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-black/80">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 text-sm uppercase tracking-wide md:px-6">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="rounded-full border border-black/20 bg-black/5 px-3 py-1.5 text-xs font-medium text-black transition-all duration-200 hover:bg-black hover:text-white hover:shadow-sm dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white dark:hover:text-black"
          >
            Home
          </Link>
          <Link href="/" className="font-semibold tracking-[0.3em] text-black dark:text-white transition-opacity hover:opacity-80">
            KOLEKTIF
          </Link>
        </div>
        <div className="flex items-center gap-6 text-xs font-medium text-black dark:text-white">
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
      </nav>
    </header>
  );
}

