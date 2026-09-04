"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useUserStore } from "@/store/useUserStore";
import { useMatchStore } from "@/store/useMatchStore";
import { useProjectStore } from "@/store/useProjectStore";
import { useUiStore } from "@/store/useUiStore";
import { UserProfile, Project } from "@/store/types";
import {
  Flame,
  MessageSquare,
  Share2,
  MapPin,
  Clock,
  Globe,
  Briefcase,
  Award,
  FolderGit2,
  ExternalLink,
  GitBranch,
  ArrowLeft,
  Layers,
  UserPlus,
  UserCheck,
  Users,
  Eye,
  X,
  Send,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { formatExperienceLabel, formatWorkPreferenceLabel } from "@/lib/profile-utils";
import { FollowListModal } from "@/components/social/FollowListModal";
import { playNotificationSound } from "@/lib/sound";
import { cn } from "@/lib/utils";

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;

  const { currentUser, fetchProfile } = useUserStore();
  const { swipeRight, fetchMatches, matches } = useMatchStore();
  const { projects, fetchProjects, expressInterest } = useProjectStore();
  const { addToast } = useUiStore();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Follow State
  const [followStats, setFollowStats] = useState<{
    followersCount: number;
    followingCount: number;
    isFollowing: boolean;
    isFollowedBy: boolean;
  }>({
    followersCount: 0,
    followingCount: 0,
    isFollowing: false,
    isFollowedBy: false,
  });
  const [followModalType, setFollowModalType] = useState<"followers" | "following" | null>(null);
  const [isTogglingFollow, setIsTogglingFollow] = useState(false);

  // Modal States
  const [selectedCertPreview, setSelectedCertPreview] = useState<string | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedInviteProject, setSelectedInviteProject] = useState<Project | null>(null);
  const [inviteRole, setInviteRole] = useState<string>("");
  const [inviteNote, setInviteNote] = useState<string>("");

  const isOwnProfile = currentUser.id === userId;

  // Projects owned by current logged-in user
  const myProjects = projects.filter((p) => p.ownerId === currentUser.id);

  useEffect(() => {
    fetchProfile();
    fetchMatches();
    fetchProjects();
  }, [fetchProfile, fetchMatches, fetchProjects]);

  const loadFollowStats = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/users/${userId}/follow`);
      if (res.ok) {
        const data = await res.json();
        setFollowStats(data);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!userId) return;

    async function loadUserProfile() {
      setIsLoading(true);
      setError(null);
      try {
        const [profileRes, postsRes, followRes] = await Promise.all([
          fetch(`/api/users/${userId}`),
          fetch(`/api/posts?authorId=${userId}`),
          fetch(`/api/users/${userId}/follow`),
        ]);

        if (!profileRes.ok) {
          if (profileRes.status === 404) {
            throw new Error("Profil developer tidak ditemukan.");
          }
          throw new Error("Gagal memuat profil developer.");
        }
        const profileData = await profileRes.json();
        setProfile(profileData);

        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setUserPosts(postsData.posts || []);
        }

        if (followRes.ok) {
          const followData = await followRes.json();
          setFollowStats(followData);
        }
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan saat memuat profil.");
      } finally {
        setIsLoading(false);
      }
    }

    loadUserProfile();
  }, [userId]);

  const handleToggleFollow = async () => {
    if (!profile || isTogglingFollow) return;
    setIsTogglingFollow(true);
    try {
      const res = await fetch(`/api/users/${profile.id}/follow`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setFollowStats((prev) => ({
          ...prev,
          isFollowing: data.isFollowing,
          followersCount: data.followersCount,
          followingCount: data.followingCount,
        }));
        playNotificationSound();
        addToast({
          title: data.isFollowing
            ? data.isFollowBack
              ? "Mengikuti Balik"
              : "Mengikuti Pengembang"
            : "Batal Mengikuti",
          description: data.isFollowing
            ? `Anda sekarang mengikuti ${profile.name}. Pembaruan karya terbaru akan muncul di feeds Anda.`
            : `Anda telah berhenti mengikuti ${profile.name}.`,
          type: "success",
        });
      }
    } finally {
      setIsTogglingFollow(false);
    }
  };

  // Calculate skill overlap with current user
  const mySkills: string[] = currentUser.skills || currentUser.techStack || [];
  const targetSkills: string[] = profile?.tags || profile?.skills || profile?.techStack || [];
  const sharedSkills = targetSkills.filter((s: string) =>
    mySkills.some((myS: string) => myS.toLowerCase() === s.toLowerCase())
  );
  const matchScoreEstimate = Math.min(
    98,
    Math.max(65, 60 + sharedSkills.length * 10 + (profile?.experienceYears ? 5 : 0))
  );

  const handleShareProfile = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      addToast({
        title: "Tautan Disalin!",
        description: `Link profil ${profile?.name || "developer"} berhasil disalin ke clipboard.`,
        type: "success",
      });
    }
  };

  const handleLikePartner = () => {
    if (!profile) return;
    swipeRight(profile.id);
    addToast({
      title: "Menyukai Partner!",
      description: `Kamu menyukai ${profile.name}. Jika saling cocok, kalian akan langsung match!`,
      type: "success",
    });
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInviteProject || !inviteRole || !profile) return;

    expressInterest(selectedInviteProject.id, inviteRole, inviteNote);

    addToast({
      title: "Undangan Terkirim!",
      description: `Undangan untuk bergabung ke proyek "${selectedInviteProject.title}" telah dikirim ke ${profile.name}.`,
      type: "success",
    });

    setIsInviteModalOpen(false);
    setSelectedInviteProject(null);
    setInviteRole("");
    setInviteNote("");
  };

  if (isLoading) {
    return (
      <Shell>
        <div className="max-w-4xl mx-auto space-y-6 py-8 animate-pulse">
          <div className="h-48 bg-devora-surface border border-devora-border rounded-container" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-64 bg-devora-surface border border-devora-border rounded-container md:col-span-1" />
            <div className="h-64 bg-devora-surface border border-devora-border rounded-container md:col-span-2" />
          </div>
        </div>
      </Shell>
    );
  }

  if (error || !profile) {
    return (
      <Shell>
        <div className="max-w-xl mx-auto py-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <X className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-devora-ink">{error || "Profil Tidak Ditemukan"}</h2>
          <p className="text-sm text-devora-muted">
            Profil pengembang yang Anda cari mungkin belum terdaftar atau tautan tidak valid.
          </p>
          <div className="pt-2">
            <Button onClick={() => router.back()} variant="secondary" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </Button>
          </div>
        </div>
      </Shell>
    );
  }

  const displayName = profile.name || "Developer";
  const displayTitle = profile.title || "Software Developer";
  const displayBio = profile.bio || "Developer antusias yang siap berkolaborasi dan membangun proyek hebat bersama.";
  const displayImage = profile.image || profile.avatarUrl || (profile.githubUsername ? `https://github.com/${profile.githubUsername}.png` : undefined);
  const certificates = profile.certificates || [];
  const portfolios = profile.portfolios || [];
  const authoredProjects = (profile.projects as any[]) || [];

  return (
    <Shell>
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-xs font-bold text-devora-muted hover:text-devora-brand transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Kembali</span>
          </button>

          <Button
            size="sm"
            variant="secondary"
            onClick={handleShareProfile}
            className="text-xs gap-1.5 border-devora-border hover:border-devora-brand"
          >
            <Share2 className="w-3.5 h-3.5 text-devora-brand" />
            <span>Bagikan Profil</span>
          </Button>
        </div>

        {/* ─── 1. HERO PROFILE CARD ─── */}
        <Card className="p-6 sm:p-8 bg-devora-surface border-2 border-devora-border rounded-container shadow-sm relative overflow-hidden space-y-6">
          {/* Background Decorative Accent */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-devora-brand/10 via-devora-brand/5 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <Avatar
                src={displayImage}
                fallback={displayName.slice(0, 2).toUpperCase()}
                size="lg"
                className="w-20 h-20 sm:w-24 sm:h-24 border-3 border-devora-brand shadow-md shrink-0"
              />
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-devora-ink tracking-tight">
                    {displayName}
                  </h1>
                  {isOwnProfile && (
                    <Badge variant="brand" className="text-xs py-0.5 px-2 font-bold">
                      Profil Kamu
                    </Badge>
                  )}
                  {profile.profileCompleteness && profile.profileCompleteness >= 80 && (
                    <Badge variant="brand" className="text-[11px] font-bold gap-1 py-0.5 px-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-white" />
                      <span>Terverifikasi</span>
                    </Badge>
                  )}
                </div>

                <p className="text-sm sm:text-base font-bold text-devora-brand-dark">
                  {displayTitle}
                </p>

                {/* Location & Timezone pills */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-devora-muted pt-0.5">
                  <span className="flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-devora-brand" />
                    {profile.location || "Indonesia"}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-devora-brand" />
                    {profile.availabilityHrs || 10} jam/minggu
                  </span>
                  {profile.workPreference && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1.5 font-medium text-devora-ink">
                        <Globe className="w-3.5 h-3.5 text-devora-brand" />
                        {formatWorkPreferenceLabel(profile.workPreference)}
                      </span>
                    </>
                  )}
                </div>

                {/* Followers & Following Stats */}
                <div className="flex items-center gap-4 pt-1.5">
                  <button
                    type="button"
                    onClick={() => setFollowModalType("followers")}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#0F172A] hover:text-[#317B67] transition-colors p-1 rounded-lg hover:bg-slate-100"
                  >
                    <span className="text-sm font-extrabold text-[#317B67]">{followStats.followersCount}</span>
                    <span className="text-slate-500 font-medium">Pengikut</span>
                  </button>

                  <span className="text-slate-300">•</span>

                  <button
                    type="button"
                    onClick={() => setFollowModalType("following")}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#0F172A] hover:text-[#317B67] transition-colors p-1 rounded-lg hover:bg-slate-100"
                  >
                    <span className="text-sm font-extrabold text-[#0F172A]">{followStats.followingCount}</span>
                    <span className="text-slate-500 font-medium">Mengikuti</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Action Button Group */}
            {!isOwnProfile && (
              <div className="flex flex-wrap sm:flex-col items-stretch gap-2.5 w-full sm:w-auto shrink-0 z-10">
                {/* Follow / Following / Follow Back Button */}
                <Button
                  onClick={handleToggleFollow}
                  disabled={isTogglingFollow}
                  className={cn(
                    "w-full gap-2 font-bold text-xs shadow-sm transition-all",
                    followStats.isFollowing
                      ? "bg-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-[#0F172A] border border-slate-300"
                      : "bg-[#317B67] hover:bg-[#245E4E] text-white shadow-sm shadow-[#317B67]/25"
                  )}
                >
                  {followStats.isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      <span>Mengikuti</span>
                    </>
                  ) : followStats.isFollowedBy ? (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Ikuti Balik</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Ikuti Profil</span>
                    </>
                  )}
                </Button>

                <Link href={`/messages?userId=${profile.id}`} className="w-full">
                  <Button className="w-full gap-2 bg-devora-ink hover:bg-devora-ink-soft text-white font-bold text-xs shadow-sm">
                    <MessageSquare className="w-4 h-4" />
                    <span>Kirim Pesan</span>
                  </Button>
                </Link>

                <Button
                  onClick={handleLikePartner}
                  className="w-full gap-2 bg-slate-100 hover:bg-slate-200 text-[#0F172A] font-bold text-xs border border-slate-200"
                >
                  <Flame className="w-4 h-4 text-[#317B67]" />
                  <span>Sukai Partner</span>
                </Button>

                {myProjects.length > 0 && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSelectedInviteProject(myProjects[0]);
                      setInviteRole(myProjects[0].roles?.[0]?.roleTitle || "");
                      setIsInviteModalOpen(true);
                    }}
                    className="w-full gap-2 text-xs border-devora-border hover:border-devora-brand font-semibold"
                  >
                    <UserPlus className="w-4 h-4 text-devora-brand" />
                    <span>Undang ke Proyek</span>
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Social Links Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-devora-border text-xs">
            {profile.githubUsername && (
              <a
                href={`https://github.com/${profile.githubUsername}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-button bg-devora-background border border-devora-border hover:border-devora-brand font-bold text-devora-ink transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>github.com/{profile.githubUsername}</span>
              </a>
            )}
            {profile.linkedinUrl && (
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-button bg-devora-background border border-devora-border hover:border-devora-brand font-bold text-blue-600 transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span>LinkedIn</span>
              </a>
            )}
            {profile.websiteUrl && (
              <a
                href={profile.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-button bg-devora-background border border-devora-border hover:border-devora-brand font-bold text-devora-ink transition-colors"
              >
                <Globe className="w-4 h-4 text-devora-brand" />
                <span>Website Pribadi</span>
              </a>
            )}
            {profile.portfolioUrl && (
              <a
                href={profile.portfolioUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-button bg-devora-background border border-devora-border hover:border-devora-brand font-bold text-devora-ink transition-colors"
              >
                <FolderGit2 className="w-4 h-4 text-devora-brand" />
                <span>Portofolio Utama</span>
              </a>
            )}
          </div>
        </Card>

        {/* ─── 2. COMPATIBILITY & MATCH BREAKDOWN ─── */}
        {!isOwnProfile && (
          <div className="bg-gradient-to-r from-orange-50 via-white to-amber-50 border-2 border-orange-200/70 rounded-container p-5 sm:p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-devora-brand text-white flex items-center justify-center shadow-xs">
                  <Flame className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-devora-ink">
                    Tingkat Kecocokan dengan Anda
                  </h3>
                  <p className="text-xs text-devora-muted">
                    Dihitung dari keahlian yang saling melengkapi & ketersediaan waktu
                  </p>
                </div>
              </div>
              <span className="text-2xl font-black text-devora-brand font-mono">
                {matchScoreEstimate}%
              </span>
            </div>

            {sharedSkills.length > 0 && (
              <div className="flex items-center gap-2 pt-2 border-t border-orange-200/50 text-xs">
                <span className="text-devora-muted font-semibold">Stack yang sama:</span>
                <div className="flex flex-wrap gap-1">
                  {sharedSkills.map((s: string, idx: number) => (
                    <Badge key={idx} variant="brand" className="text-[10px] py-0 px-2 font-bold">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── 3. BIO & TENTANG PENGEMBANG ─── */}
        <Card className="p-5 sm:p-6 bg-devora-surface border-2 border-devora-border rounded-container space-y-3">
          <div className="flex items-center gap-2 border-b border-devora-border pb-3">
            <Briefcase className="w-4 h-4 text-devora-brand" />
            <h2 className="text-sm font-mono uppercase font-bold text-devora-ink tracking-wider">
              Tentang Pengembang & Visi Kolaborasi
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-devora-ink leading-relaxed whitespace-pre-line">
            {displayBio}
          </p>
        </Card>

        {/* ─── 4. TECH STACK & JAM TERBANG ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tech Stack Matrix */}
          <Card className="p-5 sm:p-6 bg-devora-surface border-2 border-devora-border rounded-container space-y-4">
            <div className="flex items-center gap-2 border-b border-devora-border pb-3">
              <Zap className="w-4 h-4 text-devora-brand" />
              <h2 className="text-sm font-mono uppercase font-bold text-devora-ink tracking-wider">
                Tech Stack & Keahlian
              </h2>
            </div>

            <div className="space-y-3">
              {profile.primaryStack && profile.primaryStack.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-devora-muted uppercase font-mono">
                    Stack Utama:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.primaryStack.map((tech: string, i: number) => (
                      <Badge
                        key={i}
                        variant="brand"
                        className="text-xs py-1 px-2.5 font-bold shadow-xs"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {profile.tags && profile.tags.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-bold text-devora-muted uppercase font-mono">
                    Keahlian Tambahan:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.tags.map((skill: string, i: number) => (
                      <Badge
                        key={i}
                        variant="default"
                        className="text-xs py-0.5 px-2 bg-devora-surface-strong text-devora-ink font-semibold"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Jam Terbang & Ritme Kerja */}
          <Card className="p-5 sm:p-6 bg-devora-surface border-2 border-devora-border rounded-container space-y-4">
            <div className="flex items-center gap-2 border-b border-devora-border pb-3">
              <Clock className="w-4 h-4 text-devora-brand" />
              <h2 className="text-sm font-mono uppercase font-bold text-devora-ink tracking-wider">
                Jam Terbang & Ritme Kerja
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-devora-background border border-devora-border rounded-button space-y-1">
                <span className="text-[10px] font-mono uppercase text-devora-muted font-bold">
                  Level & Pengalaman:
                </span>
                <p className="font-bold text-devora-ink">
                  {formatExperienceLabel(profile.experienceYears, profile.experienceLevel)}
                </p>
              </div>

              <div className="p-3 bg-devora-background border border-devora-border rounded-button space-y-1">
                <span className="text-[10px] font-mono uppercase text-devora-muted font-bold">
                  Ritme & Gaya Kerja:
                </span>
                <p className="font-bold text-devora-ink">
                  {profile.workStyle || "Async-First (GitHub PR & Discord)"}
                </p>
              </div>

              {profile.availableDays && profile.availableDays.length > 0 && (
                <div className="p-3 bg-devora-background border border-devora-border rounded-button space-y-1">
                  <span className="text-[10px] font-mono uppercase text-devora-muted font-bold">
                    Hari Aktif Ngoding:
                  </span>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {profile.availableDays.map((day, dIdx) => (
                      <Badge
                        key={dIdx}
                        variant="default"
                        className="text-[10px] py-0 px-2 bg-devora-surface-strong text-devora-ink border-devora-border font-bold"
                      >
                        {day}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* ─── 4.5 POSTINGAN FEED KOMUNITAS ─── */}
        {userPosts.length > 0 && (
          <Card className="p-5 sm:p-6 bg-devora-surface border-2 border-devora-border rounded-container space-y-4">
            <div className="flex items-center justify-between border-b border-devora-border pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-devora-brand" />
                <h2 className="text-sm font-mono uppercase font-bold text-devora-ink tracking-wider">
                  Postingan & Update Karya ({userPosts.length})
                </h2>
              </div>
              <span className="text-xs text-devora-muted font-medium">Feeds Komunitas</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {userPosts.map((post: any) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="p-3.5 bg-devora-background border border-devora-border rounded-container space-y-2 flex flex-col justify-between hover:border-devora-brand transition-all group"
                >
                  <div className="space-y-1.5">
                    {post.mediaUrls && post.mediaUrls.length > 0 && (
                      <div className="rounded-lg overflow-hidden aspect-video bg-slate-900 mb-2">
                        <img src={post.mediaUrls[0]} alt="Post" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    )}
                    <p className="text-xs text-devora-ink line-clamp-3 leading-relaxed">
                      {post.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-devora-border text-[11px] text-devora-muted font-bold">
                    <span className="flex items-center gap-1 text-devora-brand">
                      <Flame className="w-3 h-3 fill-devora-brand" />
                      {post.likeCount} Reaksi
                    </span>
                    <span>{post.commentCount} Komentar</span>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        )}

        {/* ─── 5. SERTIFIKASI TERVERIFIKASI ─── */}
        {certificates.length > 0 && (
          <Card className="p-5 sm:p-6 bg-devora-surface border-2 border-devora-border rounded-container space-y-4">
            <div className="flex items-center justify-between border-b border-devora-border pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-mono uppercase font-bold text-devora-ink tracking-wider">
                  Sertifikasi Terverifikasi ({certificates.length})
                </h2>
              </div>
              <span className="text-xs text-devora-muted">Bukti keahlian resmi</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="p-3 bg-devora-background border border-devora-border rounded-container flex items-center justify-between gap-3 hover:border-amber-400/50 transition-all shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {cert.fileUrl ? (
                      <button
                        type="button"
                        onClick={() => setSelectedCertPreview(cert.fileUrl || null)}
                        className="w-10 h-10 rounded-lg overflow-hidden border border-devora-border shrink-0 hover:opacity-80 transition-opacity"
                        title="Klik untuk perbesar sertifikat"
                      >
                        <img
                          src={cert.fileUrl}
                          alt={cert.title}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                        <Award className="w-5 h-5" />
                      </div>
                    )}
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-xs font-bold text-devora-ink truncate">{cert.title}</p>
                      <p className="text-[11px] text-devora-muted truncate">
                        {cert.issuer} {cert.issueDate && `• ${cert.issueDate}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {cert.fileUrl && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedCertPreview(cert.fileUrl || null)}
                        className="p-1.5 h-8 w-8 text-amber-600 hover:text-amber-700"
                        title="Lihat Pratinjau Sertifikat"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-devora-brand hover:text-devora-brand-dark"
                        title="Buka Kredensial Asli"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ─── 6. SHOWCASE PORTOFOLIO PROYEK ─── */}
        {portfolios.length > 0 && (
          <Card className="p-5 sm:p-6 bg-devora-surface border-2 border-devora-border rounded-container space-y-4">
            <div className="flex items-center justify-between border-b border-devora-border pb-3">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-devora-brand" />
                <h2 className="text-sm font-mono uppercase font-bold text-devora-ink tracking-wider">
                  Showcase Portofolio Proyek ({portfolios.length})
                </h2>
              </div>
              <span className="text-xs text-devora-muted">Karya yang pernah dibuat</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {portfolios.map((proj) => (
                <div
                  key={proj.id}
                  className="p-4 bg-devora-background border border-devora-border rounded-container space-y-3 flex flex-col justify-between hover:border-devora-brand/40 transition-all shadow-xs"
                >
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-devora-ink">{proj.title}</h3>
                    {proj.description && (
                      <p className="text-xs text-devora-muted line-clamp-3 leading-relaxed">
                        {proj.description}
                      </p>
                    )}
                    {proj.tags && proj.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {proj.tags.map((t, idx) => (
                          <Badge
                            key={idx}
                            variant="default"
                            className="text-[10px] py-0 px-1.5 bg-devora-surface-strong text-devora-ink"
                          >
                            {t}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t border-devora-border/60 text-xs">
                    {proj.liveUrl && (
                      <a
                        href={proj.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-devora-brand font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Live Demo</span>
                      </a>
                    )}
                    {proj.repoUrl && (
                      <a
                        href={proj.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-devora-ink font-bold hover:text-devora-brand inline-flex items-center gap-1"
                      >
                        <GitBranch className="w-3 h-3" />
                        <span>GitHub Repo</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ─── 7. PROYEK KOMUNITAS YANG DIBUAT PENGEMBANG INI ─── */}
        {authoredProjects.length > 0 && (
          <Card className="p-5 sm:p-6 bg-devora-surface border-2 border-devora-border rounded-container space-y-4">
            <div className="flex items-center justify-between border-b border-devora-border pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-devora-brand" />
                <h2 className="text-sm font-mono uppercase font-bold text-devora-ink tracking-wider">
                  Proyek Komunitas oleh {displayName} ({authoredProjects.length})
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {authoredProjects.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 bg-devora-background border border-devora-border rounded-container space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-devora-ink truncate">{p.title}</h4>
                      <Badge variant="default" className="text-[10px] py-0 px-1.5 font-bold">
                        {p.stage}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-devora-muted line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <Link href="/projects">
                      <Button size="sm" variant="secondary" className="text-[11px] h-7 gap-1 font-bold">
                        <span>Lihat di Papan Proyek</span>
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* ─── MODAL: PREVIEW SERTIFIKAT ─── */}
      {selectedCertPreview && (
        <div
          className="fixed inset-0 z-50 bg-devora-ink/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedCertPreview(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-white rounded-container p-4 space-y-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-xs font-bold text-devora-ink">Pratinjau Sertifikat</span>
              <button
                onClick={() => setSelectedCertPreview(null)}
                className="p-1 hover:bg-slate-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto flex items-center justify-center">
              <img
                src={selectedCertPreview}
                alt="Sertifikat Preview"
                className="max-w-full max-h-[70vh] object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: UNDANG KE PROYEK SAYA ─── */}
      {isInviteModalOpen && selectedInviteProject && (
        <div
          className="fixed inset-0 z-50 bg-devora-ink/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsInviteModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-devora-surface border-2 border-devora-border rounded-container shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-devora-border pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-devora-brand">
                  Undang Kolaborator
                </span>
                <h3 className="text-lg font-bold text-devora-ink">
                  Undang {displayName}
                </h3>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="p-1.5 text-devora-muted hover:text-devora-ink rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4">
              {/* Select Project */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase font-semibold text-devora-muted">
                  Pilih Proyek Milikmu:
                </label>
                <select
                  value={selectedInviteProject.id}
                  onChange={(e) => {
                    const found = myProjects.find((p) => p.id === e.target.value);
                    if (found) {
                      setSelectedInviteProject(found);
                      setInviteRole(found.roles?.[0]?.roleTitle || "");
                    }
                  }}
                  className="w-full px-3 py-2 bg-devora-background border border-devora-border rounded-button text-xs font-semibold text-devora-ink"
                >
                  {myProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.roles.length} posisi)
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Role */}
              {selectedInviteProject.roles.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase font-semibold text-devora-muted">
                    Posisi / Role yang Ditawarkan:
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-3 py-2 bg-devora-background border border-devora-border rounded-button text-xs font-semibold text-devora-ink"
                  >
                    {selectedInviteProject.roles.map((r) => (
                      <option key={r.id} value={r.roleTitle}>
                        {r.roleTitle} ({r.hoursPerWeek} jam/mgg)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Invitation Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase font-semibold text-devora-muted">
                  Pesan Undangan:
                </label>
                <textarea
                  rows={3}
                  value={inviteNote}
                  onChange={(e) => setInviteNote(e.target.value)}
                  placeholder={`Halo ${displayName}, saya tertarik dengan portofolio kamu dan ingin mengajak kolaborasi di proyek ini...`}
                  className="w-full px-3 py-2 bg-devora-background border border-devora-border rounded-button text-xs text-devora-ink placeholder:text-devora-muted focus:outline-none focus:border-devora-brand resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-devora-border">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsInviteModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="gap-1.5 bg-devora-brand text-white hover:bg-devora-brand-dark font-bold"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Undangan</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── FOLLOWERS / FOLLOWING LIST MODAL ─── */}
      {followModalType && profile && (
        <FollowListModal
          userId={profile.id}
          userName={profile.name}
          type={followModalType}
          isOpen={Boolean(followModalType)}
          onClose={() => setFollowModalType(null)}
          onFollowToggle={loadFollowStats}
        />
      )}
    </Shell>
  );
}
