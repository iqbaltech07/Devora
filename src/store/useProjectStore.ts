import { create } from "zustand";
import { Project, ProjectRole, ProjectMilestone, ProjectStage, JoinRequest } from "./types";
import { getSocket } from "@/lib/socket";

interface ProjectFilterState {
  searchQuery: string;
  stage: ProjectStage | null;
  selectedSkills: string[];
  minHoursPerWeek: number | null;
  selectedGoal: string | null;
}

export const DEFAULT_FILTERS: ProjectFilterState = {
  searchQuery: "",
  stage: null,
  selectedSkills: [],
  minHoursPerWeek: null,
  selectedGoal: null,
};

export interface ExpressedInterest {
  projectId: string;
  roleTitle: string;
  pitchNote?: string;
  sentAt: string;
}

interface ProjectState {
  projects: Project[];
  selectedProjectId: string | null;
  draftProject: Partial<Project>;
  filters: ProjectFilterState;
  bookmarkedProjectIds: string[];
  expressedInterests: ExpressedInterest[];
  joinRequests: JoinRequest[];
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: number;
  fetchProjects: (force?: boolean) => Promise<void>;
  createProjectAsync: (project: Omit<Project, "id" | "createdAt">) => Promise<Project>;
  updateProjectAsync: (projectId: string, data: Partial<Project>) => Promise<Project | null>;
  deleteProjectAsync: (projectId: string) => Promise<boolean>;
  toggleProjectRecruitment: (projectId: string, isRecruiting: boolean) => Promise<void>;
  addProject: (project: Omit<Project, "id" | "createdAt">) => void;
  selectProject: (id: string | null) => void;
  updateDraft: (draft: Partial<Project>) => void;
  resetDraft: () => void;
  setFilters: (filters: Partial<ProjectFilterState>) => void;
  toggleSkillFilter: (skill: string) => void;
  clearFilters: () => void;
  toggleBookmarkProject: (projectId: string) => void;
  expressInterest: (projectId: string, roleTitle: string, pitchNote?: string) => Promise<void>;
  cancelJoinRequest: (requestId: string) => Promise<void>;
  editJoinRequest: (requestId: string, roleTitle: string, pitchNote: string) => Promise<void>;
  acceptJoinRequest: (requestId: string) => Promise<void>;
  rejectJoinRequest: (requestId: string) => Promise<void>;
  addRoleToDraft: (role: Omit<ProjectRole, "id">) => void;
  removeRoleFromDraft: (roleId: string) => void;
  addStackToDraftRole: (roleId: string, stackTag: string) => void;
  removeStackFromDraftRole: (roleId: string, stackTag: string) => void;
  updateRoleCommitment: (roleId: string, hours: number) => void;
  updateRoleResponsibility: (
    roleId: string,
    responsibilityLevel: ProjectRole["responsibilityLevel"]
  ) => void;
  updateRoleUrgency: (roleId: string, urgency: ProjectRole["urgency"]) => void;
  addMilestoneToDraft: (milestone: Omit<ProjectMilestone, "id">) => void;
  removeMilestoneFromDraft: (milestoneId: string) => void;
  cycleMilestoneStatus: (milestoneId: string) => void;
}

export const INITIAL_PROJECTS: Project[] = [];
export const INITIAL_JOIN_REQUESTS: JoinRequest[] = [];

