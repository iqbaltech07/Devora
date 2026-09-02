"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <h2 className="text-3xl font-bold text-devora-ink">404 - Halaman Tidak Ditemukan</h2>
      <p className="text-sm text-devora-muted">Halaman yang Anda cari tidak tersedia atau telah dipindahkan.</p>
      <Link href="/dashboard">
        <Button size="md" className="bg-devora-brand text-white">Kembali ke Beranda</Button>
      </Link>
    </div>
  );
}
