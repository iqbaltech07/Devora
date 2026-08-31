import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function PartnerCardSkeleton() {
  return (
    <Card className="p-5 bg-devora-surface border-2 border-devora-border rounded-container flex flex-col justify-between space-y-4 shadow-sm">
      <div className="space-y-3">
        {/* Header: Avatar, Name + Match Badge + Title */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Skeleton className="w-10 h-10 rounded-full shrink-0 border border-devora-border" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4.5 w-32 rounded-md" />
                <Skeleton className="h-4 w-18 rounded-full" />
              </div>
              <Skeleton className="h-3.5 w-40 rounded-md" />
            </div>
          </div>
        </div>

        {/* Bio quote box with exact border & background styling */}
        <div className="p-2.5 bg-devora-background/60 rounded-button border border-devora-border/60 space-y-1.5">
          <Skeleton className="h-3.5 w-full rounded-md" />
          <Skeleton className="h-3.5 w-3/4 rounded-md" />
        </div>

        {/* Metadata: Location & Availability */}
        <div className="flex items-center gap-3 pt-0.5">
          <Skeleton className="h-3.5 w-24 rounded-md" />
          <Skeleton className="h-3.5 w-24 rounded-md" />
        </div>

        {/* Tech Stack Utama Preview */}
        <div className="space-y-1.5 pt-1">
          <Skeleton className="h-3 w-28 rounded-md" />
          <div className="flex flex-wrap gap-1">
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="h-5 w-20 rounded-md" />
            <Skeleton className="h-5 w-14 rounded-md" />
            <Skeleton className="h-5 w-18 rounded-md" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-devora-border flex items-center justify-between gap-2">
        <Skeleton className="h-8 flex-1 rounded-button" />
        <Skeleton className="h-8 flex-1 rounded-button" />
      </div>
    </Card>
  );
}

export function PartnerGridSkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
      {Array.from({ length: count }).map((_, idx) => (
        <PartnerCardSkeleton key={idx} />
      ))}
    </div>
  );
}
