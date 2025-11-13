"use client";

import { useState } from "react";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // Clear both states immediately
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

      let result;
      try {
        result = await res.json();
      } catch (jsonError) {
        console.error("JSON parse error:", jsonError);
        setSuccess(false);
        setError("Yanıt işlenirken bir hata oluştu. Lütfen tekrar deneyin.");
        setLoading(false);
        return;
      }
      
      // Debug log
      console.log("Contact form response:", result);
      console.log("Response OK:", res.ok);
      console.log("Email sent:", result.emailSent);
      console.log("Email error:", result.emailError);

      if (res.ok) {
        // Check if email was sent successfully - prioritize emailSent
        if (result.emailSent === true) {
          console.log("Setting success message");
          try {
            e.currentTarget.reset();
            setError(""); // Clear error first
            setSuccess(true); // Then set success
          } catch (stateError) {
            console.error("Error updating state:", stateError);
            // Still show success even if state update fails
            setSuccess(true);
            setError("");
          }
        } else if (result.emailError) {
          // Email failed but form succeeded
          console.log("Setting error message (email failed)");
          try {
            e.currentTarget.reset();
            setSuccess(false);
            setError("Mesajınız kaydedildi ancak email gönderilemedi. Lütfen daha sonra tekrar deneyin veya doğrudan iletişime geçin.");
          } catch (stateError) {
            console.error("Error updating state:", stateError);
            setError("Mesajınız kaydedildi ancak email gönderilemedi. Lütfen daha sonra tekrar deneyin veya doğrudan iletişime geçin.");
          }
        } else {
          // No email sent (no API key) but form succeeded - show success anyway
          console.log("Setting success message (no email sent)");
          try {
            e.currentTarget.reset();
            setError("");
            setSuccess(true);
          } catch (stateError) {
            console.error("Error updating state:", stateError);
            setSuccess(true);
            setError("");
          }
        }
      } else {
        console.log("Response not OK, setting error");
        try {
          setSuccess(false);
          setError(result.error || "Bir hata oluştu. Lütfen tekrar deneyin.");
        } catch (stateError) {
          console.error("Error updating state:", stateError);
        }
      }
    } catch (err) {
      console.error("Catch block - setting error");
      console.error("Error details:", err);
      console.error("Error type:", typeof err);
      console.error("Error message:", err instanceof Error ? err.message : String(err));
      console.error("Error stack:", err instanceof Error ? err.stack : "No stack");
      setSuccess(false);
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
            className="border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-black dark:border-white/10 dark:bg-black dark:focus:border-white"
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
            className="border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-black dark:border-white/10 dark:bg-black dark:focus:border-white"
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
            className="border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-black dark:border-white/10 dark:bg-black dark:focus:border-white"
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
