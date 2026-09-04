"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { useMatchStore } from "@/store/useMatchStore";
import { useProjectStore } from "@/store/useProjectStore";

// Lucide Icons for general navigation & UI actions
import {
  Flame,
  ArrowRight,
  User,
  Star,
  Clock,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  FolderGit2,
} from "lucide-react";

// Official Font Awesome Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLightbulb,
  faRocket,
  faBullseye,
  faLaptopCode,
  faPalette,
  faBolt,
  faDatabase,
  faShieldHalved,
  faChartSimple,
  faChartLine,
  faCoins,
  faMobileScreen,
  faClock,
  faRobot,
  faBrain,
  faGear,
  faCloud,
  faGlobe,
  faBox,
} from "@fortawesome/free-solid-svg-icons";

export default function LandingPage() {
  const router = useRouter();
  const { currentUser, isAuthenticated, fetchProfile } = useUserStore();
  const { fetchCandidates, fetchMatches, fetchIncomingLikes } = useMatchStore();
  const { fetchProjects } = useProjectStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [activeDomainTab, setActiveDomainTab] = useState<string>("fullstack");

  useEffect(() => {
    fetchProfile();
    fetchCandidates();
    fetchMatches();
    fetchIncomingLikes();
    fetchProjects();
  }, [fetchProfile, fetchCandidates, fetchMatches, fetchIncomingLikes, fetchProjects]);

  // Domain showcase data for Section 5
  const domainData: Record<
    string,
    {
      title: string;
      desc: string;
      tags: string[];
      roleNeeded: string;
      hours: string;
      author: string;
      rating: string;
    }[]
  > = {
    fullstack: [
      {
        title: "AI Storyboard Studio",
        desc: "Generator visual storyboard berbasis Next.js 15 dan Ollama local models.",
        tags: ["Next.js", "TypeScript", "Tailwind", "PostgreSQL"],
        roleNeeded: "Backend Architect",
        hours: "8-10 jam/minggu",
        author: "Alex Rivera",
        rating: "4.9",
      },
      {
        title: "IndieSaaS Metric Tracker",
        desc: "Dashboard analitik revenue real-time untuk solo founder & indie hacker.",
        tags: ["React 19", "Node.js", "Prisma", "Redis"],
        roleNeeded: "Frontend Lead",
        hours: "6-8 jam/minggu",
        author: "Marcus Vance",
        rating: "4.8",
      },
      {
        title: "OmniDoc Editor",
        desc: "Collaborative markdown editor dengan live CRDT sync & syntax highlighter.",
        tags: ["TypeScript", "WebSocket", "Tailwind"],
        roleNeeded: "UI/UX Specialist",
        hours: "5-7 jam/minggu",
        author: "Sarah Chen",
        rating: "5.0",
      },
    ],
    ai: [
      {
        title: "Local LLM Agent Sandbox",
        desc: "Orkestrator multi-agent otonom untuk riset dan otomatisasi kode lokal.",
        tags: ["Python", "LangChain", "FastAPI", "Ollama"],
        roleNeeded: "Python & Agent Dev",
        hours: "10-12 jam/minggu",
        author: "Maya Lin",
        rating: "5.0",
      },
      {
        title: "DocuSense Semantic Search",
        desc: "Vector search engine untuk repositori kode besar dengan reranking canggih.",
        tags: ["Rust", "PyTorch", "Qdrant", "Next.js"],
        roleNeeded: "ML Systems Engineer",
        hours: "8-10 jam/minggu",
        author: "Rian Kusuma",
        rating: "4.9",
      },
    ],
    mobile: [
      {
        title: "HabitLoop for Remote Devs",
        desc: "Aplikasi produktivitas cross-platform dengan gamifikasi fokus & istirahat.",
        tags: ["Flutter", "Dart", "Supabase"],
        roleNeeded: "Flutter / Mobile Lead",
        hours: "8-10 jam/minggu",
        author: "Kevin Santoso",
        rating: "4.9",
      },
      {
        title: "GitPocket Tracker",
        desc: "Klien mobile ringan untuk review Pull Request dan notifikasi GitHub real-time.",
        tags: ["React Native", "Expo", "TypeScript"],
        roleNeeded: "React Native Dev",
        hours: "6-8 jam/minggu",
        author: "Daniel Aris",
        rating: "4.8",
      },
    ],
    backend: [
      {
        title: "Distributed Redis Queue Engine",
        desc: "Message broker berkecepatan tinggi dengan jaminan pengiriman persisten.",
        tags: ["Go", "Redis", "Docker", "gRPC"],
        roleNeeded: "DevOps & Cloud Engineer",
        hours: "10-14 jam/minggu",
        author: "Clara Thorne",
        rating: "5.0",
      },
      {
        title: "VaultSync Secrets CLI",
        desc: "CLI enkripsi terdesentralisasi untuk manajemen env secrets tim developer.",
        tags: ["Rust", "PostgreSQL", "Linux"],
        roleNeeded: "Rust Systems Engineer",
        hours: "6-8 jam/minggu",
        author: "Eko Pratama",
        rating: "4.9",
      },
    ],
    design: [
      {
        title: "Aura UI Design System",
        desc: "Koleksi komponen UI open-source bertema taktil untuk web aplikasi masa depan.",
        tags: ["Figma", "Tailwind CSS", "React", "Radix"],
        roleNeeded: "Design Systems Lead",
        hours: "5-8 jam/minggu",
        author: "Hannah Lee",
        rating: "5.0",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#0F172A] selection:bg-[#FF5733] selection:text-white flex flex-col font-sans antialiased overflow-x-hidden">
      {/* ─────────────────────────────────────────────────────────────────────────────
          1. HEADER / NAVIGATION BAR (Clean, Non-Pill, Rectangular Buttons)
      ───────────────────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full bg-[#FAF9F5]/90 backdrop-blur-md transition-all border-b border-[#E2E8F0]/70">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#FF5733] flex items-center justify-center text-white shadow-md shadow-[#FF5733]/25 group-hover:scale-105 transition-transform duration-200">
              <Flame className="w-5 h-5 fill-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-[#0F172A]">
              Devora
            </span>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#64748B]">
            <a href="#about" className="hover:text-[#0F172A] transition-colors">
              About
            </a>
            <a href="#domains" className="hover:text-[#0F172A] transition-colors">
              Domains
            </a>
            <a href="#projects" className="hover:text-[#0F172A] transition-colors">
              Projects
            </a>
            <a href="#why-devora" className="hover:text-[#0F172A] transition-colors">
              Why Devora
            </a>
            <a href="#stories" className="hover:text-[#0F172A] transition-colors">
              Stories
            </a>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E2E8F0] bg-white text-xs font-bold text-[#0F172A] hover:border-[#FF5733] transition-colors shadow-xs"
                >
                  <User className="w-3.5 h-3.5 text-[#FF5733]" />
                  <span>{currentUser.name || "Profil Saya"}</span>
                </Link>
                <Link href="/find-partner">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F172A] text-white text-xs font-bold shadow-md hover:bg-[#1E293B] hover:scale-105 active:scale-95 transition-all"
                  >
                    <span>Cari Partner</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/signin">
                  <button
                    type="button"
                    className="px-4 py-2 text-xs sm:text-sm font-bold text-[#0F172A] hover:text-[#FF5733] transition-colors"
                  >
                    Login
                  </button>
                </Link>
                <Link href="/find-partner">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0F172A] text-white text-xs sm:text-sm font-bold shadow-md hover:bg-[#1E293B] hover:scale-105 active:scale-95 transition-all"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>
            )}

            {/* Mobile Navigation Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl border border-[#E2E8F0] bg-white text-[#0F172A]"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E2E8F0] bg-[#FAF9F5] px-5 py-4 space-y-2 shadow-lg">
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-bold text-[#0F172A] hover:bg-white"
            >
              About
            </a>
            <a
              href="#domains"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-bold text-[#0F172A] hover:bg-white"
            >
              Domains
            </a>
            <a
              href="#projects"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-bold text-[#0F172A] hover:bg-white"
            >
              Projects
            </a>
            <a
              href="#why-devora"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-bold text-[#0F172A] hover:bg-white"
            >
              Why Devora
            </a>
            <a
              href="#stories"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-bold text-[#0F172A] hover:bg-white"
            >
              Stories
            </a>
          </div>
        )}
      </header>

      {/* ─────────────────────────────────────────────────────────────────────────────
          2. HERO SECTION (NO PILL BADGE, Grand Headline, CTA & 3D Character Group)
      ───────────────────────────────────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-16 md:pt-16 md:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Soft Ambient Radial Background Glows */}
        <div className="absolute top-0 left-[-5%] w-[450px] h-[450px] bg-[#BAE6FD]/40 rounded-full blur-[110px] pointer-events-none -z-10" />
        <div className="absolute top-0 right-[-5%] w-[450px] h-[450px] bg-[#FDE68A]/35 rounded-full blur-[110px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto space-y-8 text-center">
          {/* Hero Headline without any pill badge */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#0F172A] leading-[1.08]">
              Learn Smarter, Grow Faster, <br className="hidden sm:inline" />
              Succeed Anywhere.
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-[#64748B] max-w-2xl mx-auto leading-relaxed">
              Temukan partner ngoding yang tepat dengan keahlian yang saling melengkapi dan komitmen waktu yang selaras. Bangun proyek impianmu bersama para builder sejati.
            </p>
          </div>

          {/* Primary CTA Buttons (Rectangular Rounded-xl) */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
            <Link href="/find-partner">
              <button
                type="button"
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-[#0F172A] text-white text-sm sm:text-base font-bold shadow-xl hover:bg-[#1E293B] hover:scale-105 active:scale-95 transition-all"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/projects">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white border border-[#E2E8F0] text-[#0F172A] text-sm sm:text-base font-bold hover:bg-[#F8FAFC] transition-all shadow-xs"
              >
                <span>Explore Projects</span>
              </button>
            </Link>
          </div>

          {/* 3D Hero Developer Group Visual */}
          <div className="pt-6 max-w-5xl mx-auto">
            <div className="relative rounded-[32px] sm:rounded-[44px] overflow-hidden shadow-2xl border-4 border-white bg-gradient-to-b from-[#BAE6FD]/30 to-white">
              <img
                src="/images/redesign/hero-developers-3d.jpg"
                alt="Devora 3D Developers Community"
                className="w-full h-auto max-h-[520px] object-cover object-center"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          3. TRUSTED TECH ECOSYSTEM LOGO BAR (Clean, Horizontal Brand Strip)
      ───────────────────────────────────────────────────────────────────────────── */}
      <section className="py-8 bg-[#FAF9F5] border-y border-[#E2E8F0] overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-mono font-bold uppercase tracking-widest text-[#94A3B8] mb-6">
            Trusted by Builders Across Leading Ecosystems
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-sm sm:text-base font-black text-[#64748B] opacity-80 select-none">
            <span className="hover:text-[#0F172A] transition-colors flex items-center gap-2">
              <FolderGit2 className="w-4.5 h-4.5 text-[#0F172A]" /> GitHub
            </span>
            <span className="hover:text-[#0F172A] transition-colors">Next.js</span>
            <span className="hover:text-[#0F172A] transition-colors">Supabase</span>
            <span className="hover:text-[#0F172A] transition-colors">PostgreSQL</span>
            <span className="hover:text-[#0F172A] transition-colors">Docker</span>
            <span className="hover:text-[#0F172A] transition-colors">Prisma</span>
            <span className="hover:text-[#0F172A] transition-colors">TailwindCSS</span>
            <span className="hover:text-[#0F172A] transition-colors">Vercel</span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          4. BIG TYPOGRAPHY STATEMENT (NO PILL BADGE, Font Awesome Icons)
      ───────────────────────────────────────────────────────────────────────────── */}
      <section id="about" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="space-y-10">
          {/* Eyebrow Label (Clean typography, no pill wrapper) */}
          <div className="text-left text-xs font-mono font-bold tracking-widest uppercase text-[#FF5733]">
            ABOUT DEVORA
          </div>

          {/* Giant Statement with Font Awesome Vector Icons */}
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-[#0F172A] leading-[1.25] tracking-tight text-left">
            Platform that{" "}
            <FontAwesomeIcon
              icon={faLightbulb}
              className="text-amber-500 inline-block w-8 h-8 sm:w-10 sm:h-10 mx-1.5 align-middle"
            />{" "}
            helps ambitious{" "}
            <FontAwesomeIcon
              icon={faRocket}
              className="text-[#FF5733] inline-block w-8 h-8 sm:w-10 sm:h-10 mx-1.5 align-middle"
            />{" "}
            builders match faster, write code, and ship{" "}
            <FontAwesomeIcon
              icon={faBullseye}
              className="text-blue-600 inline-block w-8 h-8 sm:w-10 sm:h-10 mx-1.5 align-middle"
            />{" "}
            anywhere
          </h2>

          {/* Bottom Split: Stats on Left + Interactive 3D Avatar Card on Right */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-4">
            {/* Left Stats Counters */}
            <div className="md:col-span-6 flex items-center gap-10 sm:gap-14 text-left">
              <div className="space-y-1">
                <span className="text-4xl sm:text-5xl font-black text-[#0F172A] tracking-tight">
                  15k+
                </span>
                <p className="text-xs sm:text-sm font-semibold text-[#64748B]">
                  Active Builders &amp; Developers
                </p>
              </div>

              <div className="w-[1px] h-12 bg-[#E2E8F0]"></div>

              <div className="space-y-1">
                <span className="text-4xl sm:text-5xl font-black text-[#0F172A] tracking-tight">
                  3.2k+
                </span>
                <p className="text-xs sm:text-sm font-semibold text-[#64748B]">
                  Projects Successfully Shipped
                </p>
              </div>
            </div>

            {/* Right Interactive 3D Character Card with Paper Airplane */}
            <div className="md:col-span-6 flex justify-end">
              <div className="w-full max-w-sm rounded-[24px] bg-white border border-[#E2E8F0] p-4 shadow-xl flex items-center gap-4 hover:shadow-2xl transition-all">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 bg-[#F1F5F9]">
                  <img
                    src="/images/redesign/dev-avatar-plane.jpg"
                    alt="Devora 3D Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-2 text-left">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#FF5733] tracking-wide block">
                    Fast Onboarding
                  </span>
                  <p className="text-xs font-bold text-[#0F172A] leading-snug">
                    Mulai perjalanan kolaborasimu dan temukan co-builder ideal dalam hitungan menit.
                  </p>
                  <Link href="/find-partner">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-[#0F172A] hover:text-[#FF5733] transition-colors"
                    >
                      <span>Explore Matches</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          5. CATEGORY & DOMAIN SHOWCASE (NO PILL BADGE, Clean Rectangular Tabs)
      ───────────────────────────────────────────────────────────────────────────── */}
      <section id="domains" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="space-y-10 text-center">
          {/* Header without pill badges */}
          <div className="space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#64748B]">
              FEATURED DOMAINS
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0F172A] tracking-tight">
              Collaboration Built for <span className="text-[#FF5733]">Real Builders</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Pilih domain teknologi yang ingin kamu eksplorasi dan bangun bersama rekan baru.
            </p>
          </div>

          {/* Clean Rectangular Tabs (No Pill Badges) */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {[
              { id: "fullstack", label: "Fullstack & Web" },
              { id: "ai", label: "AI & LLMs" },
              { id: "mobile", label: "Mobile Apps" },
              { id: "backend", label: "Cloud & Backend" },
              { id: "design", label: "UI/UX Design" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveDomainTab(tab.id)}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeDomainTab === tab.id
                    ? "bg-[#0F172A] text-white shadow-sm"
                    : "bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Split Showcase: Layered Domain Cards (Left) + 3D Pointing Character on Lawn (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-6 max-w-6xl mx-auto">
            {/* Left: Domain Project Preview Cards */}
            <div className="lg:col-span-7 space-y-4 text-left">
              {(domainData[activeDomainTab] || domainData["fullstack"]).map((proj, idx) => (
                <div
                  key={idx}
                  className="p-5 sm:p-6 rounded-[20px] bg-white border border-[#E2E8F0] shadow-sm hover:shadow-lg transition-all space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-[11px] font-mono font-bold border border-blue-100">
                      {proj.roleNeeded}
                    </span>
                    <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{proj.rating}</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-[#0F172A] group-hover:text-[#FF5733] transition-colors">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-[#64748B] leading-relaxed pt-1">
                      {proj.desc}
                    </p>
                  </div>

                  {/* Tech Tags (Rectangular rounded-md) */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {proj.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2.5 py-1 rounded-md bg-[#F1F5F9] text-[#475569] text-[11px] font-semibold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-[#F1F5F9] text-xs text-[#64748B]">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                      <span>{proj.hours}</span>
                    </span>
                    <Link href="/find-partner">
                      <span className="font-bold text-[#0F172A] group-hover:underline flex items-center gap-1">
                        <span>Lihat Posisi</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: 3D Pointing Developer Character on Green Lawn */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative w-full max-w-sm rounded-[32px] overflow-hidden shadow-xl border-4 border-white bg-gradient-to-b from-[#BAE6FD]/40 via-white to-[#DCFCE7]/60 p-2 text-center">
                <img
                  src="/images/redesign/dev-pointing-character.jpg"
                  alt="3D Developer Pointing"
                  className="w-full h-80 sm:h-96 object-cover object-top rounded-[24px]"
                />
                <div className="py-4 px-2 space-y-2">
                  <span className="text-xs font-mono font-bold uppercase text-[#0F172A] block">
                    Curated Domain Paths
                  </span>
                  <Link href="/projects">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0F172A] text-white text-xs font-bold shadow-md hover:bg-[#1E293B] transition-all"
                    >
                      <span>Explore Domain</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          6. TOP PROJECTS GRID (NO PILL BADGE, Font Awesome Icons Replacing Emojis)
      ───────────────────────────────────────────────────────────────────────────── */}
      <section id="projects" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="space-y-12 text-center">
          {/* Header */}
          <div className="space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#64748B]">
              CURATED PICKS
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0F172A] tracking-tight">
              Explore Top Projects In <span className="text-[#FF5733]">Any Discipline</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Temukan proyek aktif yang membutuhkan spesifikasi keahlianmu sekarang juga.
            </p>
          </div>

          {/* 6 Grid Cards (2 rows x 3 columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left max-w-6xl mx-auto">
            {/* Card 1: Pastel Green (Frontend) */}
            <div className="rounded-[24px] border border-[#D1FAE5] card-pastel-green p-6 shadow-md flex flex-col justify-between hover:-translate-y-1.5 transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-mono font-bold uppercase">
                    Frontend Lead
                  </span>
                  <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>4.9</span>
                  </span>
                </div>

                {/* Font Awesome Icons Illustration */}
                <div className="h-28 rounded-2xl bg-white border border-[#D1FAE5] p-4 flex items-center justify-center gap-6 shadow-xs">
                  <FontAwesomeIcon icon={faLaptopCode} className="w-8 h-8 text-emerald-600" />
                  <FontAwesomeIcon icon={faPalette} className="w-8 h-8 text-teal-600" />
                  <FontAwesomeIcon icon={faRocket} className="w-8 h-8 text-emerald-500" />
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-[#0F172A]">
                    Next.js AI Storyboard Studio
                  </h3>
                  <p className="text-xs text-[#64748B] pt-1 leading-relaxed">
                    Membangun visual canvas interaktif untuk kreator film indie dengan streaming web socket.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-[#475569] font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                  <span>8-10 jam/minggu · Async friendly</span>
                </div>
              </div>

              <div className="pt-5 border-t border-[#E2E8F0] mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                    AR
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0F172A]">Alex Rivera</p>
                    <span className="text-[10px] text-[#94A3B8]">Founder</span>
                  </div>
                </div>
                <Link href="/find-partner">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-bold hover:bg-[#1E293B] transition-all"
                  >
                    Ajukan Diri
                  </button>
                </Link>
              </div>
            </div>

            {/* Card 2: Pastel Blue (Backend) */}
            <div className="rounded-[24px] border border-[#E0F2FE] card-pastel-blue p-6 shadow-md flex flex-col justify-between hover:-translate-y-1.5 transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-mono font-bold uppercase">
                    Backend Architect
                  </span>
                  <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>5.0</span>
                  </span>
                </div>

                {/* Font Awesome Icons Illustration */}
                <div className="h-28 rounded-2xl bg-white border border-[#E0F2FE] p-4 flex items-center justify-center gap-6 shadow-xs">
                  <FontAwesomeIcon icon={faBolt} className="w-8 h-8 text-blue-600" />
                  <FontAwesomeIcon icon={faDatabase} className="w-8 h-8 text-indigo-600" />
                  <FontAwesomeIcon icon={faShieldHalved} className="w-8 h-8 text-sky-600" />
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-[#0F172A]">
                    Distributed Redis Queue Engine
                  </h3>
                  <p className="text-xs text-[#64748B] pt-1 leading-relaxed">
                    Message broker performa tinggi yang menangani antrean transaksi real-time berskala mikrodetik.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-[#475569] font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                  <span>10 jam/minggu · Go &amp; Redis</span>
                </div>
              </div>

              <div className="pt-5 border-t border-[#E2E8F0] mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                    CT
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0F172A]">Clara Thorne</p>
                    <span className="text-[10px] text-[#94A3B8]">Systems Lead</span>
                  </div>
                </div>
                <Link href="/find-partner">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-bold hover:bg-[#1E293B] transition-all"
                  >
                    Ajukan Diri
                  </button>
                </Link>
              </div>
            </div>

            {/* Card 3: Pastel Amber (Fullstack) */}
            <div className="rounded-[24px] border border-[#FEF3C7] card-pastel-amber p-6 shadow-md flex flex-col justify-between hover:-translate-y-1.5 transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-mono font-bold uppercase">
                    Fullstack Dev
                  </span>
                  <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>4.8</span>
                  </span>
                </div>

                {/* Font Awesome Icons Illustration */}
                <div className="h-28 rounded-2xl bg-white border border-[#FEF3C7] p-4 flex items-center justify-center gap-6 shadow-xs">
                  <FontAwesomeIcon icon={faChartSimple} className="w-8 h-8 text-amber-600" />
                  <FontAwesomeIcon icon={faChartLine} className="w-8 h-8 text-orange-600" />
                  <FontAwesomeIcon icon={faCoins} className="w-8 h-8 text-yellow-600" />
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-[#0F172A]">
                    Indie SaaS Metric Tracker
                  </h3>
                  <p className="text-xs text-[#64748B] pt-1 leading-relaxed">
                    Dashboard visualisasi MRR dan churn rate otomatis terintegrasi Stripe dan Midtrans.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-[#475569] font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                  <span>6 jam/minggu · TypeScript</span>
                </div>
              </div>

              <div className="pt-5 border-t border-[#E2E8F0] mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center">
                    MV
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0F172A]">Marcus Vance</p>
                    <span className="text-[10px] text-[#94A3B8]">Indie Hacker</span>
                  </div>
                </div>
                <Link href="/find-partner">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-bold hover:bg-[#1E293B] transition-all"
                  >
                    Ajukan Diri
                  </button>
                </Link>
              </div>
            </div>

            {/* Card 4: Pastel Pink (Mobile) */}
            <div className="rounded-[24px] border border-[#FCE7F3] card-pastel-pink p-6 shadow-md flex flex-col justify-between hover:-translate-y-1.5 transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-pink-50 text-pink-800 border border-pink-200 text-[11px] font-mono font-bold uppercase">
                    Mobile Specialist
                  </span>
                  <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>4.9</span>
                  </span>
                </div>

                {/* Font Awesome Icons Illustration */}
                <div className="h-28 rounded-2xl bg-white border border-[#FCE7F3] p-4 flex items-center justify-center gap-6 shadow-xs">
                  <FontAwesomeIcon icon={faMobileScreen} className="w-8 h-8 text-pink-600" />
                  <FontAwesomeIcon icon={faClock} className="w-8 h-8 text-rose-600" />
                  <FontAwesomeIcon icon={faBullseye} className="w-8 h-8 text-red-500" />
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-[#0F172A]">
                    HabitLoop for Remote Devs
                  </h3>
                  <p className="text-xs text-[#64748B] pt-1 leading-relaxed">
                    Aplikasi mobile pendamping jam ngoding dan istirahat sehat untuk remote worker.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-[#475569] font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                  <span>8 jam/minggu · Flutter &amp; Dart</span>
                </div>
              </div>

              <div className="pt-5 border-t border-[#E2E8F0] mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-pink-600 text-white text-xs font-bold flex items-center justify-center">
                    ML
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0F172A]">Maya Lin</p>
                    <span className="text-[10px] text-[#94A3B8]">App Creator</span>
                  </div>
                </div>
                <Link href="/find-partner">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-bold hover:bg-[#1E293B] transition-all"
                  >
                    Ajukan Diri
                  </button>
                </Link>
              </div>
            </div>

            {/* Card 5: Pastel Purple (AI Agents) */}
            <div className="rounded-[24px] border border-[#F3E8FF] card-pastel-purple p-6 shadow-md flex flex-col justify-between hover:-translate-y-1.5 transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-800 border border-purple-200 text-[11px] font-mono font-bold uppercase">
                    AI Specialist
                  </span>
                  <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>5.0</span>
                  </span>
                </div>

                {/* Font Awesome Icons Illustration */}
                <div className="h-28 rounded-2xl bg-white border border-[#F3E8FF] p-4 flex items-center justify-center gap-6 shadow-xs">
                  <FontAwesomeIcon icon={faRobot} className="w-8 h-8 text-purple-600" />
                  <FontAwesomeIcon icon={faBrain} className="w-8 h-8 text-violet-600" />
                  <FontAwesomeIcon icon={faGear} className="w-8 h-8 text-fuchsia-600" />
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-[#0F172A]">
                    Local LLM Autonomous Sandbox
                  </h3>
                  <p className="text-xs text-[#64748B] pt-1 leading-relaxed">
                    Framework orkestrasi agent AI lokal untuk debugging kode dan analisis log otomatis.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-[#475569] font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                  <span>10 jam/minggu · Python &amp; Ollama</span>
                </div>
              </div>

              <div className="pt-5 border-t border-[#E2E8F0] mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">
                    RK
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0F172A]">Rian Kusuma</p>
                    <span className="text-[10px] text-[#94A3B8]">AI Engineer</span>
                  </div>
                </div>
                <Link href="/find-partner">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-bold hover:bg-[#1E293B] transition-all"
                  >
                    Ajukan Diri
                  </button>
                </Link>
              </div>
            </div>

            {/* Card 6: Pastel Sky (Web3 & Cloud - NO EMOJIS, Authentic Font Awesome) */}
            <div className="rounded-[24px] border border-[#BAE6FD] card-pastel-blue p-6 shadow-md flex flex-col justify-between hover:-translate-y-1.5 transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-sky-50 text-sky-800 border border-sky-200 text-[11px] font-mono font-bold uppercase">
                    Cloud &amp; DevOps
                  </span>
                  <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>4.9</span>
                  </span>
                </div>

                {/* Font Awesome Icons Replacing ☁️ 🌐 📦 */}
                <div className="h-28 rounded-2xl bg-white border border-[#BAE6FD] p-4 flex items-center justify-center gap-6 shadow-xs">
                  <FontAwesomeIcon icon={faCloud} className="w-8 h-8 text-sky-600" />
                  <FontAwesomeIcon icon={faGlobe} className="w-8 h-8 text-blue-600" />
                  <FontAwesomeIcon icon={faBox} className="w-8 h-8 text-cyan-600" />
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-[#0F172A]">
                    Open Source Invoicing Engine
                  </h3>
                  <p className="text-xs text-[#64748B] pt-1 leading-relaxed">
                    Infrastruktur faktur dan tagihan mandiri tanpa ketergantungan biaya SaaS bulanan.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-[#475569] font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                  <span>7 jam/minggu · Docker &amp; Next.js</span>
                </div>
              </div>

              <div className="pt-5 border-t border-[#E2E8F0] mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-sky-600 text-white text-xs font-bold flex items-center justify-center">
                    NS
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0F172A]">Nadia S.</p>
                    <span className="text-[10px] text-[#94A3B8]">Maintainer</span>
                  </div>
                </div>
                <Link href="/find-partner">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-bold hover:bg-[#1E293B] transition-all"
                  >
                    Ajukan Diri
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* View All Button */}
          <div className="pt-4">
            <Link href="/projects">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#0F172A] text-white text-xs sm:text-sm font-bold shadow-md hover:bg-[#1E293B] hover:scale-105 active:scale-95 transition-all"
              >
                <span>Explore All 250+ Projects</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          7. TESTIMONIALS "STORIES THAT SHIP" (NO PILL BADGE)
      ───────────────────────────────────────────────────────────────────────────── */}
      <section id="stories" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative overflow-hidden">
        {/* Sky Blue Ambient Cloud Container */}
        <div className="rounded-[36px] sm:rounded-[48px] bg-gradient-to-b from-[#BAE6FD]/45 via-[#E0F2FE]/30 to-[#FAF9F5] p-8 sm:p-14 border border-[#BAE6FD]/60 relative">
          <div className="space-y-12 text-center max-w-4xl mx-auto">
            {/* Heading without pill badge */}
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0284C7]">
                TESTIMONIALS
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0F172A] tracking-tight">
                Stories That Ship: <br />
                <span className="text-[#0284C7]">Real Partnerships, Not Just Talk</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#475569] max-w-md mx-auto">
                Kisah nyata para developer yang menemukan rekan setim ideal di Devora dan sukses meluncurkan produk.
              </p>
            </div>

            {/* Open Envelope with 3 Cards */}
            <div className="relative pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left relative z-10">
                {/* Testimonial Card 1 */}
                <div className="bg-white rounded-[24px] p-6 shadow-lg border border-[#BAE6FD]/80 space-y-4 transform hover:-translate-y-2 transition-all">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-amber-500" />
                    <Star className="w-4 h-4 fill-amber-500" />
                    <Star className="w-4 h-4 fill-amber-500" />
                    <Star className="w-4 h-4 fill-amber-500" />
                    <Star className="w-4 h-4 fill-amber-500" />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-[#0F172A] leading-relaxed">
                    &ldquo;Menemukan partner dalam 48 jam. Kami berhasil meluncurkan MVP storyboard kami ke Product Hunt hanya dalam 3 minggu sprint kolaborasi!&rdquo;
                  </p>
                  <div className="pt-2 flex items-center gap-3 border-t border-[#F1F5F9]">
                    <div className="w-9 h-9 rounded-full bg-[#FF5733] text-white text-xs font-bold flex items-center justify-center">
                      AR
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0F172A]">Alex Rivera</p>
                      <span className="text-[10px] text-[#64748B]">Fullstack Lead &amp; Co-founder</span>
                    </div>
                  </div>
                </div>

                {/* Testimonial Card 2 */}
                <div className="bg-white rounded-[24px] p-6 shadow-lg border border-[#BAE6FD]/80 space-y-4 transform md:-translate-y-4 hover:-translate-y-6 transition-all">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-amber-500" />
                    <Star className="w-4 h-4 fill-amber-500" />
                    <Star className="w-4 h-4 fill-amber-500" />
                    <Star className="w-4 h-4 fill-amber-500" />
                    <Star className="w-4 h-4 fill-amber-500" />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-[#0F172A] leading-relaxed">
                    &ldquo;Algoritma kecocokan jam luang Devora sangat akurat. Kami berdua punya waktu ngoding malam hari jam 8-11 PM. Komitmen terjaga tanpa drama ghosting.&rdquo;
                  </p>
                  <div className="pt-2 flex items-center gap-3 border-t border-[#F1F5F9]">
                    <div className="w-9 h-9 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                      BS
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0F172A]">Budi Santoso</p>
                      <span className="text-[10px] text-[#64748B]">Backend Engineer</span>
                    </div>
                  </div>
                </div>

                {/* Testimonial Card 3 */}
                <div className="bg-white rounded-[24px] p-6 shadow-lg border border-[#BAE6FD]/80 space-y-4 transform hover:-translate-y-2 transition-all">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-amber-500" />
                    <Star className="w-4 h-4 fill-amber-500" />
                    <Star className="w-4 h-4 fill-amber-500" />
                    <Star className="w-4 h-4 fill-amber-500" />
                    <Star className="w-4 h-4 fill-amber-500" />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-[#0F172A] leading-relaxed">
                    &ldquo;Akhirnya ada platform yang fokus pada kebutuhan nyata proyek dan stack teknis, bukan sekadar basa-basi template. Devora adalah game-changer.&rdquo;
                  </p>
                  <div className="pt-2 flex items-center gap-3 border-t border-[#F1F5F9]">
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                      CT
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0F172A]">Clara Thorne</p>
                      <span className="text-[10px] text-[#64748B]">Frontend Specialist</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Envelope Triangular Base Graphic */}
              <div className="mt-[-40px] mx-auto max-w-2xl h-24 bg-gradient-to-t from-white/90 to-transparent rounded-b-[36px] pointer-events-none"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          8. TACTILE ZIG-ZAG VALUE PROPS (NO PILL BADGE)
      ───────────────────────────────────────────────────────────────────────────── */}
      <section id="why-devora" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-24">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#64748B]">
            WHY DEVORA WORKS
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0F172A] tracking-tight">
            Transforming How Builders <br />
            <span className="text-[#FF5733]">Collaborate Every Single Day</span>
          </h2>
        </div>

        {/* Row 1: Text Left + Tactile 3D Lightning Right */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-6 space-y-5 text-left">
            <span className="text-xs font-mono font-bold text-[#FF5733] uppercase tracking-wider">
              Compatibility Engine
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] leading-tight">
              Smart Compatibility, <br />
              Zero Guesswork.
            </h3>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              Devora bukan sekadar memamerkan profil, melainkan menganalisis keselarasan tech stack, gaya kerja (async-first vs pair coding), dan ketersediaan waktu mingguan secara transparan sebelum memulai diskusi.
            </p>
            <div className="pt-2">
              <Link href="/find-partner">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F172A] text-white text-xs sm:text-sm font-bold shadow-md hover:bg-[#1E293B] transition-all"
                >
                  <span>Coba Matchmaker</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>

          <div className="md:col-span-6 flex justify-center">
            <div className="w-64 h-64 sm:w-80 sm:h-80 relative flex items-center justify-center">
              <img
                src="/images/redesign/tactile-lightning-3d.jpg"
                alt="Tactile 3D Fluffy Lightning"
                className="w-full h-full object-contain animate-soft-float drop-shadow-2xl"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Tactile 3D Shield Left + Text Right */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-6 flex justify-center order-2 md:order-1">
            <div className="w-64 h-64 sm:w-80 sm:h-80 relative flex items-center justify-center">
              <img
                src="/images/redesign/tactile-shield-3d.jpg"
                alt="Tactile 3D Fluffy Shield"
                className="w-full h-full object-contain animate-soft-float drop-shadow-2xl"
              />
            </div>
          </div>

          <div className="md:col-span-6 space-y-5 text-left order-1 md:order-2">
            <span className="text-xs font-mono font-bold text-blue-600 uppercase tracking-wider">
              Proof Over Claims
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] leading-tight">
              Verified Git Proof &amp; <br />
              Zero Ghosting Guarantee.
            </h3>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              Verifikasi keahlian lewat commit riil GitHub, portofolio nyata, serta sistem rating kehandalan. Bangun rasa saling percaya sejak hari pertama kolaborasi dimulai.
            </p>
            <div className="pt-2">
              <Link href="/profile">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F172A] text-white text-xs sm:text-sm font-bold shadow-md hover:bg-[#1E293B] transition-all"
                >
                  <span>Hubungkan GitHub</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          9. PATH SELECTION (NO PILL BADGE, Clean Rectangular Rounded-xl Cards)
      ───────────────────────────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full text-center space-y-12">
        <div className="space-y-3 max-w-xl mx-auto">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#64748B]">
            JOIN DEVORA TODAY
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0F172A] tracking-tight">
            Unlock Collaboration: <br />
            <span className="text-[#FF5733]">A Smarter Way to Ship</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Tentukan bagaimana kamu ingin memulai kolaborasi pertamamu.
          </p>
        </div>

        {/* 2 Choice Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center max-w-4xl mx-auto">
          {/* Card 1: 3D Brain Icon -> Find a Project */}
          <div className="bg-white rounded-[28px] p-8 sm:p-10 border border-[#E2E8F0] shadow-xl space-y-6 flex flex-col items-center justify-between hover:-translate-y-2 transition-all group">
            <div className="w-36 h-36 relative flex items-center justify-center">
              <img
                src="/images/redesign/tactile-brain-3d.jpg"
                alt="3D Smart Brain"
                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-[#0F172A]">
                Join an Active Project
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Punya keahlian frontend, backend, atau design? Bergabunglah dengan proyek aktif dan bangun portofolio produk nyata.
              </p>
            </div>
            <Link href="/projects" className="w-full">
              <button
                type="button"
                className="w-full py-3.5 rounded-xl bg-[#0F172A] text-white text-xs font-bold hover:bg-[#1E293B] shadow-md transition-all"
              >
                Browse Projects
              </button>
            </Link>
          </div>

          {/* Card 2: 3D Trophy Stairs Icon -> Post a Project */}
          <div className="bg-white rounded-[28px] p-8 sm:p-10 border border-[#E2E8F0] shadow-xl space-y-6 flex flex-col items-center justify-between hover:-translate-y-2 transition-all group">
            <div className="w-36 h-36 relative flex items-center justify-center">
              <img
                src="/images/redesign/tactile-stairs-trophy-3d.jpg"
                alt="3D Trophy Stairs"
                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-[#0F172A]">
                Post Your Project
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Punya ide brilian atau MVP yang butuh tangan terampil? Posting peran terbuka dan temukan co-founder idealmu.
              </p>
            </div>
            <Link href="/find-partner" className="w-full">
              <button
                type="button"
                className="w-full py-3.5 rounded-xl bg-[#FF5733] text-white text-xs font-bold hover:bg-[#D9411E] shadow-md shadow-[#FF5733]/20 transition-all"
              >
                Find Teammates
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          10. NATURE LANDSCAPE FOOTER VISUAL & GIANT DEVORA BRAND TYPOGRAPHY
      ───────────────────────────────────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[#FAF9F5] via-[#E0F2FE]/40 to-[#A7F3D0]/30">
        <div className="max-w-6xl mx-auto space-y-6 text-center">
          {/* Outdoor Park Collaboration 3D Render Visual */}
          <div className="relative rounded-[32px] sm:rounded-[44px] overflow-hidden shadow-2xl border-4 border-white">
            <img
              src="/images/redesign/footer-landscape-devs.jpg"
              alt="Developers Collaborating in Nature Landscape"
              className="w-full h-auto max-h-[480px] object-cover object-center"
            />
          </div>

          {/* Giant Friendly Brand Typography */}
          <div className="pt-4 select-none">
            <h1 className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tight text-emerald-800/80 drop-shadow-sm">
              Devora
            </h1>
          </div>

          {/* Clean Minimalist Horizontal Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-bold text-[#475569] pt-2">
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
              Sign In
            </Link>
          </div>

          {/* Copyright Notice */}
          <div className="pt-6 border-t border-[#CBD5E1]/60 text-xs text-[#64748B]">
            © 2026 Devora. Crafted for ambitious builders worldwide. All rights reserved.
          </div>
        </div>
      </section>
    </div>
  );
}
