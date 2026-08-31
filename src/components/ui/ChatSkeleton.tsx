import { Skeleton } from "@/components/ui/skeleton";

export function ChatSidebarItemSkeleton() {
  return (
    <div className="p-3 flex items-start gap-3 border-b border-devora-border/60">
      <Skeleton className="w-9 h-9 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5 min-w-0">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3.5 w-24 rounded-md" />
          <Skeleton className="h-3 w-12 rounded-md" />
        </div>
        <Skeleton className="h-3 w-32 rounded-md" />
        <Skeleton className="h-3 w-4/5 rounded-md" />
      </div>
    </div>
  );
}

export function ChatPageSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-0 h-[620px] sm:h-[680px] bg-devora-surface border-2 border-devora-border rounded-container overflow-hidden shadow-sm animate-in fade-in duration-200">
      {/* Left Sidebar Skeleton */}
      <div className="md:col-span-5 lg:col-span-4 border-r border-devora-border flex flex-col bg-devora-surface-strong/30 h-full overflow-hidden">
        <div className="p-3 border-b border-devora-border bg-devora-surface">
          <Skeleton className="h-7 w-full rounded-button" />
        </div>
        <div className="flex-1 divide-y divide-devora-border/60">
          <ChatSidebarItemSkeleton />
          <ChatSidebarItemSkeleton />
          <ChatSidebarItemSkeleton />
          <ChatSidebarItemSkeleton />
        </div>
      </div>

      {/* Right Chat Column Skeleton */}
      <div className="md:col-span-7 lg:col-span-8 flex flex-col h-full bg-devora-background/95">
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-devora-border bg-devora-surface/95 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-3 w-16 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-4 w-20 rounded-md" />
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 sm:p-5 space-y-4 overflow-hidden">
          <div className="flex justify-center">
            <Skeleton className="h-4 w-40 rounded-full" />
          </div>

          {/* Left Bubble Skeleton */}
          <div className="mr-auto max-w-[65%] space-y-1">
            <Skeleton className="h-14 w-56 rounded-2xl rounded-tl-xs" />
          </div>

          {/* Right Bubble Skeleton */}
          <div className="ml-auto max-w-[65%] space-y-1">
            <Skeleton className="h-16 w-64 rounded-2xl rounded-tr-xs" />
          </div>

          {/* Left Bubble Skeleton */}
          <div className="mr-auto max-w-[65%] space-y-1">
            <Skeleton className="h-12 w-48 rounded-2xl rounded-tl-xs" />
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-devora-border bg-devora-surface flex items-center gap-2">
          <Skeleton className="h-9 flex-1 rounded-button" />
          <Skeleton className="h-9 w-20 rounded-button" />
        </div>
      </div>
    </div>
  );
}
