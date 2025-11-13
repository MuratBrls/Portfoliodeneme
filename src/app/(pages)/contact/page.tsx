"use client";

import { useState } from "react";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      project: formData.get("project"),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        e.currentTarget.reset();
        
        // If email failed but form succeeded, show a warning instead of success
        if (result.emailError) {
          setError("Mesajınız kaydedildi ancak email gönderilemedi. Lütfen daha sonra tekrar deneyin veya doğrudan iletişime geçin.");
          setSuccess(false);
        } else {
          setSuccess(true);
          setError(""); // Clear any previous errors
        }
      } else {
        setError(result.error || "Bir hata oluştu. Lütfen tekrar deneyin.");
        setSuccess(false);
      }
    } catch (err) {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-16 md:px-6">
      <header className="mb-12 space-y-3">
        <h1 className="text-3xl font-semibold uppercase tracking-[0.4em] text-black dark:text-white">Contact</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Yeni bir proje veya prodüksiyon için bize yazın. 24 saat içinde dönüş yapıyoruz.
        </p>
      </header>

      {success && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 shadow-sm dark:border-green-900 dark:bg-green-950 dark:text-green-200">
          Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-sm dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-xs uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400">
            Ad Soyad
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="border border-black/10 bg-white px-4 py-3 text-sm uppercase tracking-[0.2em] outline-none transition focus:border-black dark:border-white/10 dark:bg-black dark:focus:border-white"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-xs uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400">
            E-posta
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="border border-black/10 bg-white px-4 py-3 text-sm uppercase tracking-[0.2em] outline-none transition focus:border-black dark:border-white/10 dark:bg-black dark:focus:border-white"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="project" className="text-xs uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400">
            Proje Detayları
          </label>
          <textarea
            id="project"
            name="project"
            rows={5}
            className="border border-black/10 bg-white px-4 py-3 text-sm uppercase tracking-[0.2em] outline-none transition focus:border-black dark:border-white/10 dark:bg-black dark:focus:border-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full border border-black bg-black px-6 py-3 text-xs font-medium uppercase tracking-[0.3em] text-white shadow-sm transition-all duration-200 hover:bg-white hover:text-black hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed dark:border-white dark:bg-white dark:text-black dark:hover:bg-transparent dark:hover:text-white"
        >
          {loading ? "Gönderiliyor..." : "Gönder"}
        </button>
      </form>
    </main>
  );
}
