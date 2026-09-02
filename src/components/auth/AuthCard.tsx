"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/useUserStore";
import { useUiStore } from "@/store/useUiStore";
import { authClient } from "@/lib/auth-client";
import {
  Flame,
  CheckCircle2,
  GitBranch,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function GithubIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={cn("fill-current", className)} viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

interface AuthCardProps {
  initialMode?: "signin" | "signup";
}

export function AuthCard({ initialMode = "signin" }: AuthCardProps) {
  const router = useRouter();
  const { addToast } = useUiStore();
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [isLoading, setIsLoading] = useState<"google" | "github" | null>(null);

  const isSignIn = mode === "signin";

  const handleOAuthLogin = async (provider: "google" | "github") => {
    setIsLoading(provider);

    try {
      await authClient.signIn.social({
        provider: provider,
        callbackURL: "/", // redirect to home after login
      });
      // better-auth redirects automatically for social login, 
      // but just in case we reset state here.
      setIsLoading(null);
    } catch (error) {
      setIsLoading(null);
      addToast({
        title: "Login Gagal",
        description: "Terjadi kesalahan saat menghubungkan akun.",
        type: "error",
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Top Brand Header */}
      <div className="text-center space-y-2.5">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-devora-surface border border-devora-border text-devora-ink font-bold text-xs hover:border-devora-brand transition-colors"
        >
          <Flame className="w-4 h-4 text-devora-brand fill-devora-brand" />
          <span>Devora — Dev Dating</span>
        </Link>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-devora-ink tracking-tight">
          {isSignIn ? "Masuk ke Akun Builder" : "Buat Akun Builder Baru"}
        </h1>

        <p className="text-xs sm:text-sm text-devora-muted max-w-sm mx-auto leading-relaxed">
          {isSignIn
            ? "Lanjutkan kolaborasi proyek dan temukan partner ngoding impian kamu."
            : "Gabung bersama ribuan developer untuk membangun produk dan side project keren."}
        </p>
      </div>

      {/* Main Authentication Card */}
      <Card
        elevated
        className="p-6 sm:p-8 bg-devora-surface border-2 border-devora-border space-y-6 shadow-xl relative overflow-hidden"
      >
        {/* Decorative Top Accent Glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-devora-brand to-transparent opacity-80" />

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div className="grid grid-cols-2 p-1 bg-devora-surface-strong rounded-button border border-devora-border text-center">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={cn(
              "py-2 text-xs font-bold rounded-button transition-all",
              isSignIn
                ? "bg-devora-surface text-devora-ink shadow-xs border border-devora-border"
                : "text-devora-muted hover:text-devora-ink"
            )}
          >
            Sign In (Masuk)
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={cn(
              "py-2 text-xs font-bold rounded-button transition-all",
              !isSignIn
                ? "bg-devora-surface text-devora-ink shadow-xs border border-devora-border"
                : "text-devora-muted hover:text-devora-ink"
            )}
          >
            Sign Up (Daftar)
          </button>
        </div>

        {/* 1-Click Social Auth Buttons */}
        <div className="space-y-3 pt-1">
          {/* Google Button */}
          <button
            type="button"
            onClick={() => handleOAuthLogin("google")}
            disabled={isLoading !== null}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-button bg-devora-background hover:bg-devora-surface-strong border-2 border-devora-border hover:border-devora-brand/60 text-devora-ink font-bold text-sm shadow-xs transition-all duration-150 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <GoogleIcon className="w-5 h-5 shrink-0" />
            <span>
              {isLoading === "google"
                ? "Menghubungkan Akun Google..."
                : isSignIn
                ? "Sign in with Google"
                : "Sign up with Google"}
            </span>
          </button>

          {/* GitHub Button */}
          <button
            type="button"
            onClick={() => handleOAuthLogin("github")}
            disabled={isLoading !== null}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-button bg-devora-ink hover:bg-devora-ink-soft text-white font-bold text-sm shadow-md transition-all duration-150 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <GithubIcon className="w-5 h-5 shrink-0" />
            <span>
              {isLoading === "github"
                ? "Menghubungkan Akun GitHub..."
                : isSignIn
                ? "Sign in with GitHub"
                : "Sign up with GitHub"}
            </span>
          </button>
        </div>

        {/* Feature & Security Micro-Bullet Points */}
        <div className="pt-4 border-t border-devora-border space-y-2.5">
          <div className="flex items-center gap-2.5 text-xs text-devora-ink font-medium">
            <Zap className="w-4 h-4 text-devora-brand shrink-0" />
            <span>Akses 1-klik instan tanpa perlu hafalin password</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-devora-ink font-medium">
            <GitBranch className="w-4 h-4 text-devora-brand shrink-0" />
            <span>Sinkronisasi otomatis repo & tech stack GitHub</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-devora-ink font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>100% aman, data privat terlindungi tanpa spam</span>
          </div>
        </div>
      </Card>

      {/* Community Terms & Positive Collaboration Notice */}
      <p className="text-center text-[11px] text-devora-muted max-w-xs mx-auto leading-relaxed">
        Dengan melanjutkan, kamu setuju dengan{" "}
        <span className="text-devora-ink font-semibold">Pedoman Komunitas Devora</span> untuk berkolaborasi secara positif dan saling menghargai.
      </p>
    </div>
  );
}
