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
import { Project, JoinRequest, ProjectStage, UserProfile } from "@/store/types";
import {
  FolderKanban,
  Plus,
  Flame,
  Search,
  Users,
  Clock,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  ArrowRight,
  X,
  UserCheck,
  UserX,
  Send,
  GitBranch,
  Layers,
  Inbox,
  AlertCircle,
  Eye,
  Award,
  FolderGit2,
  Briefcase,
  Rocket,
  Edit3,
  Trash2,
  Lock,
  Unlock,
  Bookmark,
  BookmarkCheck,
  Share2,
  Filter,
  Check,
  MapPin,
  Sparkles,
  Zap,
} from "lucide-react";
import { ProjectBoardSkeletonList } from "@/components/ui/ProjectCardSkeleton";
import { cn } from "@/lib/utils";

const ROLE_PRESET_FILTERS = [
  "Semua Role",
  "UI/UX Designer",
  "Frontend Developer",
  "Backend Developer",
  "Fullstack Engineer",
  "Mobile Developer",
  "AI Engineer",
  "DevOps",
];

export default function ProjectsPage() {
  const router = useRouter();
  const {
    projects,
    joinRequests,
    expressedInterests,
    expressInterest,
    acceptJoinRequest,
    rejectJoinRequest,
    cancelJoinRequest,
    editJoinRequest,
    toggleProjectRecruitment,
    updateProjectAsync,
    deleteProjectAsync,
    bookmarkedProjectIds,
    toggleBookmarkProject,
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

  // Primary Tab State: "ALL" | "MY_PROJECTS" | "MY_APPLICATIONS"
  const [activeTab, setActiveTab] = useState<"ALL" | "MY_PROJECTS" | "MY_APPLICATIONS">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState<string>("ALL");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("Semua Role");
  const [onlyOpenRecruitment, setOnlyOpenRecruitment] = useState(false);

  // Sub-filter for "Lamaran Saya" tab
  const [applicationStatusFilter, setApplicationStatusFilter] = useState<"ALL" | "PENDING" | "ACCEPTED" | "REJECTED">("ALL");

  // Per-project applicant role filter (Owner view)
  const [ownerApplicantRoleFilter, setOwnerApplicantRoleFilter] = useState<Record<string, string>>({});

  // Modal State for "Request Join"
  const [joiningProject, setJoiningProject] = useState<Project | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [pitchNote, setPitchNote] = useState("");

  // Modal State for "Applicant Profile Inspector"
  const [inspectingRequest, setInspectingRequest] = useState<JoinRequest | null>(null);
  const [inspectingUser, setInspectingUser] = useState<UserProfile | null>(null);
  const [isLoadingApplicant, setIsLoadingApplicant] = useState(false);

  // Modal State for "Edit Project" (Owner)
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStage, setEditStage] = useState<ProjectStage>("MVP");
  const [editRepoUrl, setEditRepoUrl] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Modal State for "Delete Project" (Owner)
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal State for "Edit Application" (Applicant)
  const [editingApplication, setEditingApplication] = useState<JoinRequest | null>(null);
  const [editAppRole, setEditAppRole] = useState("");
  const [editAppPitch, setEditAppPitch] = useState("");
  const [isSavingAppEdit, setIsSavingAppEdit] = useState(false);

  // Modal State for "Cancel Application" (Applicant)
  const [cancelingApplication, setCancelingApplication] = useState<JoinRequest | null>(null);
  const [isCancelingApp, setIsCancelingApp] = useState(false);

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

  // Filtered applications based on status
  const displayedApplications = mySubmittedApplications.filter((app) => {
    if (applicationStatusFilter === "ALL") return true;
    return app.status === applicationStatusFilter;
  });

  // Filtered projects according to active tab, search, stage, and role
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

    if (activeTab === "ALL") {
      if (onlyOpenRecruitment && proj.isRecruiting === false) return false;
      if (selectedRoleFilter !== "Semua Role") {
        const hasMatchingRole = proj.roles.some((r) =>
          r.roleTitle.toLowerCase().includes(selectedRoleFilter.toLowerCase().replace(" developer", "").replace(" specialist", "").replace(" engineer", ""))
        );
        if (!hasMatchingRole) return false;
      }
    }

    return true;
  });

  const handleOpenJoinModal = (project: Project) => {
    setJoiningProject(project);
    setSelectedRole(project.roles?.[0]?.roleTitle || "");
    setPitchNote(`Halo ${project.ownerName || "Owner"}, saya tertarik banget untuk kolaborasi dan bantu kembangin ${project.title}!`);
  };

  const handleInspectApplicant = async (request: JoinRequest) => {
    setInspectingRequest(request);
    setInspectingUser(null);
    setIsLoadingApplicant(true);
    try {
      const res = await fetch(`/api/users/${request.applicantId}`);
      if (res.ok) {
        const userData = await res.json();
        setInspectingUser(userData);
      }
    } catch (err) {
      console.error("Failed to fetch applicant profile:", err);
    } finally {
      setIsLoadingApplicant(false);
    }
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

    if (inspectingRequest?.id === request.id) {
      setInspectingRequest(null);
    }
  };

  const handleRejectApplicant = (request: JoinRequest) => {
    rejectJoinRequest(request.id);
    addToast({
      title: "Permintaan Ditolak",
      description: `Permintaan dari ${request.applicantName} telah ditolak.`,
      type: "info",
    });
    if (inspectingRequest?.id === request.id) {
      setInspectingRequest(null);
    }
  };

  // Toggle Recruitment for Owner
  const handleToggleRecruitment = async (project: Project) => {
    const nextStatus = project.isRecruiting === false ? true : false;
    try {
      await toggleProjectRecruitment(project.id, nextStatus);
      addToast({
        title: nextStatus ? "Rekrutmen Dibuka Kembali" : "Rekrutmen Telah Disudahi",
        description: nextStatus
          ? `Proyek "${project.title}" kini kembali menerima pendaftaran kolaborator.`
          : `Proyek "${project.title}" telah ditandai selesai rekrutmen. Posisi kolaborator ditutup.`,
        type: nextStatus ? "success" : "info",
      });
    } catch (err) {
      addToast({
        title: "Gagal Mengubah Status",
        description: "Terjadi kendala saat memperbarui status rekrutmen proyek.",
        type: "error",
      });
    }
  };

  // Open Edit Project Modal
  const handleOpenEditProject = (project: Project) => {
    setEditingProject(project);
    setEditTitle(project.title);
    setEditDescription(project.description);
    setEditStage(project.stage);
    setEditRepoUrl(project.repoUrl || "");
  };

  const handleSaveEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    setIsSavingEdit(true);
    try {
      await updateProjectAsync(editingProject.id, {
        title: editTitle,
        description: editDescription,
        stage: editStage,
        repoUrl: editRepoUrl,
      });
      addToast({
        title: "Proyek Diperbarui",
        description: `Informasi proyek "${editTitle}" berhasil disimpan.`,
        type: "success",
      });
      setEditingProject(null);
    } catch (err) {
      addToast({
        title: "Gagal Menyimpan",
        description: "Terjadi kesalahan saat memperbarui proyek.",
        type: "error",
      });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleConfirmDeleteProject = async () => {
    if (!deletingProject) return;
    setIsDeleting(true);
    try {
      const ok = await deleteProjectAsync(deletingProject.id);
      if (ok) {
        addToast({
          title: "Proyek Dihapus",
          description: `Proyek "${deletingProject.title}" berhasil dihapus.`,
          type: "info",
        });
        setDeletingProject(null);
      }
    } catch (err) {
      addToast({
        title: "Gagal Menghapus Proyek",
        description: "Terjadi kendala saat menghapus proyek.",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Open Edit Application Modal
  const handleOpenEditApplication = (app: JoinRequest) => {
    setEditingApplication(app);
    setEditAppRole(app.roleTitle);
    setEditAppPitch(app.pitchNote || "");
  };

  const handleSaveEditApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApplication) return;
    setIsSavingAppEdit(true);
    try {
      await editJoinRequest(editingApplication.id, editAppRole, editAppPitch);
      addToast({
        title: "Lamaran Diperbarui",
        description: "Pilihan role dan pesan motivasi lamaran kamu berhasil diperbarui.",
        type: "success",
      });
      setEditingApplication(null);
    } catch (err) {
      addToast({
        title: "Gagal Memperbarui Lamaran",
        description: "Terjadi kesalahan saat mengubah lamaran.",
        type: "error",
      });
    } finally {
      setIsSavingAppEdit(false);
    }
  };

  const handleConfirmCancelApplication = async () => {
    if (!cancelingApplication) return;
    setIsCancelingApp(true);
    try {
      await cancelJoinRequest(cancelingApplication.id);
      addToast({
        title: "Lamaran Dibatalkan",
        description: `Permohonan gabung ke proyek "${cancelingApplication.projectTitle}" telah dibatalkan.`,
        type: "info",
      });
      setCancelingApplication(null);
    } catch (err) {
      addToast({
        title: "Gagal Membatalkan",
        description: "Terjadi kendala saat membatalkan lamaran.",
        type: "error",
      });
    } finally {
      setIsCancelingApp(false);
    }
  };

  const handleShareProject = (project: Project) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/projects?projectId=${project.id}`);
      addToast({
        title: "Tautan Proyek Disalin!",
        description: `Link untuk proyek "${project.title}" berhasil disalin ke clipboard.`,
        type: "success",
      });
    }
  };

  const handleFindPartnersForProject = (project: Project) => {
    const roleTitles = project.roles.map((r) => r.roleTitle).join(",");
    router.push(
      `/find-partner?inviteProjectId=${project.id}&projectTitle=${encodeURIComponent(
        project.title
      )}&roles=${encodeURIComponent(roleTitles)}`
    );
  };

  return (
    <Shell>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
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
            <span>Semua Proyek Komunitas ({uniqueProjects.length})</span>
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

        {/* ════════════════════════════════════════════════════════════════
            TAB 3: STATUS LAMARAN SAYA (User as Applicant)
            ════════════════════════════════════════════════════════════════ */}
        {activeTab === "MY_APPLICATIONS" ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <h2 className="text-lg font-bold text-devora-ink">
                  Status Lamaran Proyek Kamu
                </h2>
                <p className="text-xs text-devora-muted">
                  Pantau langsung status pendaftaran kolaborasimu, edit pesan lamaran, atau batalkan lamaran kapan saja.
                </p>
              </div>

              {/* Status Sub-Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { label: "Semua", key: "ALL", count: mySubmittedApplications.length },
                  { label: "Menunggu", key: "PENDING", count: mySubmittedApplications.filter((a) => a.status === "PENDING").length },
                  { label: "Diterima (ACC)", key: "ACCEPTED", count: mySubmittedApplications.filter((a) => a.status === "ACCEPTED").length },
                  { label: "Ditolak", key: "REJECTED", count: mySubmittedApplications.filter((a) => a.status === "REJECTED").length },
                ].map((st) => (
                  <button
                    key={st.key}
                    onClick={() => setApplicationStatusFilter(st.key as any)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border",
                      applicationStatusFilter === st.key
                        ? "bg-devora-ink text-white border-devora-ink"
                        : "bg-devora-surface text-devora-muted border-devora-border hover:text-devora-ink"
                    )}
                  >
                    <span>{st.label}</span>
                    <span className="text-[10px] opacity-75">({st.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {displayedApplications.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {displayedApplications.map((app) => {
                  const targetProject = uniqueProjects.find((p) => p.id === app.projectId);
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
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono uppercase font-bold text-devora-muted">
                              Proyek Tujuan:
                            </span>
                            {targetProject?.ownerId && (
                              <Link
                                href={`/profile/${targetProject.ownerId}`}
                                className="text-xs font-bold text-devora-brand hover:underline inline-flex items-center gap-1"
                              >
                                <span>{targetProject.ownerName || "Owner"}</span>
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            )}
                          </div>
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
                      <div className="pt-2 border-t border-devora-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <p className="text-xs text-devora-muted">
                          {isAccepted
                            ? "Selamat! Kamu sudah resmi jadi partner di proyek ini."
                            : isPending
                              ? "Owner proyek akan meninjau ketersediaan waktu dan keahlianmu."
                              : "Jangan patah semangat, yuk cari proyek lain yang pas!"}
                        </p>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {/* EDIT & CANCEL BUTTONS (FOR PENDING APPLICATIONS) */}
                          {isPending && (
                            <>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleOpenEditApplication(app)}
                                className="text-xs gap-1 border-devora-border hover:border-devora-ink font-semibold"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-devora-ink" />
                                <span>Edit Lamaran</span>
                              </Button>

                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => setCancelingApplication(app)}
                                className="text-xs text-red-600 hover:bg-red-50 border-red-200 gap-1 font-semibold"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Batalkan Lamaran</span>
                              </Button>
                            </>
                          )}

                          {isAccepted && targetProject?.ownerId && (
                            <Link href={`/messages?userId=${targetProject.ownerId}`}>
                              <Button size="sm" className="gap-1.5 bg-devora-brand text-white hover:bg-devora-brand-dark font-bold text-xs shadow-xs">
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>Buka Chat dengan Owner</span>
                              </Button>
                            </Link>
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
                  <Inbox className="w-8 h-8" />
                </div>
                <div className="space-y-2.5 max-w-md mx-auto">
                  <h3 className="text-xl sm:text-2xl font-bold text-devora-ink tracking-tight">
                    {applicationStatusFilter !== "ALL"
                      ? "Tidak ada lamaran dengan status ini"
                      : "Kamu belum pernah melamar ke proyek manapun"}
                  </h3>
                  <p className="text-sm text-devora-muted leading-relaxed">
                    Yuk cari proyek menarik di tab Semua Proyek dan klik &ldquo;Mau Gabung Proyek Ini&rdquo; untuk mengirim permohonan kolaborasi!
                  </p>
                </div>
                <div className="pt-2">
                  <Button
                    size="md"
                    className="gap-2 px-6 py-3 bg-devora-brand hover:bg-devora-brand-dark text-white font-bold shadow-md hover:shadow-lg transition-all rounded-button text-sm"
                    onClick={() => {
                      setApplicationStatusFilter("ALL");
                      setActiveTab("ALL");
                    }}
                  >
                    <span>Jelajahi Semua Proyek</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            )}
          </div>
        ) : (
          /* ════════════════════════════════════════════════════════════════
              TAB 1 & TAB 2: SEMUA PROYEK & PROYEK SAYA
              ════════════════════════════════════════════════════════════════ */
          <>
            {/* Search & Filter Toolbar */}
            <div className="space-y-3 bg-devora-surface border border-devora-border p-4 rounded-container">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
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
                    { label: "Semua Stage", key: "ALL" },
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

              {/* Enhanced Community Role Filter Chips & Status Toggle (Tab Semua Proyek) */}
              {activeTab === "ALL" && (
                <div className="pt-2 border-t border-devora-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    <span className="text-[11px] font-mono uppercase font-bold text-devora-muted shrink-0 mr-1">
                      Cari Role:
                    </span>
                    {ROLE_PRESET_FILTERS.map((roleTag) => (
                      <button
                        key={roleTag}
                        onClick={() => setSelectedRoleFilter(roleTag)}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all",
                          selectedRoleFilter === roleTag
                            ? "bg-devora-brand text-white shadow-xs font-bold"
                            : "bg-devora-background text-devora-muted border border-devora-border hover:border-devora-brand hover:text-devora-ink"
                        )}
                      >
                        {roleTag}
                      </button>
                    ))}
                  </div>

                  {/* Only Open Recruitment Toggle */}
                  <label className="flex items-center gap-2 cursor-pointer shrink-0 select-none text-xs font-bold text-devora-ink">
                    <input
                      type="checkbox"
                      checked={onlyOpenRecruitment}
                      onChange={(e) => setOnlyOpenRecruitment(e.target.checked)}
                      className="accent-devora-brand rounded w-3.5 h-3.5"
                    />
                    <span>Hanya Yang Buka Lowongan</span>
                  </label>
                </div>
              )}
            </div>

            {/* Projects Cards Grid */}
            {isLoading && displayedProjects.length === 0 ? (
              <ProjectBoardSkeletonList count={4} />
            ) : displayedProjects.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 animate-in fade-in duration-200">
                {displayedProjects.map((project) => {
                  const isOwner = project.ownerId === currentUser.id;
                  const isRecruiting = project.isRecruiting !== false;
                  const isBookmarked = bookmarkedProjectIds.includes(project.id);

                  // Check if current user has applied to this project
                  const userApplication = joinRequests.find(
                    (req) => req.projectId === project.id && req.applicantId === currentUser.id
                  );

                  // Join requests for this specific project (when owner is viewing)
                  const rawProjectApplicants = joinRequests.filter(
                    (req) => req.projectId === project.id
                  );

                  const selectedRoleFilterForOwner = ownerApplicantRoleFilter[project.id] || "ALL";
                  const projectApplicants = rawProjectApplicants.filter((req) => {
                    if (selectedRoleFilterForOwner === "ALL") return true;
                    return req.roleTitle === selectedRoleFilterForOwner;
                  });

                  return (
                    <Card
                      key={project.id}
                      className={cn(
                        "p-5 sm:p-6 bg-devora-surface border-2 rounded-container transition-all space-y-5 shadow-xs",
                        !isRecruiting ? "border-devora-border/80 bg-slate-50/50" : "border-devora-border hover:border-devora-border-strong"
                      )}
                    >
                      {/* Top Bar: Owner, Status Badges & Quick Action Buttons */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-devora-border pb-3">
                        <div className="flex items-center gap-3">
                          <Link href={`/profile/${project.ownerId}`}>
                            <Avatar
                              fallback={(project.ownerName || "DV").slice(0, 2).toUpperCase()}
                              size="sm"
                              className="border border-devora-border hover:border-devora-brand cursor-pointer transition-colors"
                            />
                          </Link>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <Link href={`/profile/${project.ownerId}`} className="hover:text-devora-brand transition-colors">
                                <span className="text-xs font-bold text-devora-ink">
                                  {project.ownerName || "Developer"}
                                </span>
                              </Link>
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

                        {/* Badges & Owner / Community Action Icons */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* RECRUITMENT STATUS BADGE */}
                          {isRecruiting ? (
                            <Badge variant="brand" className="text-[10px] font-bold gap-1.5 py-0.5 px-2.5">
                              <Zap className="w-3 h-3 fill-white text-white" />
                              <span>Merekrut Kolaborator</span>
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-300 text-[10px] font-bold gap-1.5 py-0.5 px-2.5">
                              <Lock className="w-3 h-3 text-slate-500" />
                              <span>Rekrutmen Ditutup</span>
                            </Badge>
                          )}

                          <Badge variant="default" className="text-xs font-semibold">
                            {project.stage}
                          </Badge>

                          {/* Share Button */}
                          <button
                            type="button"
                            onClick={() => handleShareProject(project)}
                            className="p-1.5 text-devora-muted hover:text-devora-brand rounded-button hover:bg-devora-surface-strong transition-colors"
                            title="Bagikan Tautan Proyek"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Bookmark Button */}
                          <button
                            type="button"
                            onClick={() => toggleBookmarkProject(project.id)}
                            className={cn(
                              "p-1.5 rounded-button transition-colors",
                              isBookmarked
                                ? "text-amber-500 bg-amber-50"
                                : "text-devora-muted hover:text-amber-500 hover:bg-devora-surface-strong"
                            )}
                            title={isBookmarked ? "Hapus dari Bookmark" : "Simpan ke Bookmark"}
                          >
                            <Bookmark className={cn("w-3.5 h-3.5", isBookmarked && "fill-amber-500")} />
                          </button>

                          {/* External Repo */}
                          {project.repoUrl && (
                            <a
                              href={project.repoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-devora-muted hover:text-devora-brand p-1"
                              title="Buka Repositori GitHub"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {/* OWNER QUICK ACTION MENU: Edit & Delete */}
                          {isOwner && (
                            <div className="flex items-center gap-1 pl-1 border-l border-devora-border">
                              <button
                                type="button"
                                onClick={() => handleOpenEditProject(project)}
                                className="p-1.5 text-devora-muted hover:text-devora-ink rounded-button hover:bg-devora-surface-strong"
                                title="Edit Detail Proyek"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingProject(project)}
                                className="p-1.5 text-red-500 hover:text-red-700 rounded-button hover:bg-red-50"
                                title="Hapus Proyek"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
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
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <UserCheck className="w-4 h-4 text-devora-brand" />
                              <span className="text-xs font-mono uppercase font-bold text-devora-ink tracking-wider">
                                Orang yang Ingin Join ({rawProjectApplicants.length} Permintaan)
                              </span>
                            </div>

                            {/* Filter Applicants by Role */}
                            {project.roles.length > 1 && rawProjectApplicants.length > 0 && (
                              <div className="flex items-center gap-1.5 text-xs">
                                <span className="text-devora-muted">Filter Role:</span>
                                <select
                                  value={ownerApplicantRoleFilter[project.id] || "ALL"}
                                  onChange={(e) =>
                                    setOwnerApplicantRoleFilter((prev) => ({
                                      ...prev,
                                      [project.id]: e.target.value,
                                    }))
                                  }
                                  className="px-2 py-1 bg-devora-background border border-devora-border rounded text-xs font-semibold text-devora-ink"
                                >
                                  <option value="ALL">Semua Role</option>
                                  {project.roles.map((r) => (
                                    <option key={r.id} value={r.roleTitle}>
                                      {r.roleTitle}
                                    </option>
                                  ))}
                                </select>
                              </div>
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
                                        <Link href={`/profile/${applicant.applicantId}`}>
                                          <Avatar
                                            src={applicant.applicantAvatarUrl}
                                            fallback={applicant.applicantName.slice(0, 2).toUpperCase()}
                                            size="md"
                                            className="border border-devora-border shrink-0 hover:border-devora-brand cursor-pointer"
                                          />
                                        </Link>
                                        <div className="space-y-0.5">
                                          <div className="flex items-center gap-2">
                                            <Link href={`/profile/${applicant.applicantId}`} className="hover:text-devora-brand transition-colors">
                                              <h3 className="text-sm font-bold text-devora-ink">
                                                {applicant.applicantName}
                                              </h3>
                                            </Link>
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
                                      <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                                        <Button
                                          size="sm"
                                          variant="secondary"
                                          className="text-xs font-semibold gap-1 bg-devora-surface border-devora-border hover:border-devora-brand hover:text-devora-brand"
                                          onClick={() => handleInspectApplicant(applicant)}
                                        >
                                          <Eye className="w-3.5 h-3.5 text-devora-brand" />
                                          <span>Inspect Profil</span>
                                        </Button>

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
                                            <Link href={`/messages?userId=${applicant.applicantId}`}>
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

                      {/* Bottom Action Bar for Owner & Non-Owner */}
                      <div className="pt-3 border-t border-devora-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 text-xs text-devora-muted">
                          <span>{project.roles.length} Posisi Terbuka</span>
                          <span>•</span>
                          <span className={isRecruiting ? "text-emerald-600 font-semibold" : "text-slate-500 font-semibold"}>
                            {isRecruiting ? "Rekrutmen Aktif" : "Rekrutmen Ditutup"}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                          {isOwner ? (
                            /* OWNER ACTIONS: "Sudahi Rekrutmen" / "Buka Rekrutmen" + Invite Mode */
                            <div className="flex flex-wrap items-center gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleToggleRecruitment(project)}
                                className={cn(
                                  "text-xs font-bold gap-1.5 border shadow-xs transition-all",
                                  isRecruiting
                                    ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                                    : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300"
                                )}
                              >
                                {isRecruiting ? (
                                  <>
                                    <Lock className="w-3.5 h-3.5 text-slate-600" />
                                    <span>Sudahi Rekrutmen</span>
                                  </>
                                ) : (
                                  <>
                                    <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Buka Rekrutmen Kembali</span>
                                  </>
                                )}
                              </Button>

                              <Button
                                size="sm"
                                onClick={() => handleFindPartnersForProject(project)}
                                className="gap-2 bg-devora-brand hover:bg-devora-brand-dark text-white font-bold text-xs shadow-sm"
                              >
                                <Rocket className="w-4 h-4 text-white" />
                                <span>Cari Partner Manual (Mode Undang)</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          ) : (
                            /* Non-Owner Actions: Request Join with Live Status or Closed Notice */
                            <div>
                              {!isRecruiting ? (
                                <Badge variant="default" className="bg-slate-100 text-slate-600 border-slate-300 text-xs px-3 py-1.5 font-bold gap-1">
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>Rekrutmen Ditutup</span>
                                </Badge>
                              ) : userApplication ? (
                                userApplication.status === "ACCEPTED" ? (
                                  <div className="flex items-center gap-2">
                                    <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs font-bold gap-1 px-2.5 py-1">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>Lamaran Kamu di-ACC</span>
                                    </Badge>
                                    <Link href={`/messages?userId=${project.ownerId}`}>
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

        {/* ════════════════════════════════════════════════════════════════
            MODAL: REQUEST JOIN (AJUKAN DIRI)
            ════════════════════════════════════════════════════════════════ */}
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

        {/* ════════════════════════════════════════════════════════════════
            MODAL: EDIT APPLICATION (PELAMAR EDIT LAMARAN)
            ════════════════════════════════════════════════════════════════ */}
        {editingApplication && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-devora-ink/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
              className="relative w-full max-w-md bg-devora-surface border border-devora-border rounded-container shadow-2xl p-6 space-y-4 animate-in zoom-in-95"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-devora-border pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-devora-brand">
                    Ubah Pilihan Lamaran
                  </span>
                  <h3 className="text-lg font-bold text-devora-ink">
                    Edit Lamaran di {editingApplication.projectTitle}
                  </h3>
                </div>
                <button
                  onClick={() => setEditingApplication(null)}
                  className="p-1.5 text-devora-muted hover:text-devora-ink rounded-button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEditApplication} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase font-semibold text-devora-muted">
                    Posisi / Role yang Dilamar:
                  </label>
                  <input
                    type="text"
                    value={editAppRole}
                    onChange={(e) => setEditAppRole(e.target.value)}
                    className="w-full px-3 py-2 bg-devora-background border border-devora-border rounded-button text-xs font-semibold text-devora-ink focus:outline-none focus:border-devora-brand"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase font-semibold text-devora-muted">
                    Pesan Motivasi / Pitch Note:
                  </label>
                  <textarea
                    rows={4}
                    value={editAppPitch}
                    onChange={(e) => setEditAppPitch(e.target.value)}
                    className="w-full px-3 py-2 bg-devora-background border border-devora-border rounded-button text-xs text-devora-ink placeholder:text-devora-muted focus:outline-none focus:border-devora-brand resize-none"
                    placeholder="Perbarui alasan ketertarikan atau kesiapan waktumu..."
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-devora-border">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditingApplication(null)}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSavingAppEdit}
                    className="gap-1.5 bg-devora-brand text-white hover:bg-devora-brand-dark font-bold"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isSavingAppEdit ? "Menyimpan..." : "Simpan Perubahan"}</span>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            MODAL: CANCEL APPLICATION CONFIRMATION (BATALKAN LAMARAN)
            ════════════════════════════════════════════════════════════════ */}
        {cancelingApplication && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-devora-ink/65 backdrop-blur-sm animate-in fade-in duration-200">
            <div
              className="relative w-full max-w-sm bg-devora-surface border-2 border-red-200 rounded-container shadow-2xl p-6 space-y-4 animate-in zoom-in-95 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-devora-ink">
                  Batalkan Lamaran Ini?
                </h3>
                <p className="text-xs text-devora-muted leading-relaxed">
                  Permohonan gabung kamu ke proyek <span className="font-bold text-devora-ink">&ldquo;{cancelingApplication.projectTitle}&rdquo;</span> akan ditarik kembali. Kamu bisa melamar lagi kapan saja jika berubah pikiran.
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setCancelingApplication(null)}
                >
                  Kembali
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={isCancelingApp}
                  onClick={handleConfirmCancelApplication}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold"
                >
                  <span>{isCancelingApp ? "Membatalkan..." : "Ya, Batalkan Lamaran"}</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            MODAL: EDIT PROJECT (OWNER EDIT PROYEK)
            ════════════════════════════════════════════════════════════════ */}
        {editingProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-devora-ink/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
              className="relative w-full max-w-lg bg-devora-surface border border-devora-border rounded-container shadow-2xl p-6 space-y-4 animate-in zoom-in-95"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-devora-border pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-devora-brand">
                    Kelola Proyek
                  </span>
                  <h3 className="text-lg font-bold text-devora-ink">
                    Edit Detail Proyek
                  </h3>
                </div>
                <button
                  onClick={() => setEditingProject(null)}
                  className="p-1.5 text-devora-muted hover:text-devora-ink rounded-button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEditProject} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase font-semibold text-devora-muted">
                    Judul Proyek:
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-devora-background border border-devora-border rounded-button text-xs font-bold text-devora-ink focus:outline-none focus:border-devora-brand"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase font-semibold text-devora-muted">
                    Tahap / Stage Proyek:
                  </label>
                  <select
                    value={editStage}
                    onChange={(e) => setEditStage(e.target.value as ProjectStage)}
                    className="w-full px-3 py-2 bg-devora-background border border-devora-border rounded-button text-xs font-semibold text-devora-ink focus:outline-none focus:border-devora-brand"
                  >
                    <option value="IDEATION">Ideation</option>
                    <option value="PROTOTYPE">Prototype</option>
                    <option value="MVP">MVP</option>
                    <option value="PRODUCTION">Production</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase font-semibold text-devora-muted">
                    Deskripsi & Visi Proyek:
                  </label>
                  <textarea
                    rows={4}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-devora-background border border-devora-border rounded-button text-xs text-devora-ink placeholder:text-devora-muted focus:outline-none focus:border-devora-brand resize-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase font-semibold text-devora-muted">
                    Link GitHub Repository (Opsional):
                  </label>
                  <input
                    type="url"
                    value={editRepoUrl}
                    onChange={(e) => setEditRepoUrl(e.target.value)}
                    placeholder="https://github.com/username/project"
                    className="w-full px-3 py-2 bg-devora-background border border-devora-border rounded-button text-xs text-devora-ink focus:outline-none focus:border-devora-brand"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-devora-border">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditingProject(null)}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSavingEdit}
                    className="gap-1.5 bg-devora-brand text-white hover:bg-devora-brand-dark font-bold"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isSavingEdit ? "Menyimpan..." : "Simpan Perubahan"}</span>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            MODAL: DELETE PROJECT CONFIRMATION (OWNER HAPUS PROYEK)
            ════════════════════════════════════════════════════════════════ */}
        {deletingProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-devora-ink/65 backdrop-blur-sm animate-in fade-in duration-200">
            <div
              className="relative w-full max-w-sm bg-devora-surface border-2 border-red-200 rounded-container shadow-2xl p-6 space-y-4 animate-in zoom-in-95 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-devora-ink">
                  Hapus Proyek Ini?
                </h3>
                <p className="text-xs text-devora-muted leading-relaxed">
                  Proyek <span className="font-bold text-devora-ink">&ldquo;{deletingProject.title}&rdquo;</span> beserta seluruh riwayat pelamarnya akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setDeletingProject(null)}
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={isDeleting}
                  onClick={handleConfirmDeleteProject}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold"
                >
                  <span>{isDeleting ? "Menghapus..." : "Ya, Hapus Proyek"}</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            MODAL: APPLICANT PROFILE INSPECTOR (Lengkap dengan Sertifikat & Portofolio)
            ════════════════════════════════════════════════════════════════ */}
        {inspectingRequest && (
          <div
            className="fixed inset-0 z-50 bg-devora-ink/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
            onClick={() => setInspectingRequest(null)}
          >
            <div
              className="w-full max-w-2xl bg-devora-surface border-2 border-devora-border rounded-container shadow-2xl p-5 sm:p-6 space-y-5 my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-devora-border pb-4">
                <div className="flex items-start gap-3.5">
                  <Avatar
                    src={inspectingUser?.image || inspectingUser?.avatarUrl || inspectingRequest.applicantAvatarUrl}
                    fallback={inspectingRequest.applicantName.slice(0, 2).toUpperCase()}
                    size="lg"
                    className="border-2 border-devora-brand shadow-xs shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/profile/${inspectingRequest.applicantId}`}
                        className="hover:text-devora-brand transition-colors inline-flex items-center gap-1"
                      >
                        <h3 className="text-lg font-bold text-devora-ink">
                          {inspectingRequest.applicantName}
                        </h3>
                        <ExternalLink className="w-3.5 h-3.5 text-devora-brand" />
                      </Link>
                      <Badge variant="brand" className="text-[10px] font-bold py-0.5 px-2">
                        Melamar: {inspectingRequest.roleTitle}
                      </Badge>
                    </div>
                    <p className="text-xs font-semibold text-devora-brand-dark">
                      {inspectingUser?.title || inspectingRequest.applicantTitle || "Web Developer"}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-devora-muted font-medium">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-devora-brand" />
                        {inspectingUser?.location || "Indonesia"}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-devora-brand" />
                        {inspectingRequest.hoursPerWeek} jam/minggu
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setInspectingRequest(null)}
                  className="p-1.5 text-devora-muted hover:text-devora-ink rounded-button hover:bg-devora-surface-strong"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isLoadingApplicant ? (
                <div className="py-12 text-center text-xs text-devora-muted space-y-2">
                  <div className="w-6 h-6 border-2 border-devora-brand border-t-transparent rounded-full animate-spin mx-auto" />
                  <p>Memuat profil lengkap pelamar...</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
                  {/* Jam Terbang & Level Pengalaman */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="p-3 bg-devora-background rounded-button border border-devora-border space-y-1">
                      <span className="text-[10px] font-mono uppercase font-bold text-devora-muted flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-devora-brand" />
                        <span>Jam Terbang / Pengalaman:</span>
                      </span>
                      <p className="text-xs font-bold text-devora-ink">
                        {inspectingUser?.experienceYears !== undefined && inspectingUser?.experienceYears !== null
                          ? `${inspectingUser.experienceYears} Tahun Pengalaman (${inspectingUser.experienceLevel || "Developer"})`
                          : "Pengalaman Praktis / Project-Based"}
                      </p>
                    </div>

                    <div className="p-3 bg-devora-background rounded-button border border-devora-border space-y-1">
                      <span className="text-[10px] font-mono uppercase font-bold text-devora-muted flex items-center gap-1">
                        <Clock className="w-3 h-3 text-devora-brand" />
                        <span>Ritme & Ketersediaan:</span>
                      </span>
                      <p className="text-xs font-bold text-devora-ink">
                        {inspectingUser?.workStyle || "Async-First & Weekend Sprints"}
                      </p>
                    </div>
                  </div>

                  {/* Motivasi / Pitch Note Pelamar */}
                  <div className="p-3 bg-devora-brand-soft/30 border border-devora-brand/30 rounded-button space-y-1">
                    <span className="text-[10px] font-mono uppercase font-bold text-devora-brand block">
                      Pesan & Motivasi Lamaran:
                    </span>
                    <p className="text-xs text-devora-ink leading-relaxed italic">
                      &ldquo;{inspectingRequest.pitchNote}&rdquo;
                    </p>
                  </div>

                  {/* Bio Singkat */}
                  {inspectingUser?.bio && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase font-bold text-devora-muted">
                        Bio Pengembang:
                      </span>
                      <p className="text-xs text-devora-ink leading-relaxed bg-devora-background p-2.5 rounded-button border border-devora-border">
                        {inspectingUser.bio}
                      </p>
                    </div>
                  )}

                  {/* Tech Stack & Skills */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase font-bold text-devora-muted block">
                      Keahlian & Tech Stack:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(inspectingUser?.skills?.length
                        ? inspectingUser.skills
                        : inspectingRequest.skills
                      ).map((skill, i) => (
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

                  {/* Sertifikat Pelamar */}
                  {inspectingUser?.certificates && inspectingUser.certificates.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-devora-border">
                      <div className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-[10px] font-mono uppercase font-bold text-devora-ink">
                          Sertifikasi Terverifikasi ({inspectingUser.certificates.length}):
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {inspectingUser.certificates.map((cert) => (
                          <div
                            key={cert.id}
                            className="p-2.5 bg-devora-background border border-devora-border rounded-button flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {cert.fileUrl ? (
                                <img
                                  src={cert.fileUrl}
                                  alt={cert.title}
                                  className="w-8 h-8 rounded object-cover border border-devora-border shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                                  <Award className="w-4 h-4" />
                                </div>
                              )}
                              <div className="space-y-0.5 min-w-0">
                                <p className="text-xs font-bold text-devora-ink truncate">{cert.title}</p>
                                <p className="text-[10px] text-devora-muted truncate">
                                  {cert.issuer} {cert.issueDate && `• ${cert.issueDate}`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {cert.fileUrl && (
                                <a
                                  href={cert.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1 text-amber-600 hover:text-amber-700 font-bold"
                                  title="Lihat Sertifikat"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {cert.credentialUrl && (
                                <a
                                  href={cert.credentialUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1 text-devora-brand hover:underline"
                                  title="Buka Kredensial Online"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Portofolio Proyek Pelamar */}
                  {inspectingUser?.portfolios && inspectingUser.portfolios.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-devora-border">
                      <div className="flex items-center gap-1.5">
                        <FolderGit2 className="w-3.5 h-3.5 text-devora-brand" />
                        <span className="text-[10px] font-mono uppercase font-bold text-devora-ink">
                          Showcase Portofolio Proyek ({inspectingUser.portfolios.length}):
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {inspectingUser.portfolios.map((proj) => (
                          <div
                            key={proj.id}
                            className="p-3 bg-devora-background border border-devora-border rounded-container space-y-1.5 flex flex-col justify-between"
                          >
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-devora-ink">{proj.title}</p>
                              {proj.description && (
                                <p className="text-[11px] text-devora-muted line-clamp-2 leading-relaxed">
                                  {proj.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 pt-1 border-t border-devora-border/50 text-[11px]">
                              {proj.liveUrl && (
                                <a
                                  href={proj.liveUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-devora-brand font-bold hover:underline inline-flex items-center gap-1"
                                >
                                  <ExternalLink className="w-2.5 h-2.5" />
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
                                  <GitBranch className="w-2.5 h-2.5" />
                                  <span>GitHub</span>
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Footer Modal Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t border-devora-border">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleRejectApplicant(inspectingRequest)}
                  className="text-xs text-red-600 hover:bg-red-500/10 border-red-200 gap-1 font-semibold justify-center order-3 sm:order-1"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>Tolak Lamaran</span>
                </Button>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 order-1 sm:order-2">
                  <Link href={`/messages?userId=${inspectingRequest.applicantId}`} className="flex-1 sm:flex-initial">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="w-full sm:w-auto text-xs font-bold gap-1 bg-devora-surface border-devora-border hover:border-devora-ink text-devora-ink justify-center"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat Langsung</span>
                    </Button>
                  </Link>

                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleAcceptApplicant(inspectingRequest)}
                    className="flex-1 sm:flex-initial text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 shadow-md justify-center"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Terima Partner (ACC)</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