let projFetchPromise: Promise<void> | null = null;

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: INITIAL_PROJECTS,
  selectedProjectId: null,
  draftProject: {
    title: "",
    description: "",
    stage: "MVP",
    roles: [],
    roadmap: [],
    tags: [],
  },
  filters: {
    searchQuery: "",
    stage: null,
    selectedSkills: [],
    minHoursPerWeek: null,
    selectedGoal: null,
  },
  bookmarkedProjectIds: [],
  expressedInterests: [],
  joinRequests: INITIAL_JOIN_REQUESTS,
  isLoading: false,
  error: null,
  lastFetchedAt: 0,

  fetchProjects: async (force = false) => {
    const now = Date.now();
    if (!force && now - get().lastFetchedAt < 15000 && get().projects.length > 0) {
      return;
    }

    if (projFetchPromise) {
      return projFetchPromise;
    }

    projFetchPromise = (async () => {
      set({ isLoading: true, error: null });
      try {
        const [projRes, reqRes] = await Promise.all([
          fetch(`/api/projects`),
          fetch(`/api/projects/requests`),
        ]);

        if (!projRes.ok) throw new Error("Failed to fetch projects");
        const projectsData = await projRes.json();

        let requestsData: JoinRequest[] = [];
        if (reqRes.ok) {
          requestsData = await reqRes.json();
        }

        const uniqueProjects = Array.from(
          new Map((Array.isArray(projectsData) ? projectsData : []).map((p: any) => [p.id, p])).values()
        );
        const uniqueRequests = Array.from(
          new Map((Array.isArray(requestsData) ? requestsData : []).map((r: any) => [r.id, r])).values()
        );

        set({
          projects: uniqueProjects,
          joinRequests: uniqueRequests,
          lastFetchedAt: Date.now(),
          isLoading: false,
        });
      } catch (err: any) {
        set({ error: err.message, isLoading: false });
      } finally {
        projFetchPromise = null;
      }
    })();

    return projFetchPromise;
  },

  createProjectAsync: async (projectData) => {
    const tempId = `temp-proj-${Date.now()}`;
    const optimisticProject: Project = {
      ...projectData,
      id: tempId,
      createdAt: new Date().toISOString(),
    };

    // 1. OPTIMISTIC UPDATE: Instantly show new project in UI (0ms delay)
    set((state) => ({
      projects: [optimisticProject, ...state.projects.filter((p) => p.id !== tempId)],
      isLoading: false,
      error: null,
    }));

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error || "Failed to create project");
      }
      const data: Project = await res.json();
      
      // Replace optimistic project with server persistent project (ensuring unique ID)
      set((state) => {
        const cleaned = state.projects.filter((p) => p.id !== tempId && p.id !== data.id);
        return {
          projects: [data, ...cleaned],
        };
      });
      return data;
    } catch (err: any) {
      // Rollback optimistic project on error
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== tempId),
        error: err.message,
      }));
      throw err;
    }
  },
  addProject: (newProj) =>
    set((state) => ({
      projects: [
        {
          ...newProj,
          id: `proj-${Date.now()}`,
          createdAt: new Date().toISOString(),
        },
        ...state.projects,
      ],
    })),
  selectProject: (id) => set({ selectedProjectId: id }),
  updateDraft: (draft) =>
    set((state) => ({
      draftProject: { ...state.draftProject, ...draft },
    })),
  resetDraft: () =>
    set({
      draftProject: {
        title: "",
        description: "",
        stage: "MVP",
        roles: [],
        roadmap: [],
        tags: [],
      },
    }),
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
  toggleSkillFilter: (skill) =>
    set((state) => {
      const exists = state.filters.selectedSkills.includes(skill);
      const updated = exists
        ? state.filters.selectedSkills.filter((s) => s !== skill)
        : [...state.filters.selectedSkills, skill];
      return {
        filters: { ...state.filters, selectedSkills: updated },
      };
    }),
  clearFilters: () => set({ filters: DEFAULT_FILTERS }),
  toggleBookmarkProject: (projectId) =>
    set((state) => {
      const isBookmarked = state.bookmarkedProjectIds.includes(projectId);
      return {
        bookmarkedProjectIds: isBookmarked
          ? state.bookmarkedProjectIds.filter((id) => id !== projectId)
          : [...state.bookmarkedProjectIds, projectId],
      };
    }),
  expressInterest: async (projectId, roleTitle, pitchNote) => {
    const tempId = `temp-req-${Date.now()}`;
    const optimisticReq: JoinRequest = {
      id: tempId,
      projectId,
      projectTitle: "Project Opportunity",
      applicantId: "me",
      applicantName: "Developer",
      applicantTitle: "Software Engineer",
      roleTitle,
      skills: [],
      hoursPerWeek: 5,
      pitchNote: pitchNote || "",
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };

    // 1. OPTIMISTIC UPDATE (0ms latency feedback)
    set((state) => ({
      joinRequests: [optimisticReq, ...state.joinRequests],
      expressedInterests: [
        ...state.expressedInterests,
        { projectId, roleTitle, pitchNote, sentAt: new Date().toISOString() },
      ],
    }));

    try {
      const res = await fetch("/api/projects/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "APPLY", projectId, roleTitle, pitchNote }),
      });
      if (!res.ok) throw new Error("Failed to apply");
      const realReq: JoinRequest = await res.json();

      set((state) => ({
        joinRequests: state.joinRequests.map((r) => (r.id === tempId ? realReq : r)),
      }));

      // Emit real-time project application notification
      try {
        const socket = getSocket();
        if (socket) {
          socket.emit("send_project_apply", {
            applicantId: realReq.applicantId,
            applicantName: realReq.applicantName,
            applicantAvatar: realReq.applicantAvatarUrl,
            applicantRole: realReq.applicantTitle,
            projectTitle: realReq.projectTitle,
            roleTitle: realReq.roleTitle,
          });
        }
      } catch (err) {
        console.warn("Socket send_project_apply emit error:", err);
      }
    } catch (error) {
      console.error("expressInterest error, rolling back:", error);
      // Rollback
      set((state) => ({
        joinRequests: state.joinRequests.filter((r) => r.id !== tempId),
        expressedInterests: state.expressedInterests.filter(
          (ei) => !(ei.projectId === projectId && ei.roleTitle === roleTitle)
        ),
      }));
    }
  },
  acceptJoinRequest: async (requestId) => {
    // 1. OPTIMISTIC UPDATE: Instantly change status to ACCEPTED
    const prevRequests = get().joinRequests;
    const targetReq = prevRequests.find((r) => r.id === requestId);

    set((state) => ({
      joinRequests: state.joinRequests.map((req) =>
        req.id === requestId ? { ...req, status: "ACCEPTED" } : req
      ),
    }));

    try {
      const res = await fetch("/api/projects/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESPOND", requestId, status: "ACCEPTED" }),
      });
      if (!res.ok) throw new Error("Failed to accept request");

      // Emit real-time project ACC notification to applicant
      try {
        const socket = getSocket();
        if (socket && targetReq) {
          socket.emit("send_project_acc", {
            applicantId: targetReq.applicantId,
            projectTitle: targetReq.projectTitle,
            roleTitle: targetReq.roleTitle,
          });
        }
      } catch (err) {
        console.warn("Socket send_project_acc emit error:", err);
      }
    } catch (error) {
      console.error("acceptJoinRequest error, rolling back:", error);
      // Rollback to previous state
      set({ joinRequests: prevRequests });
    }
  },
  rejectJoinRequest: async (requestId) => {
    // 1. OPTIMISTIC UPDATE: Instantly change status to REJECTED
    const prevRequests = get().joinRequests;
    set((state) => ({
      joinRequests: state.joinRequests.map((req) =>
        req.id === requestId ? { ...req, status: "REJECTED" } : req
      ),
    }));

    try {
      const res = await fetch("/api/projects/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESPOND", requestId, status: "REJECTED" }),
      });
      if (!res.ok) throw new Error("Failed to reject request");
    } catch (error) {
      console.error("rejectJoinRequest error, rolling back:", error);
      set({ joinRequests: prevRequests });
    }
  },
  cancelJoinRequest: async (requestId) => {
    const prevRequests = get().joinRequests;
    // OPTIMISTIC: remove from joinRequests list
    set((state) => ({
      joinRequests: state.joinRequests.filter((req) => req.id !== requestId),
    }));

    try {
      const res = await fetch("/api/projects/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CANCEL", requestId }),
      });
      if (!res.ok) throw new Error("Failed to cancel join request");
    } catch (error) {
      console.error("cancelJoinRequest error, rolling back:", error);
      set({ joinRequests: prevRequests });
      throw error;
    }
  },
  editJoinRequest: async (requestId, roleTitle, pitchNote) => {
    const prevRequests = get().joinRequests;
    // OPTIMISTIC UPDATE
    set((state) => ({
      joinRequests: state.joinRequests.map((req) =>
        req.id === requestId ? { ...req, roleTitle, pitchNote } : req
      ),
    }));

    try {
      const res = await fetch("/api/projects/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "EDIT", requestId, roleTitle, pitchNote }),
      });
      if (!res.ok) throw new Error("Failed to edit join request");
      const updatedReq = await res.json();
      set((state) => ({
        joinRequests: state.joinRequests.map((req) =>
          req.id === requestId ? updatedReq : req
        ),
      }));
    } catch (error) {
      console.error("editJoinRequest error, rolling back:", error);
      set({ joinRequests: prevRequests });
      throw error;
    }
  },
  toggleProjectRecruitment: async (projectId, isRecruiting) => {
    const prevProjects = get().projects;
    // OPTIMISTIC UPDATE
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id !== projectId) return p;
        const currentTags = p.tags || [];
        let updatedTags = [...currentTags];
        if (!isRecruiting) {
          if (!updatedTags.includes("RECRUITMENT_CLOSED")) updatedTags.push("RECRUITMENT_CLOSED");
        } else {
          updatedTags = updatedTags.filter((t) => t !== "RECRUITMENT_CLOSED");
        }
        return { ...p, isRecruiting, tags: updatedTags };
      }),
    }));

    try {
      const res = await fetch("/api/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: projectId, isRecruiting }),
      });
      if (!res.ok) throw new Error("Failed to update project recruitment status");
      const updated = await res.json();
      set((state) => ({
        projects: state.projects.map((p) => (p.id === projectId ? updated : p)),
      }));
    } catch (error) {
      console.error("toggleProjectRecruitment error, rolling back:", error);
      set({ projects: prevProjects });
      throw error;
    }
  },
  updateProjectAsync: async (projectId, data) => {
    const prevProjects = get().projects;
    // Optimistic update
    set((state) => ({
      projects: state.projects.map((p) => (p.id === projectId ? { ...p, ...data } : p)),
    }));

    try {
      const res = await fetch("/api/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: projectId, ...data }),
      });
      if (!res.ok) throw new Error("Failed to update project");
      const updated = await res.json();
      set((state) => ({
        projects: state.projects.map((p) => (p.id === projectId ? updated : p)),
      }));
      return updated;
    } catch (error) {
      console.error("updateProjectAsync error, rolling back:", error);
      set({ projects: prevProjects });
      return null;
    }
  },
  deleteProjectAsync: async (projectId) => {
    const prevProjects = get().projects;
    // Optimistic update
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== projectId),
    }));

    try {
      const res = await fetch(`/api/projects?id=${projectId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete project");
      return true;
    } catch (error) {
      console.error("deleteProjectAsync error, rolling back:", error);
      set({ projects: prevProjects });
      return false;
    }
  },
  addRoleToDraft: (role) =>
    set((state) => {
      const currentRoles = state.draftProject.roles || [];
      const newRole: ProjectRole = {
        ...role,
        id: `role-${Date.now()}`,
        responsibilityLevel: role.responsibilityLevel || "CORE_BUILDER",
        urgency: role.urgency || "IMMEDIATE",
      };
      return {
        draftProject: {
          ...state.draftProject,
          roles: [...currentRoles, newRole],
        },
      };
    }),
  removeRoleFromDraft: (roleId) =>
    set((state) => {
      const currentRoles = state.draftProject.roles || [];
      return {
        draftProject: {
          ...state.draftProject,
          roles: currentRoles.filter((r) => r.id !== roleId),
        },
      };
    }),
  addStackToDraftRole: (roleId, stackTag) =>
    set((state) => {
      const currentRoles = state.draftProject.roles || [];
      const updated = currentRoles.map((role) => {
        if (role.id === roleId && !role.requiredSkills.includes(stackTag)) {
          return {
            ...role,
            requiredSkills: [...role.requiredSkills, stackTag],
          };
        }
        return role;
      });
      return {
        draftProject: {
          ...state.draftProject,
          roles: updated,
        },
      };
    }),
  removeStackFromDraftRole: (roleId, stackTag) =>
    set((state) => {
      const currentRoles = state.draftProject.roles || [];
      const updated = currentRoles.map((role) => {
        if (role.id === roleId) {
          return {
            ...role,
            requiredSkills: role.requiredSkills.filter((s) => s !== stackTag),
          };
        }
        return role;
      });
      return {
        draftProject: {
          ...state.draftProject,
          roles: updated,
        },
      };
    }),
  updateRoleCommitment: (roleId, hours) =>
    set((state) => {
      const currentRoles = state.draftProject.roles || [];
      const updated = currentRoles.map((r) =>
        r.id === roleId ? { ...r, hoursPerWeek: hours } : r
      );
      return {
        draftProject: {
          ...state.draftProject,
          roles: updated,
        },
      };
    }),
  updateRoleResponsibility: (roleId, responsibilityLevel) =>
    set((state) => {
      const currentRoles = state.draftProject.roles || [];
      const updated = currentRoles.map((r) =>
        r.id === roleId ? { ...r, responsibilityLevel } : r
      );
      return {
        draftProject: {
          ...state.draftProject,
          roles: updated,
        },
      };
    }),
  updateRoleUrgency: (roleId, urgency) =>
    set((state) => {
      const currentRoles = state.draftProject.roles || [];
      const updated = currentRoles.map((r) =>
        r.id === roleId ? { ...r, urgency } : r
      );
      return {
        draftProject: {
          ...state.draftProject,
          roles: updated,
        },
      };
    }),
  addMilestoneToDraft: (milestone) =>
    set((state) => {
      const currentRoadmap = state.draftProject.roadmap || [];
      const newMilestone: ProjectMilestone = {
        ...milestone,
        id: `milestone-${Date.now()}`,
      };
      return {
        draftProject: {
          ...state.draftProject,
          roadmap: [...currentRoadmap, newMilestone],
        },
      };
    }),
  removeMilestoneFromDraft: (milestoneId) =>
    set((state) => {
      const currentRoadmap = state.draftProject.roadmap || [];
      return {
        draftProject: {
          ...state.draftProject,
          roadmap: currentRoadmap.filter((m) => m.id !== milestoneId),
        },
      };
    }),
  cycleMilestoneStatus: (milestoneId) =>
    set((state) => {
      const currentRoadmap = state.draftProject.roadmap || [];
      const cycleMap: Record<ProjectMilestone["status"], ProjectMilestone["status"]> = {
        UPCOMING: "IN_PROGRESS",
        IN_PROGRESS: "COMPLETED",
        COMPLETED: "UPCOMING",
      };
      const updated = currentRoadmap.map((m) =>
        m.id === milestoneId ? { ...m, status: cycleMap[m.status] } : m
      );
      return {
        draftProject: {
          ...state.draftProject,
          roadmap: updated,
        },
      };
    }),
}));
