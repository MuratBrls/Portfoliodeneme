"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface ArtistSubmission {
  id: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
  artist: {
    slug: string;
    name: string;
    bio: string;
    specialty: "Photographer" | "Editor" | "Retoucher" | "Videographer" | "Assistant" | "Graphic Designer";
    instagram?: string;
    email?: string;
    phone?: string;
  };
  profileImage?: {
    fileName: string;
    url: string;
  };
  works: Array<{
    brand: string;
    projectTitle: string;
    type: "photo" | "video";
    videoUrl?: string;
    fileName: string;
    url: string;
  }>;
  rejectionReason?: string;
}

export function AdminSubmissionsManager() {
  const [submissions, setSubmissions] = useState<ArtistSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [selectedSubmission, setSelectedSubmission] = useState<ArtistSubmission | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    loadSubmissions();
  }, [statusFilter]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const url = statusFilter === "all" 
        ? "/api/admin/submissions"
        : `/api/admin/submissions?status=${statusFilter}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions || []);
      }
    } catch (error) {
      console.error("Error loading submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submission: ArtistSubmission) => {
    if (!confirm(`"${submission.artist.name}" başvurusunu onaylamak istediğinize emin misiniz?`)) {
      return;
    }

    setApproving(true);
    try {
      const res = await fetch("/api/admin/submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: submission.id,
          action: "approve",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Başvuru onaylandı ve portfolyo eklendi");
        setSelectedSubmission(null);
        await loadSubmissions();
      } else {
        alert(data.error || "Başvuru onaylanırken bir hata oluştu");
      }
    } catch (error) {
      console.error("Error approving submission:", error);
      alert("Başvuru onaylanırken bir hata oluştu");
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async (submission: ArtistSubmission) => {
    if (!rejectionReason.trim()) {
      alert("Lütfen red sebebini belirtin");
      return;
    }

    if (!confirm(`"${submission.artist.name}" başvurusunu reddetmek istediğinize emin misiniz?`)) {
      return;
    }

    setRejecting(true);
    try {
      const res = await fetch("/api/admin/submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: submission.id,
          action: "reject",
          rejectionReason: rejectionReason.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Başvuru reddedildi");
        setSelectedSubmission(null);
        setRejectionReason("");
        await loadSubmissions();
      } else {
        alert(data.error || "Başvuru reddedilirken bir hata oluştu");
      }
    } catch (error) {
      console.error("Error rejecting submission:", error);
      alert("Başvuru reddedilirken bir hata oluştu");
    } finally {
      setRejecting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  const pendingCount = submissions.filter((s) => s.status === "pending").length;
  const approvedCount = submissions.filter((s) => s.status === "approved").length;
  const rejectedCount = submissions.filter((s) => s.status === "rejected").length;

  return (
    <div className="space-y-6">
      {/* Status Filter */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-4 py-2 text-sm font-medium transition-all ${
            statusFilter === "all"
              ? "border-b-2 border-black text-black dark:border-white dark:text-white"
              : "text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white"
          }`}
        >
          Tümü ({submissions.length})
        </button>
        <button
          onClick={() => setStatusFilter("pending")}
          className={`px-4 py-2 text-sm font-medium transition-all ${
            statusFilter === "pending"
              ? "border-b-2 border-black text-black dark:border-white dark:text-white"
              : "text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white"
          }`}
        >
          Bekleyen ({pendingCount})
        </button>
        <button
          onClick={() => setStatusFilter("approved")}
          className={`px-4 py-2 text-sm font-medium transition-all ${
            statusFilter === "approved"
              ? "border-b-2 border-black text-black dark:border-white dark:text-white"
              : "text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white"
          }`}
        >
          Onaylanan ({approvedCount})
        </button>
        <button
          onClick={() => setStatusFilter("rejected")}
          className={`px-4 py-2 text-sm font-medium transition-all ${
            statusFilter === "rejected"
              ? "border-b-2 border-black text-black dark:border-white dark:text-white"
              : "text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white"
          }`}
        >
          Reddedilen ({rejectedCount})
        </button>
      </div>

      {/* Submissions List */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {submissions.map((submission) => (
          <div
            key={submission.id}
            className={`cursor-pointer rounded-md border p-4 transition-all hover:shadow-md ${
              submission.status === "pending"
                ? "border-yellow-500/50 bg-yellow-50/50 dark:border-yellow-500/30 dark:bg-yellow-950/20"
                : submission.status === "approved"
                ? "border-green-500/50 bg-green-50/50 dark:border-green-500/30 dark:bg-green-950/20"
                : "border-red-500/50 bg-red-50/50 dark:border-red-500/30 dark:bg-red-950/20"
            }`}
            onClick={() => setSelectedSubmission(submission)}
          >
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold text-black dark:text-white">{submission.artist.name}</h3>
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  submission.status === "pending"
                    ? "bg-yellow-500 text-white"
                    : submission.status === "approved"
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {submission.status === "pending"
                  ? "Bekliyor"
                  : submission.status === "approved"
                  ? "Onaylandı"
                  : "Reddedildi"}
              </span>
            </div>
            <p className="mb-2 text-xs text-neutral-600 dark:text-neutral-400">
              {submission.artist.specialty}
            </p>
            <p className="mb-2 text-xs text-neutral-500 dark:text-neutral-500">
              {formatDate(submission.createdAt)}
            </p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              {submission.works.length} çalışma
            </p>
          </div>
        ))}
      </div>

      {submissions.length === 0 && (
        <div className="text-center py-12 text-neutral-500">
          {statusFilter === "all" 
            ? "Henüz başvuru yok"
            : statusFilter === "pending"
            ? "Bekleyen başvuru yok"
            : statusFilter === "approved"
            ? "Onaylanan başvuru yok"
            : "Reddedilen başvuru yok"}
        </div>
      )}

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-md border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-black dark:text-white">
                {selectedSubmission.artist.name}
              </h2>
              <button
                onClick={() => {
                  setSelectedSubmission(null);
                  setRejectionReason("");
                }}
                className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-black transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800"
              >
                Kapat
              </button>
            </div>

            <div className="space-y-6">
              {/* Artist Information */}
              <section>
                <h3 className="mb-3 text-lg font-semibold text-black dark:text-white">
                  Kişisel Bilgiler
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Slug</p>
                    <p className="text-sm text-black dark:text-white">{selectedSubmission.artist.slug}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Uzmanlık</p>
                    <p className="text-sm text-black dark:text-white">
                      {selectedSubmission.artist.specialty}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">E-posta</p>
                    <p className="text-sm text-black dark:text-white">
                      {selectedSubmission.artist.email || "Belirtilmemiş"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Instagram</p>
                    <p className="text-sm text-black dark:text-white">
                      {selectedSubmission.artist.instagram || "Belirtilmemiş"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Telefon</p>
                    <p className="text-sm text-black dark:text-white">
                      {selectedSubmission.artist.phone || "Belirtilmemiş"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      Başvuru Tarihi
                    </p>
                    <p className="text-sm text-black dark:text-white">
                      {formatDate(selectedSubmission.createdAt)}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Biyografi</p>
                    <p className="text-sm text-black dark:text-white">
                      {selectedSubmission.artist.bio || "Belirtilmemiş"}
                    </p>
                  </div>
                </div>
              </section>

              {/* Profile Image */}
              {selectedSubmission.profileImage && (
                <section>
                  <h3 className="mb-3 text-lg font-semibold text-black dark:text-white">
                    Profil Resmi
                  </h3>
                  <div className="relative h-48 w-48 overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-800">
                    <Image
                      src={selectedSubmission.profileImage.url}
                      alt={selectedSubmission.artist.name}
                      fill
                      className="object-cover"
                      sizes="192px"
                      unoptimized={selectedSubmission.profileImage.url.startsWith("https://") && (selectedSubmission.profileImage.url.includes("blob.vercel-storage.com") || selectedSubmission.profileImage.url.includes("public.blob.vercel-storage.com"))}
                      onError={(e) => {
                        console.error("Profile image load error:", selectedSubmission.profileImage?.url);
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                </section>
              )}

              {/* Works */}
              <section>
                <h3 className="mb-3 text-lg font-semibold text-black dark:text-white">
                  Çalışmalar ({selectedSubmission.works.length})
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {selectedSubmission.works.map((work, index) => (
                    <div
                      key={index}
                      className="overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-800"
                    >
                      <div className="relative aspect-square bg-neutral-100 dark:bg-neutral-900">
                        {work.url ? (
                          <Image
                            src={work.url}
                            alt={work.brand || work.projectTitle || `Work ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            unoptimized={work.url.startsWith("https://") && (work.url.includes("blob.vercel-storage.com") || work.url.includes("public.blob.vercel-storage.com"))}
                            onError={(e) => {
                              console.error("Image load error:", work.url);
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                            Görsel yüklenemedi
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-medium text-black dark:text-white">
                          {work.projectTitle}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{work.brand}</p>
                        <p className="text-xs text-neutral-400 dark:text-neutral-500">
                          {work.type === "video" ? "Video" : "Fotoğraf"}
                        </p>
                        {work.videoUrl && (
                          <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                            ✓ Video URL: {work.videoUrl.substring(0, 30)}...
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Rejection Reason */}
              {selectedSubmission.status === "rejected" && selectedSubmission.rejectionReason && (
                <section>
                  <h3 className="mb-3 text-lg font-semibold text-red-600 dark:text-red-400">
                    Red Sebebi
                  </h3>
                  <p className="text-sm text-black dark:text-white">
                    {selectedSubmission.rejectionReason}
                  </p>
                </section>
              )}

              {/* Actions */}
              {selectedSubmission.status === "pending" && (
                <section className="border-t border-neutral-200 pt-6 dark:border-neutral-800">
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                        Red Sebebi (Sadece reddetmek için)
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={3}
                        className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-black dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                        placeholder="Başvurunun neden reddedildiğini belirtin..."
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(selectedSubmission)}
                        disabled={approving}
                        className="flex-1 rounded-full bg-green-600 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {approving ? "Onaylanıyor..." : "Onayla"}
                      </button>
                      <button
                        onClick={() => handleReject(selectedSubmission)}
                        disabled={rejecting || !rejectionReason.trim()}
                        className="flex-1 rounded-full bg-red-600 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {rejecting ? "Reddediliyor..." : "Reddet"}
                      </button>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

