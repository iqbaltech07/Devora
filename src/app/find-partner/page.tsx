"use client";

import { Suspense } from "react";
import { Shell } from "@/components/layout/Shell";
import { SwipeCardDeck } from "@/components/discovery/SwipeCardDeck";
import { Flame } from "lucide-react";

export default function FindPartnerPage() {
  return (
    <Shell>
      <div className="space-y-3 sm:space-y-5 max-w-4xl mx-auto">
        {/* Page Header with standalone Flame icon (no background, no border, no animation) */}
        <div className="text-center space-y-1 sm:space-y-1.5 flex flex-col items-center">
          <Flame className="w-7 h-7 text-devora-brand fill-devora-brand mb-0.5" />

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-devora-ink">
            Cari Teman Ngoding Impian Kamu
          </h1>

          <p className="text-xs sm:text-sm text-devora-muted max-w-md mx-auto">
            Geser kanan kalau cocok, geser kiri kalau mau skip. Yuk temukan partner yang sefrekuensi!
          </p>
        </div>

        {/* Compact Interactive Swipe Card Deck */}
        <div className="pt-1 pb-4">
          <Suspense fallback={<div className="text-center text-xs text-devora-muted py-10">Menyiapkan kartu partner...</div>}>
            <SwipeCardDeck />
          </Suspense>
        </div>
      </div>
    </Shell>
  );
}
