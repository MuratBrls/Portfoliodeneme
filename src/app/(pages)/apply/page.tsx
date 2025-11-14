"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

interface WorkForm {
  file: File | null;
  brand: string;
  projectTitle: string;
  type: "photo" | "video";
  videoUrl: string;
}

export default function ApplyPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    slug: "",
    name: "",
    bio: "",
    specialty: "Photographer" as "Photographer" | "Editor" | "Retoucher" | "Videographer" | "Assistant" | "Graphic Designer",
    instagram: "",
    email: "",
    phone: "",
  });
  
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [works, setWorks] = useState<WorkForm[]>([
    { file: null, brand: "", projectTitle: "", type: "photo", videoUrl: "" },
  ]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Validate required fields
      if (!formData.slug || !formData.name) {
        setError("Slug ve isim zorunludur");
        setLoading(false);
        return;
      }

      // Validate at least one work
      const validWorks = works.filter((w) => w.file !== null);
      if (validWorks.length === 0) {
        setError("En az bir çalışma yüklenmelidir");
        setLoading(false);
        return;
      }

      // Create FormData
      const formDataToSend = new FormData();
      formDataToSend.append("slug", formData.slug);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("bio", formData.bio);
      formDataToSend.append("specialty", formData.specialty);
      if (formData.instagram) formDataToSend.append("instagram", formData.instagram);
      if (formData.email) formDataToSend.append("email", formData.email);
      if (formData.phone) formDataToSend.append("phone", formData.phone);

      // Add profile image
      if (profileImage) {
        formDataToSend.append("profileImage", profileImage);
      }

      // Add works
      formDataToSend.append("worksCount", validWorks.length.toString());
      validWorks.forEach((work, index) => {
        if (work.file) {
          formDataToSend.append(`work_${index}_file`, work.file);
          formDataToSend.append(`work_${index}_brand`, work.brand);
          formDataToSend.append(`work_${index}_projectTitle`, work.projectTitle);
          formDataToSend.append(`work_${index}_type`, work.type);
          if (work.videoUrl) {
            formDataToSend.append(`work_${index}_videoUrl`, work.videoUrl);
          }
        }
      });

      // Submit
      const res = await fetch("/api/submissions", {
        method: "POST",
        body: formDataToSend,
      });

      const result = await res.json();

      if (res.ok) {
        setSuccess(true);
        // Reset form
        setFormData({
          slug: "",
          name: "",
          bio: "",
          specialty: "Photographer",
          instagram: "",
          email: "",
          phone: "",
        });
        setProfileImage(null);
        setWorks([{ file: null, brand: "", projectTitle: "", type: "photo", videoUrl: "" }]);
      } else {
        setError(result.error || "Başvuru gönderilirken bir hata oluştu");
      }
    } catch (err: any) {
      console.error("Error submitting application:", err);
      setError(err.message || "Başvuru gönderilirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const addWork = () => {
    setWorks([...works, { file: null, brand: "", projectTitle: "", type: "photo", videoUrl: "" }]);
  };

  const removeWork = (index: number) => {
    setWorks(works.filter((_, i) => i !== index));
  };

  const updateWork = (index: number, field: keyof WorkForm, value: any) => {
    const updatedWorks = [...works];
    updatedWorks[index] = { ...updatedWorks[index], [field]: value };
    setWorks(updatedWorks);
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 md:px-6">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-semibold uppercase tracking-[0.4em] text-black dark:text-white">
          Sanatçı Başvurusu
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          LUME'e katılmak için aşağıdaki formu doldurun. Başvurunuz incelendikten sonra size dönüş yapılacaktır.
        </p>
      </div>

      {success && (
        <div className="mb-6 rounded-md border border-green-500/50 bg-green-50 p-4 text-green-700 dark:border-green-500/30 dark:bg-green-950/50 dark:text-green-400">
          <p className="font-medium">Başvurunuz alındı!</p>
          <p className="mt-1 text-sm">
            Başvurunuz incelendikten sonra size e-posta ile dönüş yapılacaktır.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-md border border-red-500/50 bg-red-50 p-4 text-red-700 dark:border-red-500/30 dark:bg-red-950/50 dark:text-red-400">
          <p className="font-medium">Hata</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Artist Information */}
        <section className="rounded-md border border-neutral-200 p-6 dark:border-neutral-800">
          <h2 className="mb-4 text-lg font-semibold uppercase tracking-[0.2em] text-black dark:text-white">
            Sanatçı Bilgileri
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-black dark:text-white">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-black dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                placeholder="ornek-sanatci"
                required
              />
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                URL'de kullanılacak benzersiz isim (örn: ornek-sanatci)
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-black dark:text-white">
                İsim <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-black dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-black dark:text-white">
                Uzmanlık
              </label>
              <select
                value={formData.specialty}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    specialty: e.target.value as any,
                  })
                }
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-black dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
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
              <label className="mb-1 block text-sm font-medium text-black dark:text-white">
                E-posta
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-black dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                placeholder="email@example.com"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-black dark:text-white">
                Biyografi
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-black dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                placeholder="Kendiniz hakkında kısa bir açıklama..."
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-black dark:text-white">
                Instagram
              </label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-black dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                placeholder="@username veya URL"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-black dark:text-white">
                Telefon
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-black dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                placeholder="+90 555 123 45 67"
              />
            </div>
          </div>
        </section>

        {/* Profile Image */}
        <section className="rounded-md border border-neutral-200 p-6 dark:border-neutral-800">
          <h2 className="mb-4 text-lg font-semibold uppercase tracking-[0.2em] text-black dark:text-white">
            Profil Resmi (Opsiyonel)
          </h2>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
              className="block w-full text-sm text-black dark:text-white"
            />
            {profileImage && (
              <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                Seçili: {profileImage.name}
              </p>
            )}
          </div>
        </section>

        {/* Works */}
        <section className="rounded-md border border-neutral-200 p-6 dark:border-neutral-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold uppercase tracking-[0.2em] text-black dark:text-white">
              Çalışmalar <span className="text-red-500">*</span>
            </h2>
            <button
              type="button"
              onClick={addWork}
              className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-black transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800"
            >
              + Çalışma Ekle
            </button>
          </div>
          <div className="space-y-6">
            {works.map((work, index) => (
              <div
                key={index}
                className="rounded-md border border-neutral-200 p-4 dark:border-neutral-800"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-black dark:text-white">
                    Çalışma {index + 1}
                  </h3>
                  {works.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeWork(index)}
                      className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
                    >
                      Kaldır
                    </button>
                  )}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-black dark:text-white">
                      Dosya <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => updateWork(index, "file", e.target.files?.[0] || null)}
                      className="block w-full text-sm text-black dark:text-white"
                      required={index === 0}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-black dark:text-white">
                      Tür
                    </label>
                    <select
                      value={work.type}
                      onChange={(e) => updateWork(index, "type", e.target.value)}
                      className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-black dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                    >
                      <option value="photo">Fotoğraf</option>
                      <option value="video">Video</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-black dark:text-white">
                      Marka
                    </label>
                    <input
                      type="text"
                      value={work.brand}
                      onChange={(e) => updateWork(index, "brand", e.target.value)}
                      className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-black dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                      placeholder="Örn: Beymen"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-black dark:text-white">
                      Proje
                    </label>
                    <input
                      type="text"
                      value={work.projectTitle}
                      onChange={(e) => updateWork(index, "projectTitle", e.target.value)}
                      className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-black dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                      placeholder="Örn: FW25/26"
                    />
                  </div>
                  {work.type === "video" && (
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-sm font-medium text-black dark:text-white">
                        Video URL (YouTube veya Vimeo)
                      </label>
                      <input
                        type="url"
                        value={work.videoUrl}
                        onChange={(e) => updateWork(index, "videoUrl", e.target.value)}
                        className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-black dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                        placeholder="https://youtube.com/watch?v=... veya https://vimeo.com/..."
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Submit Button */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            ← Ana Sayfaya Dön
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-black px-8 py-3 text-sm font-medium text-white transition-all hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            {loading ? "Gönderiliyor..." : "Başvuruyu Gönder"}
          </button>
        </div>
      </form>
    </main>
  );
}

