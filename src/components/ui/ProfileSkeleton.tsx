import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function ProfilePageSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Card 1: Data Diri & Headline Spesialisasi */}
      <Card className="p-5 sm:p-6 bg-devora-surface border-devora-border space-y-4">
        {/* Top Avatar & Name Preview */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-devora-border">
          <Skeleton className="w-12 h-12 rounded-full shrink-0 border-2 border-devora-border" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-5 w-40 rounded-md" />
            <Skeleton className="h-3.5 w-48 rounded-md" />
            <Skeleton className="h-3 w-28 rounded-md" />
          </div>
        </div>

        {/* Input: Nama Lengkap */}
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-28 rounded-md" />
          <Skeleton className="h-10 w-full rounded-button" />
        </div>

        {/* Input & Presets: Headline Role / Spesialisasi Utama */}
        <div className="space-y-2.5 p-3.5 sm:p-4 bg-devora-surface-strong/60 rounded-container border border-devora-border">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-44 rounded-md" />
            <Skeleton className="h-3 w-32 rounded-md" />
          </div>
          <Skeleton className="h-10 w-full rounded-button" />
          <div className="space-y-1.5 pt-1">
            <Skeleton className="h-3 w-36 rounded-md" />
            <div className="flex flex-wrap gap-1.5">
              <Skeleton className="h-7 w-28 rounded-button" />
              <Skeleton className="h-7 w-32 rounded-button" />
              <Skeleton className="h-7 w-30 rounded-button" />
              <Skeleton className="h-7 w-28 rounded-button" />
            </div>
          </div>
        </div>

        {/* Bio Singkat */}
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-20 rounded-md" />
          <Skeleton className="h-16 w-full rounded-button" />
        </div>

        {/* Domisili & Zona Waktu Group */}
        <div className="pt-2 border-t border-devora-border/60 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-48 rounded-md" />
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-24 rounded-md" />
              <Skeleton className="h-7 w-full rounded-button" />
              <Skeleton className="h-10 w-full rounded-button" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-28 rounded-md" />
              <div className="h-[29px] hidden sm:block" />
              <Skeleton className="h-10 w-full rounded-button" />
            </div>
          </div>
        </div>
      </Card>

      {/* Card 2: Tech Stack & Keahlian Andalan Skeleton */}
      <Card className="p-5 sm:p-6 bg-devora-surface border-devora-border space-y-4">
        <div className="flex items-center justify-between border-b border-devora-border pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded-full" />
            <Skeleton className="h-5 w-48 rounded-md" />
          </div>
          <Skeleton className="h-5 w-24 rounded-button" />
        </div>

        {/* Selected Tech Stack Badges box */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-48 rounded-md" />
          <div className="flex flex-wrap gap-1.5 p-3 bg-devora-background border border-devora-border rounded-container min-h-[50px]">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-6 w-22 rounded-full" />
          </div>
        </div>

        {/* Custom Input */}
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-36 rounded-md" />
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1 rounded-button" />
            <Skeleton className="h-10 w-20 rounded-button" />
          </div>
        </div>

        {/* Presets */}
        <div className="space-y-2.5 pt-2 border-t border-devora-border/60">
          <Skeleton className="h-3 w-52 rounded-md" />
          <div className="flex flex-wrap gap-1.5">
            <Skeleton className="h-7 w-20 rounded-button" />
            <Skeleton className="h-7 w-16 rounded-button" />
            <Skeleton className="h-7 w-24 rounded-button" />
            <Skeleton className="h-7 w-22 rounded-button" />
            <Skeleton className="h-7 w-18 rounded-button" />
            <Skeleton className="h-7 w-26 rounded-button" />
          </div>
        </div>
      </Card>

      {/* Card 3: Ketersediaan Waktu & Gaya Kolaborasi */}
      <Card className="p-5 sm:p-6 bg-devora-surface border-devora-border space-y-4">
        <div className="flex items-center gap-2 border-b border-devora-border pb-3">
          <Skeleton className="w-4 h-4 rounded-full" />
          <Skeleton className="h-5 w-44 rounded-md" />
        </div>

        {/* Hours per week slider box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-48 rounded-md" />
            <Skeleton className="h-4 w-24 rounded-md" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            <Skeleton className="h-8 rounded-button" />
            <Skeleton className="h-8 rounded-button" />
            <Skeleton className="h-8 rounded-button" />
            <Skeleton className="h-8 rounded-button" />
          </div>
        </div>

        {/* Working Style Radio Options */}
        <div className="space-y-2 pt-2 border-t border-devora-border">
          <Skeleton className="h-3 w-36 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-12 w-full rounded-button" />
            <Skeleton className="h-12 w-full rounded-button" />
            <Skeleton className="h-12 w-full rounded-button" />
          </div>
        </div>
      </Card>

      {/* Card 4: Tujuan Kolaborasi */}
      <Card className="p-5 sm:p-6 bg-devora-surface border-devora-border space-y-4">
        <div className="flex items-center gap-2 border-b border-devora-border pb-3">
          <Skeleton className="w-4 h-4 rounded-full" />
          <Skeleton className="h-5 w-36 rounded-md" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <Skeleton className="h-12 rounded-button" />
          <Skeleton className="h-12 rounded-button" />
          <Skeleton className="h-12 rounded-button" />
          <Skeleton className="h-12 rounded-button" />
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Skeleton className="h-11 w-44 rounded-button" />
      </div>
    </div>
  );
}
