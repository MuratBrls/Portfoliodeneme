"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { GalleryWork, Artist } from "@/data/artists";

export function AdminWorksManager() {
  const [works, setWorks] = useState<GalleryWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [form, setForm] = useState({
    artistSlug: "",
    brand: "",
    projectTitle: "",
    type: "photo" as "photo" | "video",
    file: null as File | null,
  });
  const [editingVideoUrl, setEditingVideoUrl] = useState<string | null>(null);
  const [videoUrlForm, setVideoUrlForm] = useState<{ workId: string; videoUrl: string; artistSlug: string } | null>(null);
  const [savingVideoUrl, setSavingVideoUrl] = useState(false);

  useEffect(() => {
    loadInitial();
  }, []);

  const loadInitial = async () => {
    await Promise.all([loadWorks(), loadArtists()]);
  };

  const loadWorks = async (showRefreshState = false) => {
    if (showRefreshState) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const res = await fetch("/api/admin/works");
      if (res.ok) {
        const data = await res.json();
        setWorks(data.works || []);
      }
    } catch (error) {
      console.error("Error loading works:", error);
    } finally {
      if (showRefreshState) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const loadArtists = async () => {
    try {
      const res = await fetch("/api/admin/artists");
      if (res.ok) {
        const data = await res.json();
        setArtists(data.artists || []);
        if (!form.artistSlug && data.artists?.length) {
          setForm((f) => ({ ...f, artistSlug: data.artists[0].slug }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const isExternalUrl = (url: string) => {
    return url.startsWith("http://") || url.startsWith("https://");
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.file) {
      alert("Lütfen bir dosya seçin");
      return;
    }
    if (!form.artistSlug) {
      alert("Lütfen bir sanatçı seçin");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", form.file);
      fd.append("artistSlug", form.artistSlug);
      if (form.brand) fd.append("brand", form.brand);
      if (form.projectTitle) fd.append("projectTitle", form.projectTitle);
      fd.append("type", form.type);

      const res = await fetch("/api/admin/works", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        setForm({ artistSlug: form.artistSlug, brand: "", projectTitle: "", type: "photo", file: null });
        await loadWorks(true);
        if (data.message) {
          console.info(data.message);
        }
      } else {
        alert(data.error || "Yükleme sırasında hata oluştu");
      }
    } catch (err) {
      console.error(err);
      alert("Yükleme sırasında hata oluştu");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (work: GalleryWork) => {
    if (isExternalUrl(work.url)) {
      alert("Harici URL'lerden gelen görseller (ör. Unsplash) silinemez. Sadece yüklenmiş görseller silinebilir.");
      return;
    }

    if (!confirm(`Bu görseli silmek istediğinize emin misiniz?`)) {
      return;
    }

    setDeleting(work.id);
    try {
      const res = await fetch(`/api/admin/works?path=${encodeURIComponent(work.url)}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        setWorks((prev) => prev.filter((w) => w.id !== work.id));
        await loadWorks(true);
        if (data.message) {
          console.info(data.message);
        }
      } else {
        // Show detailed error message
        const errorMsg = data.error || "Görsel silinirken bir hata oluştu";
        const debugInfo = data.debug ? `\n\nDebug: ${JSON.stringify(data.debug, null, 2)}` : "";
        alert(errorMsg + debugInfo);
        console.error("Delete error:", data);
      }
    } catch (error) {
      console.error("Error deleting work:", error);
      alert("Görsel silinirken bir hata oluştu");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleUpload} className="rounded-md border border-neutral-200 p-4 dark:border-neutral-800">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em]">Görsel Yükle</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium">Sanatçı</label>
            <select
              value={form.artistSlug}
              onChange={(e) => setForm({ ...form, artistSlug: e.target.value })}
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
              required
            >
              {artists.map((a) => (
                <option key={a.slug} value={a.slug}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Tür</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as "photo" | "video" })}
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            >
              <option value="photo">Fotoğraf</option>
              <option value="video">Video</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Marka (opsiyonel)</label>
            <input
              type="text"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
              placeholder="Örn: Beymen"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Proje (opsiyonel)</label>
            <input
              type="text"
              value={form.projectTitle}
              onChange={(e) => setForm({ ...form, projectTitle: e.target.value })}
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
              placeholder="Örn: FW25/26"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium">Dosya</label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })}
              className="block w-full text-sm"
              required
            />
          </div>
        </div>
        <div className="mt-3">
          <button
            type="submit"
            disabled={uploading}
            className="rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-neutral-800 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            {uploading ? "Yükleniyor..." : "Yükle"}
          </button>
        </div>
      </form>
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Toplam {works.length} görsel
        </p>
        {refreshing && <span className="text-xs text-neutral-500 dark:text-neutral-400">Liste güncelleniyor…</span>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {works.map((work) => (
          <div
            key={work.id}
            className="group relative overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-800"
          >
            <div className="aspect-square relative bg-neutral-100 dark:bg-neutral-900">
              <Image
                src={work.url}
                alt={work.alt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            </div>
            <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Link
                    href={`/artists/${work.artistSlug}`}
                    className="rounded-full bg-white/90 px-4 py-2 text-xs font-medium text-black shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-white hover:shadow-lg"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(event) => event.stopPropagation()}
                  >
                    Portföyü Gör
                  </Link>
                  {work.type === "video" && (
                    <button
                      onClick={() => {
                        setVideoUrlForm({
                          workId: work.id,
                          videoUrl: work.videoUrl || "",
                          artistSlug: work.artistSlug,
                        });
                        setEditingVideoUrl(work.id);
                      }}
                      className="rounded-full bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg"
                    >
                      {work.videoUrl ? "Video URL Düzenle" : "Video URL Ekle"}
                    </button>
                  )}
                  {!isExternalUrl(work.url) && (
                    <button
                      onClick={() => handleDelete(work)}
                      disabled={deleting === work.id}
                      className="rounded-full bg-red-600 px-4 py-2 text-xs font-medium text-white shadow-md transition-all duration-200 hover:bg-red-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deleting === work.id ? "Siliniyor..." : "Sil"}
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="p-3">
              <p className="text-xs font-medium">{work.projectTitle}</p>
              <Link
                href={`/artists/${work.artistSlug}`}
                className="text-xs text-neutral-500 hover:underline dark:text-neutral-400"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => event.stopPropagation()}
              >
                {work.artistName}
              </Link>
              <p className="text-xs text-neutral-400 dark:text-neutral-500">{work.brand}</p>
              {work.type === "video" && work.videoUrl && (
                <p className="mt-1 text-xs text-green-600 dark:text-green-400">✓ Video URL: {work.videoUrl.substring(0, 30)}...</p>
              )}
              {work.type === "video" && !work.videoUrl && (
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">⚠ Video URL eklenmedi</p>
              )}
              {editingVideoUrl === work.id && videoUrlForm && (
                <div className="mt-3 space-y-2 rounded-md border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900">
                  <label className="block text-xs font-medium">YouTube veya Vimeo URL</label>
                  <input
                    type="text"
                    value={videoUrlForm.videoUrl}
                    onChange={(e) => setVideoUrlForm({ ...videoUrlForm, videoUrl: e.target.value })}
                    placeholder="https://youtube.com/watch?v=... veya https://vimeo.com/..."
                    className="w-full rounded-md border border-neutral-300 bg-white px-2 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        setSavingVideoUrl(true);
                        try {
                          const res = await fetch("/api/admin/works/video-url", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              workId: videoUrlForm.workId,
                              videoUrl: videoUrlForm.videoUrl || null,
                              artistSlug: videoUrlForm.artistSlug,
                            }),
                          });
                          if (res.ok) {
                            setEditingVideoUrl(null);
                            setVideoUrlForm(null);
                            await loadWorks(true);
                          } else {
                            const data = await res.json();
                            alert(data.error || "Video URL kaydedilemedi");
                          }
                        } catch (error) {
                          alert("Video URL kaydedilirken hata oluştu");
                        } finally {
                          setSavingVideoUrl(false);
                        }
                      }}
                      disabled={savingVideoUrl}
                      className="flex-1 rounded-md bg-black px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                    >
                      {savingVideoUrl ? "Kaydediliyor..." : "Kaydet"}
                    </button>
                    <button
                      onClick={() => {
                        setEditingVideoUrl(null);
                        setVideoUrlForm(null);
                      }}
                      className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {works.length === 0 && (
        <div className="text-center py-12 text-neutral-500">
          Henüz görsel eklenmemiş
        </div>
      )}
    </div>
  );
}

