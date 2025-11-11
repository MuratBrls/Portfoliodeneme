"use client";

import { useState } from "react";
import Link from "next/link";
import { AdminWorksManager } from "@/components/admin/AdminWorksManager";
import { AdminArtistsManager } from "@/components/admin/AdminArtistsManager";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"works" | "artists">("works");
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    // Force hard redirect to clear any cached state
    window.location.href = "/admin/login";
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-semibold uppercase tracking-[0.4em]">Admin Panel</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-full border border-black/20 bg-black/5 px-4 py-2 text-sm font-medium text-black transition-all duration-200 hover:bg-black hover:text-white hover:shadow-sm dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white dark:hover:text-black"
          >
            Home
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-full border border-red-500/50 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-all duration-200 hover:bg-red-500 hover:text-white hover:shadow-sm dark:border-red-500/30 dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white"
          >
            Çıkış Yap
          </button>
        </div>
      </div>

      <div className="mb-6 flex gap-2 border-b border-neutral-200 dark:border-neutral-800">
        <button
          onClick={() => setActiveTab("works")}
          className={`relative rounded-t-lg px-6 py-3 text-sm font-medium transition-all duration-200 ${
            activeTab === "works"
              ? "bg-black/5 text-black shadow-sm dark:bg-white/5 dark:text-white"
              : "text-neutral-500 hover:bg-black/5 hover:text-black dark:hover:bg-white/5 dark:hover:text-white"
          }`}
        >
          Görseller
          {activeTab === "works" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("artists")}
          className={`relative rounded-t-lg px-6 py-3 text-sm font-medium transition-all duration-200 ${
            activeTab === "artists"
              ? "bg-black/5 text-black shadow-sm dark:bg-white/5 dark:text-white"
              : "text-neutral-500 hover:bg-black/5 hover:text-black dark:hover:bg-white/5 dark:hover:text-white"
          }`}
        >
          Sanatçılar
          {activeTab === "artists" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white" />
          )}
        </button>
      </div>

      {activeTab === "works" && <AdminWorksManager />}
      {activeTab === "artists" && <AdminArtistsManager />}
    </main>
  );
}

