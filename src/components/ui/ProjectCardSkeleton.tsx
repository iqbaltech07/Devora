import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function ProjectCardSkeleton() {
  return (
    <Card className="p-5 sm:p-6 bg-devora-surface border-2 border-devora-border rounded-container space-y-5 shadow-xs">
      {/* Top Bar: Owner Info & Stage Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-devora-border pb-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-full shrink-0" />
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-4 w-20 rounded-full" />
            </div>
            <Skeleton className="h-3 w-24 rounded-md" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-4 w-4 rounded-md" />
        </div>
      </div>

      {/* Project Title & Description */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-2/5 rounded-md" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-4/5 rounded-md" />
        </div>
      </div>

      {/* Partner Roles Needed Grid (1:1 Match with Real Content) */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center gap-2">
          <Skeleton className="w-3.5 h-3.5 rounded-full" />
          <Skeleton className="h-3.5 w-48 rounded-md" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 bg-devora-background border border-devora-border rounded-button space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="h-3 w-16 rounded-md" />
            </div>
            <div className="flex flex-wrap gap-1">
              <Skeleton className="h-4 w-16 rounded-md" />
              <Skeleton className="h-4 w-20 rounded-md" />
            </div>
          </div>

          <div className="p-3 bg-devora-background border border-devora-border rounded-button space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-3 w-16 rounded-md" />
            </div>
            <div className="flex flex-wrap gap-1">
              <Skeleton className="h-4 w-14 rounded-md" />
              <Skeleton className="h-4 w-18 rounded-md" />
            </div>
          </div>
        </div>
      </div>

      {/* Card Bottom Actions */}
      <div className="pt-3 border-t border-devora-border flex flex-col sm:flex-row items-center justify-between gap-3">
        <Skeleton className="h-8 w-36 rounded-button" />
        <Skeleton className="h-8 w-44 rounded-button" />
      </div>
    </Card>
  );
}

export function ProjectBoardSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 animate-in fade-in duration-200">
      {Array.from({ length: count }).map((_, idx) => (
        <ProjectCardSkeleton key={idx} />
      ))}
    </div>
  );
}
