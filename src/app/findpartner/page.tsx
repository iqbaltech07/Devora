"use client";

import { Suspense } from "react";
import { Shell } from "@/components/layout/Shell";
import { SwipeCardDeck } from "@/components/discovery/SwipeCardDeck";
import { Flame, Sparkles } from "lucide-react";

export default function FindPartnerPageRoute() {
  return (
    <Shell>
      <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#E8F7F0] text-[#317B67] text-xs font-bold border border-[#317B67]/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Developer Matchmaking & Co-founder Discovery</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
            Cari Rekan Ngoding & Partner Proyek
          </h1>

          <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto leading-relaxed">
            Temukan partner yang sefrekuensi berdasarkan tech stack, ritme kerja, dan tujuan proyek. Geser kanan untuk ajak kolaborasi!
          </p>
        </div>

        {/* Swipe Card Deck Engine */}
        <div className="pt-1 pb-4">
          <Suspense fallback={<div className="text-center text-xs text-[#64748B] py-12">Menyiapkan kartu partner developer...</div>}>
            <SwipeCardDeck />
          </Suspense>
        </div>
      </div>
    </Shell>
  );
}
