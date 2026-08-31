"use client";

import * as React from "react";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Topbar } from "./Topbar";
import { BottomNav } from "./BottomNav";
import { Footer } from "./Footer";
import { PartnerSpecModal } from "@/components/match/PartnerSpecModal";
import { useUiStore } from "@/store/useUiStore";
import { useUserStore } from "@/store/useUserStore";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface ShellProps {
  children: React.ReactNode;
  className?: string;
}

export function Shell({ children, className }: ShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { toasts, removeToast } = useUiStore();
  const { currentUser, isAuthenticated, fetchProfile } = useUserStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (
      isAuthenticated &&
      currentUser.id &&
      currentUser.onboarded === false &&
      pathname !== "/onboarding" &&
      !pathname.startsWith("/signin") &&
      !pathname.startsWith("/signup")
    ) {
      router.replace("/onboarding");
    }
  }, [isAuthenticated, currentUser.id, currentUser.onboarded, pathname, router]);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-devora-background text-devora-ink selection:bg-devora-brand-soft selection:text-devora-brand-dark">
      {/* Persistent Desktop Topbar */}
      <Topbar />

      {/* Main Content Area */}
      <main
        className={cn(
          "flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 pb-20 md:pb-8",
          className
        )}
      >
        {children}
      </main>

      {/* Global Partner Spec Modal */}
      <PartnerSpecModal />

      {/* Global Toast Notification System */}
      <div className="fixed bottom-16 md:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto p-4 bg-devora-surface border border-devora-border rounded-container shadow-xl flex items-start gap-3 animate-in slide-in-from-bottom-4 duration-200"
          >
            {toast.type === "success" && (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            )}
            {toast.type === "error" && (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            )}
            {toast.type === "info" && (
              <Info className="w-5 h-5 text-devora-brand shrink-0 mt-0.5" />
            )}

            <div className="flex-1 space-y-0.5">
              <h4 className="text-sm font-semibold text-devora-ink">
                {toast.title}
              </h4>
              {toast.description && (
                <p className="text-xs text-devora-muted leading-relaxed">
                  {toast.description}
                </p>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-devora-muted hover:text-devora-ink rounded-button hover:bg-devora-surface-strong transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Editorial Footer */}
      <Footer />

      {/* Mobile Sticky Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
