import { Skeleton } from "@/components/ui/skeleton";

export function SwipeCardSkeleton() {
  return (
    <div className="relative w-full max-w-[340px] xs:max-w-[370px] sm:max-w-[420px] h-[510px] xs:h-[530px] sm:h-[560px] touch-none pt-7 pb-2 mx-auto animate-in fade-in duration-200">
      {/* 2nd Background Layer Card (Subtle 3D Stacking Illusion) */}
      <div
        className="absolute inset-x-0 inset-y-2 rounded-container overflow-hidden pointer-events-none border-2 border-devora-border bg-devora-surface shadow-md flex flex-col justify-between"
        style={{
          transform: "translate3d(0, -10px, 0) scale(0.94)",
          opacity: 0.7,
          zIndex: 1,
        }}
      >
        <div className="h-48 xs:h-52 sm:h-56 w-full bg-devora-surface-strong/70" />
      </div>

      {/* Active Foreground Card Skeleton (1:1 with real SwipeCard) */}
      <div
        className="absolute inset-x-0 inset-y-2 bg-devora-surface border-2 border-devora-border rounded-container overflow-hidden shadow-2xl flex flex-col justify-between"
        style={{ zIndex: 10 }}
      >
        {/* Card Hero Image Area */}
        <div className="relative h-48 xs:h-52 sm:h-56 w-full bg-devora-surface-strong shrink-0 flex flex-col justify-between p-3">
          {/* Top Status & Match Badges */}
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-5 w-28 rounded-full bg-devora-surface/90" />
            <Skeleton className="h-5 w-20 rounded-full bg-devora-surface/90" />
          </div>

          {/* Bottom Headline on Image */}
          <div className="space-y-1">
            <Skeleton className="h-6 w-44 rounded-md bg-devora-surface/90" />
            <Skeleton className="h-3.5 w-32 rounded-md bg-devora-surface/90" />
          </div>
        </div>

        {/* Card Body Content */}
        <div className="flex-1 p-3.5 sm:p-4 flex flex-col justify-between space-y-2.5 overflow-hidden">
          {/* Location & Availability Pills */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-24 rounded-md" />
            <Skeleton className="h-5 w-24 rounded-md" />
          </div>

          {/* Bio Quote with Left Accent Border */}
          <div className="border-l-2 border-devora-brand/60 pl-2.5 space-y-1">
            <Skeleton className="h-3.5 w-full rounded-md" />
            <Skeleton className="h-3.5 w-4/5 rounded-md" />
          </div>

          {/* Match Reason Highlight Box */}
          <div className="p-2.5 bg-devora-surface-strong/90 rounded-container space-y-1">
            <Skeleton className="h-3 w-36 rounded-md" />
            <Skeleton className="h-2.5 w-48 rounded-md" />
          </div>

          {/* Stack Chips */}
          <div className="space-y-1">
            <Skeleton className="h-3 w-28 rounded-md" />
            <div className="flex flex-wrap gap-1">
              <Skeleton className="h-5 w-16 rounded-md" />
              <Skeleton className="h-5 w-14 rounded-md" />
              <Skeleton className="h-5 w-18 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
