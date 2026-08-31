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
    <header className="sticky top-0 z-40 w-full border-b border-devora-border bg-devora-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 md:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-6 md:gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-button bg-devora-brand flex items-center justify-center text-white font-bold text-base shadow-sm group-hover:bg-devora-brand-dark transition-colors">
              <Flame className="w-5 h-5 fill-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-devora-ink leading-tight">
                Devora
              </span>
              <span className="text-[10px] text-devora-muted font-mono tracking-wider uppercase -mt-0.5">
                Dev Dating
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <Navigation />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link href="/find-partner">
            <Button size="sm" className="hidden sm:inline-flex items-center gap-1.5 bg-devora-brand hover:bg-devora-brand-dark text-white font-semibold">
              <Flame className="w-3.5 h-3.5 fill-white" />
              <span>Find Partner</span>
            </Button>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="flex items-center p-0.5 rounded-button hover:bg-devora-surface transition-colors"
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
                  className="hover:border-devora-brand border border-devora-border cursor-pointer transition-colors"
                />
              </Link>

              {/* Dedicated Sign Out Button */}
              <button
                type="button"
                onClick={handleLogout}
                title="Keluar dari Akun (Log Out)"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-button text-xs font-semibold text-devora-muted hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-150"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          ) : (
            <Link href="/signin">
              <Button variant="secondary" size="sm" className="gap-1.5 font-bold">
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
