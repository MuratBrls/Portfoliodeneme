export function Footer() {
  return (
    <footer className="border-t border-neutral-200/50 bg-neutral-100 py-6 text-xs uppercase tracking-[0.2em] text-neutral-700 dark:border-white/10 dark:bg-black dark:text-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 md:px-6">
        <span>© {new Date().getFullYear()} LUME Studio</span>
        <span className="opacity-70">Visual Direction • Production • Post</span>
      </div>
    </footer>
  );
}

