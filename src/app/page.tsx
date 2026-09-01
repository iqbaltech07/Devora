"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { useMatchStore } from "@/store/useMatchStore";
import { useProjectStore } from "@/store/useProjectStore";
import {
  Flame,
  ArrowRight,
  Sparkles,
  Users,
  Code2,
  FolderKanban,
  CheckCircle2,
  Clock,
  Globe,
  MessageSquare,
  ShieldCheck,
  Zap,
  Layers,
  Search,
  ExternalLink,
  ChevronRight,
  GitBranch,
  Terminal,
  Heart,
  PlusCircle,
  Laptop,
  Check,
  Star,
  Cpu,
  Boxes,
  Compass,
  Target,
  Menu,
  X,
  Smartphone,
  CheckCircle,
  TrendingUp,
  BarChart3,
  GitPullRequest,
  Activity,
  Layers3,
  Share2,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { currentUser, isAuthenticated, fetchProfile } = useUserStore();
  const { fetchCandidates, fetchMatches } = useMatchStore();
  const { fetchProjects } = useProjectStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchProfile();
    fetchCandidates();
    fetchMatches();
    fetchProjects();
  }, [fetchProfile, fetchCandidates, fetchMatches, fetchProjects]);

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#0F172A] selection:bg-[#FF5733] selection:text-white flex flex-col font-sans antialiased overflow-x-hidden">
      {/* ─────────────────────────────────────────────────────────────────────────────
          1. HEADER / NAVIGATION BAR (Compact, Minimalist, Centered Links, Dark Pill CTA)
      ───────────────────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full bg-[#FAF9F5]/90 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-[#FF5733] flex items-center justify-center text-white shadow-md shadow-[#FF5733]/25 group-hover:scale-105 transition-transform duration-200">
              <Flame className="w-4.5 h-4.5 fill-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-[#0F172A]">
              Devora
            </span>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-[#64748B]">
            <a href="#about" className="hover:text-[#0F172A] transition-colors">
              About us
            </a>
            <a href="#solutions" className="hover:text-[#0F172A] transition-colors">
              Solutions
            </a>
            <a href="#connectivity" className="hover:text-[#0F172A] transition-colors">
              Platform
            </a>
            <a href="#ecosystem" className="hover:text-[#0F172A] transition-colors">
              Ecosystem
            </a>
            <a href="#spotlight" className="hover:text-[#0F172A] transition-colors">
              Spotlight
            </a>
            <a href="#projects" className="hover:text-[#0F172A] transition-colors">
              Projects
            </a>
          </nav>

          {/* Action CTA Bar */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#E2E8F0] bg-white text-xs font-bold text-[#0F172A] hover:border-[#FF5733] transition-colors shadow-xs"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{currentUser.name || "Profil Saya"}</span>
                </Link>
                <Link href="/find-partner">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0F172A] text-white text-xs font-bold shadow-md hover:bg-[#1E293B] hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <span>Ruang Match</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link href="/signin">
                  <button
                    type="button"
                    className="px-3 sm:px-4 py-2 text-xs font-bold text-[#0F172A] hover:text-[#FF5733] transition-colors"
                  >
                    Sign in
                  </button>
                </Link>
                <Link href="/find-partner">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0F172A] text-white text-xs font-bold shadow-md hover:bg-[#1E293B] hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <span>Find Partner</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>
            )}

            {/* Mobile Navigation Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl border border-[#E2E8F0] bg-white text-[#0F172A]"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E2E8F0] bg-[#FAF9F5] px-4 py-4 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-200">
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-bold text-[#0F172A] hover:bg-white"
            >
              About us
            </a>
            <a
              href="#solutions"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-bold text-[#0F172A] hover:bg-white"
            >
              Solutions
            </a>
            <a
              href="#connectivity"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-bold text-[#0F172A] hover:bg-white"
            >
              Platform
            </a>
            <a
              href="#ecosystem"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-bold text-[#0F172A] hover:bg-white"
            >
              Ecosystem
            </a>
            <a
              href="#spotlight"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-bold text-[#0F172A] hover:bg-white"
            >
              Spotlight
            </a>
          </div>
        )}
      </header>

      {/* ─────────────────────────────────────────────────────────────────────────────
          2. HERO SECTION (Dual-Weight Oversized Headline + 4 Seamless Color Portrait Panels)
      ───────────────────────────────────────────────────────────────────────────── */}
      <section id="about" className="relative pt-6 pb-20 md:pt-12 md:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Soft Ambient Radial Background Glows matching Reference */}
        <div className="absolute top-0 left-[-5%] w-[450px] h-[450px] bg-[#FDE68A]/35 rounded-full blur-[100px] pointer-events-none -z-10" />
        <div className="absolute top-0 right-[-5%] w-[450px] h-[450px] bg-[#DDD6FE]/40 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto space-y-10 text-center">
          {/* Eyebrow & Oversized Headline with Exact Dual-Weight Contrast */}
          <div className="space-y-3 max-w-3xl mx-auto">
            <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-[#64748B] block">
              Inspire, Connect &amp; Elevate
            </span>
            <h1 className="text-5xl sm:text-7xl md:text-8xl tracking-tight text-[#0F172A] leading-[1.02]">
              <span className="font-normal">Developer </span>
              <span className="font-black">Ecosystem</span>
            </h1>
            <div className="pt-2">
              <Link href="/find-partner">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#0F172A] text-white text-xs sm:text-sm font-bold shadow-xl hover:bg-[#1E293B] hover:scale-105 active:scale-95 transition-all"
                >
                  <span>Find Partner</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>

          {/* 4 Colorful Rounded Portrait Cards (Yellow, Mint, Blue, Purple) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto pt-4">
            {/* Card 1: Warm Golden Yellow / Fullstack */}
            <div className="group relative h-72 sm:h-84 md:h-[400px] rounded-[32px] md:rounded-[40px] bg-[#F59E0B] overflow-hidden flex flex-col justify-end p-5 shadow-lg transition-transform duration-300 hover:-translate-y-1">
              <img
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80"
                alt="Fullstack Developer"
                className="absolute inset-0 w-full h-full object-cover object-top mix-blend-multiply opacity-90 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#D97706]/90 via-transparent to-transparent pointer-events-none" />
              <div className="relative z-10 text-left text-white space-y-0.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-200">
                  Fullstack Lead
                </span>
                <p className="text-sm sm:text-base font-extrabold leading-tight">
                  Alex Rivera
                </p>
                <p className="text-[11px] text-amber-100 font-medium">
                  Next.js · Go · Redis
                </p>
              </div>
            </div>

            {/* Card 2: Mint Green / Frontend & UI */}
            <div className="group relative h-72 sm:h-84 md:h-[400px] rounded-[32px] md:rounded-[40px] bg-[#10B981] overflow-hidden flex flex-col justify-end p-5 shadow-lg transition-transform duration-300 hover:-translate-y-1">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80"
                alt="Frontend Specialist"
                className="absolute inset-0 w-full h-full object-cover object-top mix-blend-multiply opacity-90 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#059669]/90 via-transparent to-transparent pointer-events-none" />
              <div className="relative z-10 text-left text-white space-y-0.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-200">
                  Frontend &amp; UI/UX
                </span>
                <p className="text-sm sm:text-base font-extrabold leading-tight">
                  Clara Thorne
                </p>
                <p className="text-[11px] text-emerald-100 font-medium">
                  React · TypeScript · Figma
                </p>
              </div>
            </div>

            {/* Card 3: Sky Blue / Backend Architect */}
            <div className="group relative h-72 sm:h-84 md:h-[400px] rounded-[32px] md:rounded-[40px] bg-[#3B82F6] overflow-hidden flex flex-col justify-end p-5 shadow-lg transition-transform duration-300 hover:-translate-y-1">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80"
                alt="Backend Architect"
                className="absolute inset-0 w-full h-full object-cover object-top mix-blend-multiply opacity-90 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2563EB]/90 via-transparent to-transparent pointer-events-none" />
              <div className="relative z-10 text-left text-white space-y-0.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-200">
                  Systems Architect
                </span>
                <p className="text-sm sm:text-base font-extrabold leading-tight">
                  Marcus Vance
                </p>
                <p className="text-[11px] text-blue-100 font-medium">
                  PostgreSQL · Docker · Rust
                </p>
              </div>
            </div>

            {/* Card 4: Lilac Purple / AI & ML Engineer */}
            <div className="group relative h-72 sm:h-84 md:h-[400px] rounded-[32px] md:rounded-[40px] bg-[#A855F7] overflow-hidden flex flex-col justify-end p-5 shadow-lg transition-transform duration-300 hover:-translate-y-1">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
                alt="AI Specialist"
                className="absolute inset-0 w-full h-full object-cover object-top mix-blend-multiply opacity-90 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#9333EA]/90 via-transparent to-transparent pointer-events-none" />
              <div className="relative z-10 text-left text-white space-y-0.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-200">
                  AI &amp; LLM Specialist
                </span>
                <p className="text-sm sm:text-base font-extrabold leading-tight">
                  Maya Lin
                </p>
                <p className="text-[11px] text-purple-100 font-medium">
                  Python · LangChain · Ollama
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          3. SECTION 2: CONCENTRIC ARC RADAR ("New Solutions")
      ───────────────────────────────────────────────────────────────────────────── */}
      <section id="solutions" className="relative py-20 md:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white/70 border-y border-[#E2E8F0]">
        <div className="max-w-5xl mx-auto relative">
          {/* The Multi-Colored Concentric Arc SVG Frame */}
          <div className="relative flex flex-col items-center justify-center pt-8 pb-12">
            <svg
              className="w-full max-w-2xl h-auto overflow-visible opacity-80"
              viewBox="0 0 600 300"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer Arc (Mint) */}
              <path
                d="M 50 300 A 250 250 0 0 1 550 300"
                stroke="#10B981"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              {/* Middle Arc (Purple) */}
              <path
                d="M 100 300 A 200 200 0 0 1 500 300"
                stroke="#8B5CF6"
                strokeWidth="1.5"
              />
              {/* Inner Arc (Amber) */}
              <path
                d="M 150 300 A 150 150 0 0 1 450 300"
                stroke="#F59E0B"
                strokeWidth="1.5"
                strokeDasharray="6 6"
              />
            </svg>

            {/* Floating Developer Nodes on Arcs */}
            <div className="absolute top-[18%] left-[12%] sm:left-[16%] flex items-center gap-2 p-1.5 rounded-full bg-white shadow-md border border-[#E2E8F0] animate-bounce duration-1000">
              <span className="w-7 h-7 rounded-full bg-[#10B981] text-white text-[10px] font-bold flex items-center justify-center">
                TS
              </span>
            </div>

            <div className="absolute top-[8%] left-[45%] flex items-center gap-2 p-1.5 rounded-full bg-white shadow-md border border-[#E2E8F0]">
              <span className="w-8 h-8 rounded-full bg-[#3B82F6] text-white text-[11px] font-bold flex items-center justify-center">
                GO
              </span>
            </div>

            <div className="absolute top-[18%] right-[12%] sm:right-[16%] flex items-center gap-2 p-1.5 rounded-full bg-white shadow-md border border-[#E2E8F0]">
              <span className="w-7 h-7 rounded-full bg-[#A855F7] text-white text-[10px] font-bold flex items-center justify-center">
                AI
              </span>
            </div>

            <div className="absolute top-[50%] left-[8%] hidden sm:flex items-center gap-2 p-1.5 rounded-full bg-white shadow-md border border-[#E2E8F0]">
              <span className="w-7 h-7 rounded-full bg-[#F59E0B] text-white text-[10px] font-bold flex items-center justify-center">
                UI
              </span>
            </div>

            <div className="absolute top-[50%] right-[8%] hidden sm:flex items-center gap-2 p-1.5 rounded-full bg-white shadow-md border border-[#E2E8F0]">
              <span className="w-7 h-7 rounded-full bg-[#FF5733] text-white text-[10px] font-bold flex items-center justify-center">
                DEV
              </span>
            </div>

            {/* Center Content Inside Arc */}
            <div className="mt-[-90px] sm:mt-[-110px] max-w-lg text-center space-y-4 z-10 px-4">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#64748B]">
                Transform Collaboration
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0F172A] tracking-tight">
                New Solutions
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Algoritma Devora mencocokkan developer berdasarkan tech stack yang saling melengkapi, ketersediaan jam kerja nyata, dan visi proyek yang sama.
              </p>
              <div className="pt-2">
                <Link href="/find-partner">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0F172A] text-white text-xs font-bold shadow-md hover:bg-[#1E293B] transition-all"
                  >
                    <span>Learn more</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          4. SECTION 3: CONTINUOUS MULTI-COLOR MARQUEE TICKER (Exact match to Reference)
      ───────────────────────────────────────────────────────────────────────────── */}
      <div className="py-6 bg-[#FAF9F5] border-b border-[#E2E8F0] overflow-hidden whitespace-nowrap select-none">
        <div className="animate-marquee flex items-center gap-8 text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-wider">
          <span className="text-[#10B981]">BALANCE</span>
          <span className="text-[#64748B]">•</span>
          <span className="text-[#F59E0B]">TEAM</span>
          <span className="text-[#64748B]">•</span>
          <span className="text-[#8B5CF6]">SOCIAL</span>
          <span className="text-[#64748B]">•</span>
          <span className="text-[#3B82F6]">GROWTH</span>
          <span className="text-[#64748B]">•</span>
          <span className="text-[#FF5733]">FRONTEND</span>
          <span className="text-[#64748B]">•</span>
          <span className="text-[#14B8A6]">BACKEND</span>
          <span className="text-[#64748B]">•</span>
          <span className="text-[#6366F1]">AI &amp; LLM</span>
          <span className="text-[#64748B]">•</span>
          <span className="text-[#EC4899]">FULLSTACK</span>
          <span className="text-[#64748B]">•</span>
          <span className="text-[#10B981]">BALANCE</span>
          <span className="text-[#64748B]">•</span>
          <span className="text-[#F59E0B]">TEAM</span>
          <span className="text-[#64748B]">•</span>
          <span className="text-[#8B5CF6]">SOCIAL</span>
          <span className="text-[#64748B]">•</span>
          <span className="text-[#3B82F6]">GROWTH</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          5. SECTION 4: SPLIT FEATURE HIGHLIGHT ("Connectivity")
      ───────────────────────────────────────────────────────────────────────────── */}
      <section id="connectivity" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Headline & Editorial Context */}
          <div className="lg:col-span-5 space-y-5 text-left">
            <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-[#64748B] block">
              Platform of the future
            </span>
            <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#0F172A] leading-[1.05]">
              Connectivity
            </h2>
            <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 text-xs font-bold">
              Real-time Compatibility
            </div>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              Temukan developer yang memiliki ketersediaan jam kerja dan keahlian yang selaras untuk memulai sprint proyek tanpa hambatan birokrasi atau spekulasi.
            </p>
            <div className="pt-2">
              <Link href="/find-partner">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0F172A] text-white text-xs font-bold shadow-md hover:bg-[#1E293B] transition-all"
                >
                  <span>Explore Spec</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>
          </div>

          {/* Right Column: Rounded Photo Card with Floating UI Pill */}
          <div className="lg:col-span-7">
            <div className="relative rounded-[32px] md:rounded-[40px] bg-gradient-to-tr from-[#E0F2FE] via-[#F1F5F9] to-[#EDE9FE] p-6 sm:p-8 overflow-hidden shadow-xl border border-[#E2E8F0]">
              <div className="relative rounded-[24px] overflow-hidden shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&auto=format&fit=crop&q=80"
                  alt="Developers Collaborating"
                  className="w-full h-72 sm:h-96 object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                {/* Floating Metric Pill 1 (Match rate 98%) */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-white/60 space-y-0.5">
                  <span className="text-[9px] font-mono uppercase font-bold text-[#64748B] block">
                    Match Compatibility
                  </span>
                  <span className="text-xl font-black text-emerald-600">
                    98%
                  </span>
                </div>

                {/* Floating Metric Pill 2 (Verified Developer Info) */}
                <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-white/60 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FF5733] text-white text-xs font-bold flex items-center justify-center">
                    AK
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#0F172A] block">
                      Acelino K.
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Verified GitHub Spec</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          6. SECTION 5: MASSIVE DEEP DARK BENTO SECTION ("Strengthen Your Business")
      ───────────────────────────────────────────────────────────────────────────── */}
      <section id="ecosystem" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-[#0B0F19] text-white rounded-[36px] md:rounded-[48px] p-8 sm:p-12 md:p-16 space-y-20 shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Radial Glows inside Dark Box */}
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#8B5CF6]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-[#FF5733]/10 rounded-full blur-3xl pointer-events-none" />

          {/* ───────────────── ROW 1: Project Board (Left) + Text (Right) ───────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Mockup: Layered Slanted Card with 4 Colored Stat Boxes */}
            <div className="lg:col-span-6 relative">
              <div className="bg-[#1E293B]/80 border border-[#334155] rounded-[28px] p-6 shadow-xl space-y-4 backdrop-blur-md transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-xs font-mono text-[#94A3B8] ml-2">
                      Sprint Task Roadmap
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                    ACTIVE SPRINT
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#0F172A] p-3 rounded-xl border border-[#334155] space-y-1">
                    <span className="text-[10px] font-mono text-pink-400 font-bold">
                      UI/UX SPEC
                    </span>
                    <p className="text-xs font-bold text-white">
                      Design System Tokens
                    </p>
                    <span className="text-[9px] text-emerald-400 font-bold block">
                      ✓ Done
                    </span>
                  </div>
                  <div className="bg-[#0F172A] p-3 rounded-xl border border-[#334155] space-y-1">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      BACKEND API
                    </span>
                    <p className="text-xs font-bold text-white">
                      Prisma Schema &amp; Redis
                    </p>
                    <span className="text-[9px] text-amber-400 font-bold block">
                      ⚡ In Progress
                    </span>
                  </div>
                  <div className="bg-[#0F172A] p-3 rounded-xl border border-[#334155] space-y-1">
                    <span className="text-[10px] font-mono text-amber-400 font-bold">
                      FRONTEND
                    </span>
                    <p className="text-xs font-bold text-white">
                      Next.js 15 Client Views
                    </p>
                    <span className="text-[9px] text-blue-400 font-bold block">
                      ⏳ Pending
                    </span>
                  </div>
                  <div className="bg-[#0F172A] p-3 rounded-xl border border-[#334155] space-y-1">
                    <span className="text-[10px] font-mono text-blue-400 font-bold">
                      DEVOPS
                    </span>
                    <p className="text-xs font-bold text-white">
                      Docker &amp; CI Pipeline
                    </p>
                    <span className="text-[9px] text-purple-400 font-bold block">
                      ✓ Ready
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-[#0F172A]/70 rounded-xl border border-[#334155] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-[#FF5733]" />
                    <span className="text-xs font-mono text-[#E2E8F0]">
                      main ← feature/match-engine
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">
                    +480 lines
                  </span>
                </div>
              </div>
            </div>

            {/* Right Text */}
            <div className="lg:col-span-6 space-y-4 text-left">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#94A3B8]">
                Drive collaboration
              </span>
              <h3 className="text-3xl sm:text-5xl tracking-tight leading-[1.08]">
                <span className="font-normal text-white">Strengthen </span>
                <span className="font-black text-white">Your Business</span>
              </h3>
              <p className="text-sm font-bold text-purple-400">
                Developer Compatibility
              </p>
              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                Bentuk tim yang seimbang dengan keahlian frontend, backend, dan AI untuk mengeksekusi roadmap proyek lebih cepat tanpa kendala kekurangan personil.
              </p>
              <div className="pt-2">
                <Link href="/projects">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#0F172A] text-xs font-bold hover:bg-[#F1F5F9] transition-all"
                  >
                    <span>Explore Projects</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* ───────────────── ROW 2: Text (Left) + Chart Mockup (Right) ───────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Text */}
            <div className="lg:col-span-6 space-y-4 text-left order-2 lg:order-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-400">
                Algoritma Kecocokan
              </span>
              <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.08]">
                AI-Powered
              </h3>
              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                Sistem memetakan repositori GitHub, preferensi kerja async vs pair programming, dan jam luang nyata untuk memastikan probabilitas sukses proyek tertinggi.
              </p>
              <div className="pt-2">
                <Link href="/find-partner">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#0F172A] text-xs font-bold hover:bg-[#F1F5F9] transition-all"
                  >
                    <span>Try Matchmaker</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Right Mockup: Analytics & Curves */}
            <div className="lg:col-span-6 order-1 lg:order-2">
              <div className="bg-[#1E293B]/80 border border-[#334155] rounded-[28px] p-6 shadow-xl space-y-4 backdrop-blur-md transform rotate-1 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
                  <span className="text-xs font-mono text-[#94A3B8]">
                    Compatibility Radar Index
                  </span>
                  <span className="text-xs font-mono text-purple-400 font-bold">
                    SCORE: 98.4%
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
                    <span>Tech Stack Complementarity</span>
                    <span className="text-white font-bold">100%</span>
                  </div>
                  <div className="w-full h-2 bg-[#0F172A] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-full"></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#94A3B8] pt-1">
                    <span>Weekly Bandwidth Alignment</span>
                    <span className="text-white font-bold">95%</span>
                  </div>
                  <div className="w-full h-2 bg-[#0F172A] rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full w-[95%]"></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#94A3B8] pt-1">
                    <span>Async &amp; Timezone Sync</span>
                    <span className="text-white font-bold">96%</span>
                  </div>
                  <div className="w-full h-2 bg-[#0F172A] rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full w-[96%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ───────────────── ROW 3: Code Spec Mockup (Left) + Text (Right) ───────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Mockup: Verified Git Logs */}
            <div className="lg:col-span-6">
              <div className="bg-[#1E293B]/80 border border-[#334155] rounded-[28px] p-6 shadow-xl space-y-4 backdrop-blur-md transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
                  <span className="text-xs font-mono text-[#94A3B8]">
                    Verified Developer Matrix
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">
                    GITHUB SYNCED
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-[#0F172A] border border-[#334155] flex items-center justify-between">
                    <span className="text-[#E2E8F0]">commit: feat(engine) websocket</span>
                    <span className="text-emerald-400 font-bold">Verified</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0F172A] border border-[#334155] flex items-center justify-between">
                    <span className="text-[#E2E8F0]">pr: #42 add redis queue broker</span>
                    <span className="text-purple-400 font-bold">Merged</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0F172A] border border-[#334155] flex items-center justify-between">
                    <span className="text-[#E2E8F0]">build: next.js 15 app router</span>
                    <span className="text-blue-400 font-bold">Passed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Text */}
            <div className="lg:col-span-6 space-y-4 text-left">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#94A3B8]">
                Transparansi &amp; Bukti Nyata
              </span>
              <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.08]">
                Analytics &amp; Insight
              </h3>
              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                Pantau kecocokan ritme kerja tim, milestone sprint, dan kontribusi kode secara transparan agar kolaborasi berjalan sehat dan berkelanjutan.
              </p>
              <div className="pt-2">
                <Link href="/matches">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#0F172A] text-xs font-bold hover:bg-[#F1F5F9] transition-all"
                  >
                    <span>View Matches</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* ───────────────── ROW 4: Text (Left) + Community Table (Right) ───────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Text */}
            <div className="lg:col-span-6 space-y-4 text-left order-2 lg:order-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#94A3B8]">
                Open Projects Ecosystem
              </span>
              <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.08]">
                Devora Community
              </h3>
              <p className="text-sm font-bold text-amber-400">
                Ratusan proyek aktif siap menyambut keahlianmu
              </p>
              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                Gabung dengan developer lain yang sedang mencari rekan tim untuk hackathon, open-source tooling, atau commercial SaaS MVP.
              </p>
              <div className="pt-2">
                <Link href="/projects">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#0F172A] text-xs font-bold hover:bg-[#F1F5F9] transition-all"
                  >
                    <span>Explore Community</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Right Mockup: Project Listing Table */}
            <div className="lg:col-span-6 order-1 lg:order-2">
              <div className="bg-[#1E293B]/80 border border-[#334155] rounded-[28px] p-6 shadow-xl space-y-3 backdrop-blur-md transform rotate-1 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
                  <span className="text-xs font-mono text-[#94A3B8]">
                    Live Project Opportunities
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    3 OPEN ROLES
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="p-3 bg-[#0F172A] rounded-xl border border-[#334155] flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">SQLlens Query Visualizer</h4>
                      <p className="text-[10px] text-[#94A3B8]">Need: Frontend Lead (Next.js)</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                      MVP Sprint
                    </span>
                  </div>

                  <div className="p-3 bg-[#0F172A] rounded-xl border border-[#334155] flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">VaultSync Secrets CLI</h4>
                      <p className="text-[10px] text-[#94A3B8]">Need: Rust / Golang Engineer</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                      Beta
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          7. SECTION 6: PHONE ORBIT ("Accessible Everywhere")
      ───────────────────────────────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-12 relative overflow-hidden">
        <div className="space-y-4 max-w-2xl mx-auto">
          <h2 className="text-4xl sm:text-6xl font-extrabold text-[#0F172A] tracking-tight">
            Accessible Everywhere
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
            Tetap terhubung dengan calon partner dan tim proyek melalui web, desktop, dan integrasi developer tools favoritmu.
          </p>
          <div>
            <Link href="/find-partner">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0F172A] text-white text-xs font-bold shadow-md hover:bg-[#1E293B] transition-all"
              >
                <span>Launch Web App</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </div>

        {/* Orbit System with Center Smartphone Mockup */}
        <div className="relative flex items-center justify-center py-10">
          {/* Concentric Orbit Rings */}
          <div className="absolute w-[340px] h-[340px] sm:w-[480px] sm:h-[480px] rounded-full border border-dashed border-[#CBD5E1] pointer-events-none" />
          <div className="absolute w-[440px] h-[440px] sm:w-[620px] sm:h-[620px] rounded-full border border-[#E2E8F0] pointer-events-none" />

          {/* Floating Orbit Integration Badges */}
          <div className="absolute top-[8%] left-[20%] p-2 rounded-2xl bg-white shadow-md border border-[#E2E8F0] text-xs font-bold">
            GitHub
          </div>
          <div className="absolute top-[18%] right-[15%] p-2 rounded-2xl bg-white shadow-md border border-[#E2E8F0] text-xs font-bold text-blue-600">
            VS Code
          </div>
          <div className="absolute bottom-[20%] left-[10%] p-2 rounded-2xl bg-white shadow-md border border-[#E2E8F0] text-xs font-bold text-indigo-600">
            Discord
          </div>
          <div className="absolute bottom-[15%] right-[18%] p-2 rounded-2xl bg-white shadow-md border border-[#E2E8F0] text-xs font-bold text-purple-600">
            Figma
          </div>

          {/* Center Smartphone Mockup */}
          <div className="relative w-64 sm:w-72 bg-[#0F172A] rounded-[44px] p-3 shadow-2xl border-4 border-[#1E293B] z-10">
            <div className="w-full bg-[#FAF9F5] rounded-[36px] p-4 text-left space-y-4 overflow-hidden border border-[#E2E8F0]">
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] font-mono font-bold text-[#FF5733]">DEVORA MOBILE</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>

              {/* Mini Card in Phone */}
              <div className="p-3 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#FF5733] text-white text-xs font-bold flex items-center justify-center">
                    SV
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#0F172A]">Sarah Vania</h5>
                    <p className="text-[9px] text-[#64748B]">Backend Architect</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] pt-1">
                  <span className="text-emerald-600 font-bold">96% Match</span>
                  <span className="text-[#64748B]">12h/week</span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm space-y-1">
                <span className="text-[9px] font-mono text-[#64748B] uppercase">Active Message</span>
                <p className="text-[11px] text-[#0F172A] font-medium leading-tight">
                  &ldquo;Siap kolaborasi buat sprint backend weekend ini!&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Badges */}
        <div className="flex items-center justify-center gap-3 pt-4">
          <span className="px-4 py-2 rounded-full bg-white border border-[#E2E8F0] text-xs font-bold text-[#0F172A] shadow-xs">
            🌐 Web Application
          </span>
          <span className="px-4 py-2 rounded-full bg-white border border-[#E2E8F0] text-xs font-bold text-[#0F172A] shadow-xs">
            ⚡ Direct Git Sync
          </span>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          8. SECTION 7: ASYMMETRIC COLORFUL MASONRY COLLAGE ("Spotlight" / Testimonials)
      ───────────────────────────────────────────────────────────────────────────── */}
      <section id="spotlight" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch max-w-5xl mx-auto">
          {/* Card 1 (Left: Sky Blue Card) */}
          <div className="md:col-span-3 rounded-[32px] bg-[#38BDF8] overflow-hidden relative min-h-[280px] shadow-lg flex flex-col justify-end p-5">
            <img
              src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=80"
              alt="Community Developer"
              className="absolute inset-0 w-full h-full object-cover object-top mix-blend-multiply opacity-90"
            />
            <div className="relative z-10 text-white space-y-0.5">
              <span className="text-[10px] font-mono uppercase font-bold text-sky-100">
                Fullstack Dev
              </span>
              <p className="text-xs font-bold">Nadia S.</p>
            </div>
          </div>

          {/* Card 2 & Testimonial Box (Center-Left: Warm Amber Card + Review) */}
          <div className="md:col-span-3 space-y-4 flex flex-col justify-between">
            <div className="rounded-[32px] bg-[#F59E0B] overflow-hidden relative h-56 shadow-lg p-5 flex flex-col justify-end">
              <img
                src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80"
                alt="Community Developer"
                className="absolute inset-0 w-full h-full object-cover object-top mix-blend-multiply opacity-90"
              />
              <div className="relative z-10 text-white space-y-0.5">
                <span className="text-[10px] font-mono uppercase font-bold text-amber-100">
                  Backend Lead
                </span>
                <p className="text-xs font-bold">Budi Santoso</p>
              </div>
            </div>

            <div className="rounded-[32px] bg-[#F59E0B] p-5 text-white shadow-lg space-y-2 text-left">
              <p className="text-[11px] font-bold leading-relaxed text-amber-950">
                &ldquo;Menemukan partner frontend dalam 2 hari di Devora. Kami berhasil rilis MVP dalam 3 minggu sprint!&rdquo;
              </p>
              <Link href="/find-partner">
                <button
                  type="button"
                  className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0F172A] text-white text-[10px] font-bold hover:bg-[#1E293B]"
                >
                  <span>Cari Partner</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </Link>
            </div>
          </div>

          {/* Card 3 & 4 (Center-Right: Purple Spotlight Banner + Purple Portrait) */}
          <div className="md:col-span-3 space-y-4 flex flex-col justify-between">
            <div className="rounded-[32px] bg-[#A855F7] p-5 text-white shadow-lg space-y-1 text-left">
              <span className="text-[10px] font-mono uppercase tracking-widest text-purple-200">
                Developer Community
              </span>
              <h4 className="text-lg font-black leading-tight">
                Spotlight™
              </h4>
            </div>

            <div className="rounded-[32px] bg-[#9333EA] overflow-hidden relative h-64 shadow-lg p-5 flex flex-col justify-end">
              <img
                src="https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=500&auto=format&fit=crop&q=80"
                alt="Community Developer"
                className="absolute inset-0 w-full h-full object-cover object-top mix-blend-multiply opacity-90"
              />
              <div className="relative z-10 text-white space-y-0.5">
                <span className="text-[10px] font-mono uppercase font-bold text-purple-100">
                  AI Specialist
                </span>
                <p className="text-xs font-bold">Rian Kusuma</p>
              </div>
            </div>
          </div>

          {/* Card 5 (Right: Emerald Green Card) */}
          <div className="md:col-span-3 rounded-[32px] bg-[#059669] overflow-hidden relative min-h-[280px] shadow-lg flex flex-col justify-end p-5">
            <img
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80"
              alt="Community Developer"
              className="absolute inset-0 w-full h-full object-cover object-top mix-blend-multiply opacity-90"
            />
            <div className="relative z-10 text-white space-y-0.5">
              <span className="text-[10px] font-mono uppercase font-bold text-emerald-100">
                UI Specialist
              </span>
              <p className="text-xs font-bold">Hannah Lee</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          9. SECTION 8: FINAL DARK CTA CARD ("Get started with Conectere." -> "Get started with Devora.")
      ───────────────────────────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="bg-[#0B0F19] text-white rounded-[36px] md:rounded-[48px] p-10 sm:p-16 md:p-20 text-center space-y-6 shadow-2xl relative overflow-hidden">
          {/* Ambient Glows on Corners matching Reference */}
          <div className="absolute bottom-[-10%] left-[-5%] w-72 h-72 bg-[#F59E0B]/30 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute top-[-10%] right-[-5%] w-72 h-72 bg-[#38BDF8]/25 rounded-full blur-[80px] pointer-events-none" />

          <div className="space-y-3 relative z-10">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#94A3B8] block">
              Build Your Dream Project
            </span>
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.05]">
              Get started with <span className="text-[#FF5733]">Devora.</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-md mx-auto leading-relaxed pt-1">
              Temukan partner ngoding yang tepat dan mulai bangun produk impianmu hari ini secara gratis.
            </p>
          </div>

          <div className="pt-3 relative z-10">
            <Link href="/find-partner">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-[#0F172A] text-xs sm:text-sm font-bold shadow-xl hover:bg-[#F1F5F9] hover:scale-105 active:scale-95 transition-all"
              >
                <span>Find Partner Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          10. SECTION 9: MINIMALIST CLEAN FOOTER (Exact Match to Reference)
      ───────────────────────────────────────────────────────────────────────────── */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-8">
        {/* Center Brand Logo & Tagline */}
        <div className="space-y-2 flex flex-col items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-xl bg-[#FF5733] flex items-center justify-center text-white shadow-sm">
              <Flame className="w-4 h-4 fill-white" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-[#0F172A]">
              Devora
            </span>
          </Link>
          <p className="text-[11px] text-[#64748B]">
            A platform connecting developers to build and ship together.
          </p>
        </div>

        {/* Clean Horizontal Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-[#64748B]">
          <Link href="/" className="hover:text-[#0F172A] transition-colors">
            Home
          </Link>
          <Link href="/find-partner" className="hover:text-[#0F172A] transition-colors">
            Find Partner
          </Link>
          <Link href="/projects" className="hover:text-[#0F172A] transition-colors">
            Projects
          </Link>
          <Link href="/matches" className="hover:text-[#0F172A] transition-colors">
            Matches
          </Link>
          <Link href="/profile" className="hover:text-[#0F172A] transition-colors">
            Profile
          </Link>
          <Link href="/signin" className="hover:text-[#0F172A] transition-colors">
            Sign in
          </Link>
        </div>

        {/* Copyright Notice */}
        <div className="pt-4 border-t border-[#E2E8F0] text-[11px] text-[#94A3B8]">
          © 2026 Devora. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
