"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Artist } from "@/data/artists";

export function AdminArtistsManager() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    specialty: "Photographer" as Artist["specialty"],
    instagram: "",
    email: "",
    phone: "",
  });
  const [newArtist, setNewArtist] = useState({ 
    slug: "", 
    name: "", 
    bio: "", 
    specialty: "Photographer" as Artist["specialty"],
    instagram: "",
    email: "",
    phone: "",
  });
  const [profileUploading, setProfileUploading] = useState<string | null>(null);

  useEffect(() => {
    loadArtists();
  }, []);

  const loadArtists = async () => {
    try {
      const res = await fetch("/api/admin/artists");
      if (res.ok) {
        const data = await res.json();
        setArtists(data.artists || []);
      }
    } catch (error) {
      console.error("Error loading artists:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (artist: Artist) => {
    setEditing(artist.slug);
    setFormData({
      name: artist.name,
      bio: artist.bio,
      specialty: artist.specialty,
      instagram: artist.instagram || "",
      email: artist.email || "",
      phone: artist.phone || "",
    });
  };

  const handleSave = async (slug: string) => {
    try {
      const res = await fetch("/api/admin/artists", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          ...formData,
        }),
      });

      if (res.ok) {
        setEditing(null);
        // Reload artists data
        await loadArtists();
      } else {
        alert("Güncelleme sırasında bir hata oluştu");
      }
    } catch (error) {
      console.error("Error updating artist:", error);
      alert("Güncelleme sırasında bir hata oluştu");
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setFormData({ name: "", bio: "", specialty: "Photographer", instagram: "", email: "", phone: "" });
  };

  const handleCreateArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArtist.slug || !newArtist.name) {
      alert("Slug ve isim zorunludur");
      return;
    }
    try {
      const res = await fetch("/api/admin/artists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newArtist),
      });
      const data = await res.json();
      if (res.ok) {
        setNewArtist({ slug: "", name: "", bio: "", specialty: "Photographer", instagram: "", email: "", phone: "" });
        await loadArtists();
      } else {
        alert(data.error || "Sanatçı eklenemedi");
      }
    } catch (e) {
      console.error(e);
      alert("Sanatçı eklenemedi");
    }
  };

  const handleDeleteArtist = async (slug: string) => {
    if (!confirm("Sanatçıyı ve tüm görsellerini silmek istiyor musunuz?")) return;
    try {
      const res = await fetch(`/api/admin/artists?slug=${encodeURIComponent(slug)}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        await loadArtists();
      } else {
        alert(data.error || "Sanatçı silinemedi");
      }
    } catch (e) {
      console.error(e);
      alert("Sanatçı silinemedi");
    }
  };

  const handleUploadProfile = async (slug: string, file: File) => {
    setProfileUploading(slug);
    try {
      const fd = new FormData();
      fd.append("slug", slug);
      fd.append("file", file);
      const res = await fetch("/api/admin/artists/profile", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        await loadArtists();
      } else {
        alert(data.error || "Profil yüklenemedi");
      }
    } catch (e) {
      console.error(e);
      alert("Profil yüklenemedi");
    } finally {
      setProfileUploading(null);
    }
  };

  const handleDeleteProfile = async (slug: string) => {
    if (!confirm("Profil fotoğrafını silmek istiyor musunuz?")) return;
    try {
      const res = await fetch(`/api/admin/artists/profile?slug=${encodeURIComponent(slug)}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        await loadArtists();
      } else {
        alert(data.error || "Profil silinemedi");
      }
    } catch (e) {
      console.error(e);
      alert("Profil silinemedi");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreateArtist} className="rounded-md border border-neutral-200 p-4 dark:border-neutral-800">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em]">Sanatçı Ekle</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium mb-1">Slug</label>
            <input
              type="text"
              value={newArtist.slug}
              onChange={(e) => setNewArtist({ ...newArtist, slug: e.target.value })}
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
              placeholder="ornek-sanatci"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">İsim</label>
            <input
              type="text"
              value={newArtist.name}
              onChange={(e) => setNewArtist({ ...newArtist, name: e.target.value })}
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Uzmanlık</label>
            <select
              value={newArtist.specialty}
              onChange={(e) => setNewArtist({ ...newArtist, specialty: e.target.value as Artist["specialty"] })}
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            >
              <option value="Photographer">Photographer</option>
              <option value="Editor">Editor</option>
              <option value="Retoucher">Retoucher</option>
              <option value="Videographer">Videographer</option>
              <option value="Assistant">Assistant</option>
              <option value="Graphic Designer">Graphic Designer</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium mb-1">Biyografi</label>
            <textarea
              rows={2}
              value={newArtist.bio}
              onChange={(e) => setNewArtist({ ...newArtist, bio: e.target.value })}
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Instagram</label>
            <input
              type="text"
              value={newArtist.instagram}
              onChange={(e) => setNewArtist({ ...newArtist, instagram: e.target.value })}
              placeholder="@username veya URL"
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Email</label>
            <input
              type="email"
              value={newArtist.email}
              onChange={(e) => setNewArtist({ ...newArtist, email: e.target.value })}
              placeholder="email@example.com"
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Telefon</label>
            <input
              type="tel"
              value={newArtist.phone}
              onChange={(e) => setNewArtist({ ...newArtist, phone: e.target.value })}
              placeholder="+90 555 123 45 67"
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>
        </div>
        <div className="mt-3">
          <button
            type="submit"
            className="rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-neutral-800 hover:shadow-md dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            Ekle
          </button>
        </div>
      </form>
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Toplam {artists.length} sanatçı
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {artists.map((artist) => (
          <div
            key={artist.id}
            className="rounded-md border border-neutral-200 p-4 dark:border-neutral-800"
          >
            <div className="mb-2 aspect-square overflow-hidden rounded-md bg-neutral-100 dark:bg-neutral-900">
              <Image
                src={artist.profileImageUrl}
                alt={artist.name}
                width={400}
                height={400}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUploadProfile(artist.slug, f);
                }}
                className="hidden"
                id={`profile-upload-${artist.slug}`}
              />
              <label
                htmlFor={`profile-upload-${artist.slug}`}
                className="cursor-pointer rounded-full border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-700 shadow-sm transition-all duration-200 hover:bg-neutral-50 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                {profileUploading === artist.slug ? "Yükleniyor..." : "Fotoğraf Yükle"}
              </label>
              <button
                type="button"
                onClick={() => handleDeleteProfile(artist.slug)}
                disabled={profileUploading === artist.slug}
                className="rounded-full border border-red-400/50 bg-red-50 px-4 py-2 text-xs font-medium text-red-600 shadow-sm transition-all duration-200 hover:bg-red-500 hover:text-white hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed dark:border-red-700/50 dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white"
              >
                Profil Sil
              </button>
            </div>

            {editing === artist.slug ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1">İsim</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-white dark:focus:ring-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Biyografi</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-white dark:focus:ring-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Uzmanlık</label>
                  <select
                    value={formData.specialty}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specialty: e.target.value as Artist["specialty"],
                      })
                    }
                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-white dark:focus:ring-white"
                  >
                    <option value="Photographer">Photographer</option>
                    <option value="Editor">Editor</option>
                    <option value="Retoucher">Retoucher</option>
                    <option value="Videographer">Videographer</option>
                    <option value="Assistant">Assistant</option>
                    <option value="Graphic Designer">Graphic Designer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Instagram</label>
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    placeholder="@username veya URL"
                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-white dark:focus:ring-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-white dark:focus:ring-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Telefon</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+90 555 123 45 67"
                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-white dark:focus:ring-white"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleSave(artist.slug)}
                    className="flex-1 rounded-full bg-black px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-neutral-800 hover:shadow-md dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                  >
                    Kaydet
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition-all duration-200 hover:bg-neutral-50 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  >
                    İptal
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">{artist.name}</h3>
                <p className="text-xs text-neutral-500">{artist.specialty}</p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                  {artist.bio}
                </p>
                <Link
                  href={`/artists/${artist.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm transition-all duration-200 hover:bg-neutral-50 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  Halk sayfasını aç
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
                {artist.portfolio.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                      Portfolyo ({artist.portfolio.length})
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {artist.portfolio.slice(0, 6).map((work) => (
                        <Link
                          key={work.id}
                          href={work.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative block overflow-hidden rounded-sm border border-neutral-200 dark:border-neutral-800"
                        >
                          <Image
                            src={work.url}
                            alt={work.alt}
                            width={160}
                            height={160}
                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                          />
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400 dark:text-neutral-500">
                    Bu sanatçı için henüz görsel yüklenmemiş.
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(artist)}
                    className="mt-3 flex-1 rounded-full border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-700 shadow-sm transition-all duration-200 hover:bg-neutral-50 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDeleteArtist(artist.slug)}
                    className="mt-3 flex-1 rounded-full border border-red-400/50 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 shadow-sm transition-all duration-200 hover:bg-red-500 hover:text-white hover:shadow-md dark:border-red-700/50 dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white"
                  >
                    Sil
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {artists.length === 0 && (
        <div className="text-center py-12 text-neutral-500">
          Henüz sanatçı eklenmemiş
        </div>
      )}
    </div>
  );
}

