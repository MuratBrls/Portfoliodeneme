import { Suspense } from "react";

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Yükleniyor...</div>}>
      {children}
    </Suspense>
  );
}

