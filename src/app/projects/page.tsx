"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useProjectStore } from "@/store/useProjectStore";
import { useUserStore } from "@/store/useUserStore";
import { useMatchStore } from "@/store/useMatchStore";
import { useChatStore } from "@/store/useChatStore";
import { useUiStore } from "@/store/useUiStore";
import { Project, JoinRequest, ProjectStage } from "@/store/types";
import {
  FolderKanban,
  Plus,
  Flame,
  Search,
  Users,
  Clock,
  Code2,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  ArrowRight,
  X,
  Send,
  UserCheck,
  UserX,
  Layers,
  Inbox,
  AlertCircle,
} from "lucide-react";
import { ProjectBoardSkeletonList } from "@/components/ui/ProjectCardSkeleton";
import { cn } from "@/lib/utils";

export default function ProjectsPage() {
  const router = useRouter();
  const {
    projects,
    joinRequests,
    expressedInterests,
    expressInterest,
    acceptJoinRequest,
    rejectJoinRequest,
    fetchProjects,
    isLoading,
  } = useProjectStore();

  const { currentUser, fetchProfile } = useUserStore();
  const { swipeRight, fetchCandidates, fetchMatches } = useMatchStore();
  const { sendMessageAsync } = useChatStore();
  const { addToast } = useUiStore();

  useEffect(() => {
    fetchProfile();
    fetchProjects();
    fetchCandidates();
    fetchMatches();

    const handleFocus = () => {
      if (document.visibilityState === "visible") {
        fetchProjects();
        fetchMatches();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [fetchProfile, fetchProjects, fetchCandidates, fetchMatches]);

  // Tab State: "ALL" | "MY_PROJECTS" | "MY_APPLICATIONS"
  const [activeTab, setActiveTab] = useState<"ALL" | "MY_PROJECTS" | "MY_APPLICATIONS">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState<string>("ALL");

  // Modal State for "Request Join"
  const [joiningProject, setJoiningProject] = useState<Project | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [pitchNote, setPitchNote] = useState("");

  const uniqueProjects = Array.from(
    new Map(projects.map((p) => [p.id, p])).values()
  );

  const uniqueJoinRequests = Array.from(
    new Map(joinRequests.map((r) => [r.id, r])).values()
  );

  // Projects owned by current user
  const myProjects = uniqueProjects.filter((p) => p.ownerId === currentUser.id);
  const myProjectIds = myProjects.map((p) => p.id);

  // Pending requests for user's projects (User as Owner)
  const pendingRequestsForMe = uniqueJoinRequests.filter(
    (req) => myProjectIds.includes(req.projectId) && req.status === "PENDING"
  );

  // Requests submitted by current user (User as Applicant)
  const mySubmittedApplications = uniqueJoinRequests.filter(
    (req) => req.applicantId === currentUser.id
  );

  // Filtered projects according to active tab and search
  const displayedProjects = (activeTab === "MY_PROJECTS" ? myProjects : uniqueProjects).filter((proj) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (proj.title || "").toLowerCase().includes(q) ||
      (proj.description || "").toLowerCase().includes(q) ||
      (proj.ownerName || "").toLowerCase().includes(q) ||
      (proj.roles || []).some(
        (r) =>
          (r.roleTitle || "").toLowerCase().includes(q) ||
          (r.requiredSkills || []).some((s) => (s || "").toLowerCase().includes(q))
      );

    if (!matchesSearch) return false;
    if (selectedStage !== "ALL" && proj.stage !== selectedStage) return false;

    return true;
  });

  const handleOpenJoinModal = (project: Project) => {
    setJoiningProject(project);
    setSelectedRole(project.roles?.[0]?.roleTitle || "");
    setPitchNote(`Halo ${project.ownerName || "Owner"}, saya tertarik banget untuk kolaborasi dan bantu kembangin ${project.title}!`);
  };

  const handleSendJoinRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joiningProject || !selectedRole) return;

    expressInterest(joiningProject.id, selectedRole, pitchNote);

    addToast({
      title: "Permintaan Gabung Terkirim",
      description: `Kamu melamar posisi ${selectedRole} di proyek "${joiningProject.title}". Kamu bisa cek status di tab Lamaran Saya!`,
      type: "success",
    });

    setJoiningProject(null);
  };

  const handleAcceptApplicant = (request: JoinRequest) => {
    acceptJoinRequest(request.id);

    if (request.applicantId) {
      swipeRight(request.applicantId);
      sendMessageAsync(
        request.applicantId,
        `Halo ${request.applicantName}! Permintaan gabung kamu untuk role ${request.roleTitle} di proyek "${request.projectTitle}" sudah saya terima. Senang bisa ngoding bareng kamu!`
      );
    }

    addToast({
      title: "Pelamar Diterima (ACC)",
      description: `${request.applicantName} resmi menjadi partner proyek "${request.projectTitle}". Kamu bisa langsung mengobrol di Pesan!`,
      type: "success",
    });
  };

  const handleRejectApplicant = (request: JoinRequest) => {
    rejectJoinRequest(request.id);
    addToast({
      title: "Permintaan Ditolak",
      description: `Permintaan dari ${request.applicantName} telah ditolak.`,
      type: "info",
    });
  };

  const handleFindPartnersForProject = (project: Project) => {
    const roleTitles = project.roles.map((r) => r.roleTitle).join(",");
    router.push(`/find-partner?roles=${encodeURIComponent(roleTitles)}&project=${encodeURIComponent(project.title)}`);
  };

  return (
    <Shell>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-devora-border pb-5">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-devora-ink tracking-tight">
              Papan Proyek & Kolaborasi
            </h1>
            <p className="text-xs sm:text-sm text-devora-muted">
              Tempat mengelola proyek, memantau status lamaran, dan menerima permintaan gabung developer lain.
            </p>
          </div>

          <Link href="/projects/new">
            <Button size="md" className="gap-2 bg-devora-brand text-white hover:bg-devora-brand-dark font-bold shadow-md">
              <Plus className="w-4 h-4" />
              <span>Posting Proyek Baru</span>
            </Button>
          </Link>
        </div>

        {/* Primary 3-Tab Switcher: Semua Proyek | Proyek Saya | Lamaran Saya */}
        <div className="flex items-center gap-1 sm:gap-2 border-b border-devora-border pb-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("ALL")}
            className={cn(
              "px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap",
              activeTab === "ALL"
                ? "border-devora-brand text-devora-brand"
                : "border-transparent text-devora-muted hover:text-devora-ink"
            )}
          >
            <FolderKanban className="w-4 h-4" />
            <span>Semua Proyek Komunitas ({projects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("MY_PROJECTS")}
            className={cn(
              "px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 relative whitespace-nowrap",
              activeTab === "MY_PROJECTS"
                ? "border-devora-brand text-devora-brand"
                : "border-transparent text-devora-muted hover:text-devora-ink"
            )}
          >
            <Layers className="w-4 h-4" />
            <span>Proyek Saya ({myProjects.length})</span>
            {pendingRequestsForMe.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-devora-brand text-white text-[10px] font-mono font-bold">
                {pendingRequestsForMe.length} Pelamar
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("MY_APPLICATIONS")}
            className={cn(
              "px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 relative whitespace-nowrap",
              activeTab === "MY_APPLICATIONS"
                ? "border-devora-brand text-devora-brand"
                : "border-transparent text-devora-muted hover:text-devora-ink"
            )}
          >
            <Inbox className="w-4 h-4" />
            <span>Lamaran Saya ({mySubmittedApplications.length})</span>
            {mySubmittedApplications.some((a) => a.status === "ACCEPTED") && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[10px] font-mono font-bold">
                Ada yang di-ACC
              </span>
            )}
          </button>
        </div>

        {/* TAB 3: STATUS LAMARAN SAYA (User as Applicant) */}
        {activeTab === "MY_APPLICATIONS" ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-devora-ink">
                Status Lamaran Proyek Kamu
              </h2>
              <p className="text-xs text-devora-muted">
                Pantau langsung apakah permintaan gabung kamu sudah di-ACC atau ditolak oleh owner proyek.
              </p>
            </div>

            {mySubmittedApplications.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {mySubmittedApplications.map((app) => {
                  const targetProject = projects.find((p) => p.id === app.projectId);
                  const isAccepted = app.status === "ACCEPTED";
                  const isRejected = app.status === "REJECTED";
                  const isPending = app.status === "PENDING";

                  return (
                    <Card
                      key={app.id}
                      className={cn(
                        "p-5 sm:p-6 bg-devora-surface border-2 rounded-container space-y-4 transition-all shadow-xs",
                        isAccepted
                          ? "border-emerald-500/40 bg-emerald-500/5"
                          : isRejected
                            ? "border-devora-border opacity-75"
                            : "border-devora-border"
                      )}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-devora-border pb-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono uppercase font-bold text-devora-muted">
                            Proyek Tujuan: {targetProject?.ownerName || "Owner"}
                          </span>
                          <h3 className="text-lg font-bold text-devora-ink">
                            {app.projectTitle}
                          </h3>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {isAccepted && (
                            <Badge variant="default" className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-xs font-bold gap-1 px-3 py-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Lamaran Diterima (ACC)</span>
                            </Badge>
                          )}
                          {isPending && (
                            <Badge variant="default" className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-xs font-bold gap-1 px-3 py-1">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>Menunggu Konfirmasi Owner</span>
                            </Badge>
                          )}
                          {isRejected && (
                            <Badge variant="default" className="bg-devora-surface-strong text-devora-muted border-devora-border text-xs font-medium px-3 py-1">
                              <span>Belum Cocok (Ditolak)</span>
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Detail of Application */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-devora-background border border-devora-border rounded-button space-y-1">
                          <span className="text-[10px] font-mono uppercase text-devora-muted font-semibold">
                            Posisi yang Dilamar:
                          </span>
                          <p className="font-bold text-devora-ink">
                            {app.roleTitle} ({app.hoursPerWeek} jam/minggu)
                          </p>
                        </div>

                        <div className="p-3 bg-devora-background border border-devora-border rounded-button space-y-1">
                          <span className="text-[10px] font-mono uppercase text-devora-muted font-semibold">
                            Tanggal Mengajukan:
                          </span>
                          <p className="text-devora-ink font-medium">
                            {new Date(app.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Pitch message sent */}
                      <div className="p-3 bg-devora-surface-strong/50 rounded-button border border-devora-border space-y-1">
                        <span className="text-[10px] font-mono uppercase text-devora-muted font-semibold">
                          Pesan yang Kamu Kirimkan:
                        </span>
                        <p className="text-xs text-devora-ink italic leading-relaxed">
                          &ldquo;{app.pitchNote}&rdquo;
                        </p>
                      </div>

                      {/* Action Bottom Bar */}
                      <div className="pt-2 border-t border-devora-border flex items-center justify-between gap-3">
                        <p className="text-xs text-devora-muted">
                          {isAccepted
                            ? "Selamat! Kamu sudah resmi jadi partner di proyek ini."
                            : isPending
                              ? "Owner proyek akan meninjau ketersediaan waktu dan keahlianmu."
                              : "Jangan patah semangat, yuk cari proyek lain yang pas!"}
                        </p>

                        {isAccepted && (
                          <Link href="/messages">
                            <Button size="sm" className="gap-1.5 bg-devora-brand text-white hover:bg-devora-brand-dark font-bold text-xs shadow-xs">
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Buka Chat dengan Owner</span>
                            </Button>
                          </Link>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="py-16 px-6 sm:py-24 sm:px-10 text-center bg-devora-surface border-2 border-dashed border-devora-border rounded-container flex flex-col items-center justify-center space-y-6 shadow-xs">
                <div className="w-16 h-16 rounded-full bg-devora-surface-strong border border-devora-border flex items-center justify-center text-devora-brand shadow-xs">
                  <Inbox className="w-8 h-8" />
                </div>
                <div className="space-y-2.5 max-w-md mx-auto">
                  <h3 className="text-xl sm:text-2xl font-bold text-devora-ink tracking-tight">
                    Kamu belum pernah melamar ke proyek manapun
                  </h3>
                  <p className="text-sm text-devora-muted leading-relaxed">
                    Yuk cari proyek menarik di tab Semua Proyek dan klik &ldquo;Mau Gabung Proyek Ini&rdquo; untuk mengirim permohonan kolaborasi!
                  </p>
                </div>
                <div className="pt-2">
                  <Button
                    size="md"
                    className="gap-2 px-6 py-3 bg-devora-brand hover:bg-devora-brand-dark text-white font-bold shadow-md hover:shadow-lg transition-all rounded-button text-sm"
                    onClick={() => setActiveTab("ALL")}
                  >
                    <span>Jelajahi Semua Proyek</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            )}
          </div>
        ) : (
          /* TAB 1 & TAB 2: SEMUA PROYEK & PROYEK SAYA */
          <>
            {/* Search & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-devora-surface border border-devora-border p-3.5 rounded-container">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-devora-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari proyek berdasarkan nama, stack, atau role (misal: UI/UX, Postgres, Next.js)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-devora-background border border-devora-border rounded-button focus:outline-none focus:border-devora-brand text-devora-ink placeholder:text-devora-muted"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { label: "Semua", key: "ALL" },
                  { label: "MVP", key: "MVP" },
                  { label: "Prototype", key: "PROTOTYPE" },
                  { label: "Ideation", key: "IDEATION" },
                  { label: "Production", key: "PRODUCTION" },
                ].map((stg) => (
                  <button
                    key={stg.key}
                    onClick={() => setSelectedStage(stg.key)}
                    className={`px-3 py-1.5 rounded-button text-xs font-semibold whitespace-nowrap transition-colors ${selectedStage === stg.key
                        ? "bg-devora-ink text-white"
                        : "bg-devora-surface-strong text-devora-muted hover:text-devora-ink hover:bg-devora-border"
                      }`}
                  >
                    {stg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Projects Cards Grid */}
            {isLoading && displayedProjects.length === 0 ? (
              <ProjectBoardSkeletonList count={4} />
            ) : displayedProjects.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 animate-in fade-in duration-200">
                {displayedProjects.map((project) => {
                  const isOwner = project.ownerId === currentUser.id;

                  // Check if current user has applied to this project and get exact status
                  const userApplication = joinRequests.find(
                    (req) => req.projectId === project.id && req.applicantId === currentUser.id
                  );

                  // Join requests for this specific project (when owner is viewing)
                  const projectApplicants = joinRequests.filter(
                    (req) => req.projectId === project.id
                  );

                  return (
                    <Card
                      key={project.id}
                      className="p-5 sm:p-6 bg-devora-surface border-2 border-devora-border hover:border-devora-border-strong transition-all space-y-5 shadow-xs"
                    >
                      {/* Top Bar: Owner & Stage */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-devora-border pb-3">
                        <div className="flex items-center gap-3">
                          <Avatar
                            fallback={(project.ownerName || "DV").slice(0, 2).toUpperCase()}
                            size="sm"
                            className="border border-devora-border"
                          />
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-devora-ink">
                                {project.ownerName || "Developer"}
                              </span>
                              {isOwner && (
                                <Badge variant="brand" className="text-[10px] py-0 px-1.5 font-semibold">
                                  Proyek Milik Kamu
                                </Badge>
                              )}
                            </div>
                            <span className="text-[11px] text-devora-muted block">
                              Diposting {new Date(project.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="text-xs font-semibold">
                            {project.stage}
                          </Badge>
                          {project.repoUrl && (
                            <a
                              href={project.repoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-devora-muted hover:text-devora-brand p-1"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Project Title & Description */}
                      <div className="space-y-2">
                        <h2 className="text-xl font-bold text-devora-ink tracking-tight">
                          {project.title}
                        </h2>
                        <p className="text-xs sm:text-sm text-devora-ink leading-relaxed">
                          {project.description}
                        </p>
                      </div>

                      {/* Partner Roles Needed Section */}
                      <div className="space-y-2.5 pt-1">
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-devora-brand" />
                          <span className="text-xs font-mono uppercase font-bold text-devora-muted tracking-wider">
                            Posisi Partner yang Dibutuhin ({project.roles.length}):
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {project.roles.map((role, rIdx) => (
                            <div
                              key={role.id || `role-${project.id}-${rIdx}`}
                              className="p-3 bg-devora-background border border-devora-border rounded-button space-y-2"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-devora-ink">
                                  {role.roleTitle}
                                </span>
                                <span className="text-[10px] text-devora-muted font-mono flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-devora-brand" />
                                  {role.hoursPerWeek} jam/mgg
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-1">
                                {role.requiredSkills.map((skill, sIdx) => (
                                  <Badge
                                    key={`${role.id || 'r'}-${skill}-${sIdx}`}
                                    variant="default"
                                    className="text-[10px] py-0 px-1.5 bg-devora-surface-strong text-devora-ink"
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* SPECIAL OWNER SECTION: Review Applicants & Manage Join Requests */}
                      {isOwner && (
                        <div className="space-y-3 pt-3 border-t border-devora-border">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <UserCheck className="w-4 h-4 text-devora-brand" />
                              <span className="text-xs font-mono uppercase font-bold text-devora-ink tracking-wider">
                                Orang yang Ingin Join ({projectApplicants.length} Permintaan)
                              </span>
                            </div>
                            {projectApplicants.length > 0 && (
                              <span className="text-[11px] text-devora-muted font-medium">
                                Pilih siapa yang ingin kamu ACC untuk jadi partner
                              </span>
                            )}
                          </div>

                          {projectApplicants.length > 0 ? (
                            <div className="space-y-3">
                              {projectApplicants.map((applicant) => {
                                const isPending = applicant.status === "PENDING";
                                const isAccepted = applicant.status === "ACCEPTED";
                                const isRejected = applicant.status === "REJECTED";

                                return (
                                  <div
                                    key={applicant.id}
                                    className={cn(
                                      "p-4 rounded-container border transition-all space-y-3",
                                      isAccepted
                                        ? "bg-emerald-500/5 border-emerald-500/30"
                                        : isRejected
                                          ? "bg-devora-surface-strong/40 border-devora-border opacity-70"
                                          : "bg-devora-background border-devora-border hover:border-devora-brand/40 shadow-xs"
                                    )}
                                  >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                      <div className="flex items-start gap-3">
                                        <Avatar
                                          src={applicant.applicantAvatarUrl}
                                          fallback={applicant.applicantName.slice(0, 2).toUpperCase()}
                                          size="md"
                                          className="border border-devora-border shrink-0"
                                        />
                                        <div className="space-y-0.5">
                                          <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-bold text-devora-ink">
                                              {applicant.applicantName}
                                            </h3>
                                            <Badge variant="brand" className="text-[10px] py-0 px-1.5 font-bold">
                                              Melamar: {applicant.roleTitle}
                                            </Badge>
                                          </div>
                                          <p className="text-xs text-devora-muted">
                                            {applicant.applicantTitle} • {applicant.hoursPerWeek} jam/mgg
                                          </p>
                                        </div>
                                      </div>

                                      {/* Decision Actions */}
                                      <div className="flex items-center gap-2 self-end sm:self-center">
                                        {isPending ? (
                                          <>
                                            <Button
                                              size="sm"
                                              variant="secondary"
                                              className="text-xs text-red-600 hover:bg-red-500/10 border-red-200 gap-1"
                                              onClick={() => handleRejectApplicant(applicant)}
                                            >
                                              <UserX className="w-3.5 h-3.5" />
                                              <span>Tolak</span>
                                            </Button>
                                            <Button
                                              size="sm"
                                              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 shadow-xs"
                                              onClick={() => handleAcceptApplicant(applicant)}
                                            >
                                              <CheckCircle2 className="w-3.5 h-3.5" />
                                              <span>Terima (ACC)</span>
                                            </Button>
                                          </>
                                        ) : isAccepted ? (
                                          <div className="flex items-center gap-2">
                                            <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs font-bold gap-1">
                                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                              <span>Partner Resmi (Diterima)</span>
                                            </Badge>
                                            <Link href="/messages">
                                              <Button size="sm" className="text-xs gap-1 bg-devora-ink text-white">
                                                <MessageSquare className="w-3.5 h-3.5" />
                                                <span>Mulai Chat</span>
                                              </Button>
                                            </Link>
                                          </div>
                                        ) : (
                                          <Badge variant="default" className="text-xs text-devora-muted">
                                            Permintaan Ditolak
                                          </Badge>
                                        )}
                                      </div>
                                    </div>

                                    {/* Applicant's Pitch Note */}
                                    <div className="p-2.5 bg-devora-surface rounded-button border border-devora-border text-xs text-devora-ink leading-relaxed italic">
                                      &ldquo;{applicant.pitchNote}&rdquo;
                                    </div>

                                    {/* Skills */}
                                    {applicant.skills && applicant.skills.length > 0 && (
                                      <div className="flex flex-wrap gap-1">
                                        {applicant.skills.map((skill, i) => (
                                          <Badge
                                            key={i}
                                            variant="default"
                                            className="text-[10px] py-0 px-1.5 bg-devora-surface-strong text-devora-muted"
                                          >
                                            {skill}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="p-4 rounded-button bg-devora-background border border-dashed border-devora-border text-center text-xs text-devora-muted space-y-2">
                              <p>Belum ada pelamar baru untuk proyek ini.</p>
                              <Button
                                size="sm"
                                variant="secondary"
                                className="text-xs gap-1"
                                onClick={() => handleFindPartnersForProject(project)}
                              >
                                <Flame className="w-3.5 h-3.5 text-devora-brand" />
                                <span>Cari Partner Lewat Swipe Deck</span>
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Bottom Action Bar for Non-Owner or Owner Shortcuts */}
                      <div className="pt-3 border-t border-devora-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs text-devora-muted">
                          <span>{project.roles.length} Posisi Terbuka</span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          {isOwner ? (
                            /* Owner Shortcuts */
                            <Button
                              size="sm"
                              onClick={() => handleFindPartnersForProject(project)}
                              className="gap-2 bg-devora-brand hover:bg-devora-brand-dark text-white font-bold text-xs shadow-sm"
                            >
                              <Flame className="w-4 h-4 fill-white" />
                              <span>Cari Partner Buat Proyek Ini (Swipe)</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                          ) : (
                            /* Non-Owner Actions: Request Join with Live Status */
                            <div>
                              {userApplication ? (
                                userApplication.status === "ACCEPTED" ? (
                                  <div className="flex items-center gap-2">
                                    <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs font-bold gap-1 px-2.5 py-1">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>Lamaran Kamu di-ACC</span>
                                    </Badge>
                                    <Link href="/messages">
                                      <Button size="sm" className="text-xs gap-1 bg-devora-ink text-white">
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        <span>Buka Chat</span>
                                      </Button>
                                    </Link>
                                  </div>
                                ) : userApplication.status === "REJECTED" ? (
                                  <Badge variant="default" className="text-xs text-devora-muted px-2.5 py-1">
                                    Lamaran Belum Cocok
                                  </Badge>
                                ) : (
                                  <Badge variant="default" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs font-semibold gap-1 px-2.5 py-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>Menunggu Konfirmasi Owner</span>
                                  </Badge>
                                )
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => handleOpenJoinModal(project)}
                                  className="gap-1.5 text-xs font-semibold bg-devora-ink text-white hover:bg-devora-ink-soft"
                                >
                                  <Users className="w-3.5 h-3.5" />
                                  <span>Mau Gabung Proyek Ini</span>
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="py-16 px-6 sm:py-24 sm:px-10 text-center bg-devora-surface border-2 border-dashed border-devora-border rounded-container flex flex-col items-center justify-center space-y-6 shadow-xs">
                <div className="w-16 h-16 rounded-full bg-devora-surface-strong border border-devora-border flex items-center justify-center text-devora-brand shadow-xs">
                  <FolderKanban className="w-8 h-8" />
                </div>
                <div className="space-y-2.5 max-w-md mx-auto">
                  <h3 className="text-xl sm:text-2xl font-bold text-devora-ink tracking-tight">
                    {activeTab === "MY_PROJECTS"
                      ? "Kamu belum memposting proyek apapun"
                      : "Belum ada proyek yang cocok sama pencarianmu"}
                  </h3>
                  <p className="text-sm text-devora-muted leading-relaxed">
                    {activeTab === "MY_PROJECTS"
                      ? "Yuk buat postingan proyek pertama kamu untuk mencari partner impian dan bangun aplikasi bareng!"
                      : "Coba ubah kata kunci filter atau posting proyek kamu sendiri untuk mengajak developer lain berkolaborasi!"}
                  </p>
                </div>
                <div className="pt-2">
                  <Link href="/projects/new">
                    <Button size="md" className="gap-2 px-6 py-3 bg-devora-brand hover:bg-devora-brand-dark text-white font-bold shadow-md hover:shadow-lg transition-all rounded-button text-sm">
                      <Plus className="w-4 h-4" />
                      <span>Posting Proyek Sekarang</span>
                    </Button>
                  </Link>
                </div>
              </Card>
            )}
          </>
        )}

        {/* Request Join Modal */}
        {joiningProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-devora-ink/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
              className="relative w-full max-w-md bg-devora-surface border border-devora-border rounded-container shadow-2xl p-6 space-y-5 animate-in zoom-in-95"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-devora-border pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-devora-brand">
                    Ajukan Diri Sebagai Partner
                  </span>
                  <h3 className="text-lg font-bold text-devora-ink">
                    Yuk Gabung ke {joiningProject.title}!
                  </h3>
                </div>
                <button
                  onClick={() => setJoiningProject(null)}
                  className="p-1.5 text-devora-muted hover:text-devora-ink rounded-button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSendJoinRequest} className="space-y-4">
                {/* Select Role */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase font-semibold text-devora-muted">
                    Pilih Posisi / Role yang Ingin Kamu Ambil:
                  </label>
                  <div className="space-y-1.5">
                    {joiningProject.roles.map((role) => (
                      <label
                        key={role.id}
                        className={`p-3 rounded-button border flex items-center justify-between cursor-pointer transition-all ${selectedRole === role.roleTitle
                            ? "bg-devora-brand-soft/70 border-devora-brand/40 text-devora-brand-dark font-bold"
                            : "bg-devora-background border-devora-border text-devora-ink hover:border-devora-brand"
                          }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="joinRole"
                            value={role.roleTitle}
                            checked={selectedRole === role.roleTitle}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="accent-devora-brand"
                          />
                          <span className="text-xs">{role.roleTitle}</span>
                        </div>
                        <span className="text-[10px] text-devora-muted">
                          {role.hoursPerWeek} jam/mgg
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Pitch / Message */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase font-semibold text-devora-muted">
                    Sapa Owner & Ceritakan Kenapa Kamu Tertarik:
                  </label>
                  <textarea
                    rows={3}
                    value={pitchNote}
                    onChange={(e) => setPitchNote(e.target.value)}
                    className="w-full px-3 py-2 bg-devora-background border border-devora-border rounded-button text-xs sm:text-sm text-devora-ink placeholder:text-devora-muted focus:outline-none focus:border-devora-brand resize-none"
                    placeholder="Ceritakan keahlian relevan dan kesiapan waktu kamu..."
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setJoiningProject(null)}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="gap-1.5 bg-devora-brand text-white hover:bg-devora-brand-dark font-bold"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Permintaan Gabung</span>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
