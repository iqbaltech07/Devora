"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Flame, Plus, LogIn, LogOut } from "lucide-react";
import { Navigation } from "./Navigation";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useUserStore } from "@/store/useUserStore";
import { useUiStore } from "@/store/useUiStore";
import { authClient } from "@/lib/auth-client";

import { NotificationDropdown } from "./NotificationDropdown";

export function Topbar() {
  const router = useRouter();
  const { currentUser, isAuthenticated, logout } = useUserStore();
  const { addToast } = useUiStore();

  const handleLogout = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            logout(); // clear zustand
            addToast({
              title: "Berhasil Keluar",
              description: "Kamu telah keluar dari akun Devora. Sampai jumpa lagi!",
              type: "info",
            });
            router.push("/signin");
          }
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-devora-border bg-[#FAF9F5]/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-6 md:gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-2xl bg-[#FF5733] flex items-center justify-center text-white shadow-md shadow-[#FF5733]/25 group-hover:scale-105 transition-transform duration-200">
              <Flame className="w-5 h-5 fill-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-[#0F172A] leading-tight">
                Devora
              </span>
              <span className="text-[10px] text-[#64748B] font-mono tracking-wider uppercase -mt-0.5">
                Dev Matchmaking
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <Navigation />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notification Button Dropdown */}
          <NotificationDropdown />

          {isAuthenticated ? (
            <div className="flex items-center gap-2 sm:gap-2.5">
              <Link
                href="/profile"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#CBD5E1] bg-white text-xs font-bold text-[#0F172A] hover:border-[#FF5733] transition-colors shadow-xs"
                title="Lihat & Edit Profil"
              >
                <Avatar
                  src={
                    currentUser.image ||
                    currentUser.avatarUrl ||
                    (currentUser.githubUsername
                      ? `https://github.com/${currentUser.githubUsername}.png`
                      : undefined)
                  }
                  fallback={
                    currentUser.name
                      ? currentUser.name.slice(0, 2).toUpperCase()
                      : "DV"
                  }
                  size="sm"
                  className="w-5 h-5 rounded-lg"
                />
                <span>{currentUser.name || "Profil Saya"}</span>
              </Link>

              {/* Dedicated Sign Out Button */}
              <button
                type="button"
                onClick={handleLogout}
                title="Keluar dari Akun (Log Out)"
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:text-red-600 hover:bg-red-50 transition-all duration-150"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-2.5">
              <Link href="/signin">
                <button
                  type="button"
                  className="px-3 sm:px-4 py-2 text-xs font-bold text-[#0F172A] hover:text-[#FF5733] transition-colors"
                >
                  Masuk
                </button>
              </Link>
              <Link href="/signup">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#0F172A] text-white text-xs font-bold shadow-md hover:bg-[#1E293B] hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <span>Mulai Sekarang</span>
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
