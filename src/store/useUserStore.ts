import { create } from "zustand";
import { UserProfile, GitAccount, GitRepository, SkillItem } from "./types";

interface UserState {
  currentUser: UserProfile;
  isAuthenticated: boolean;
  isSyncing: boolean;
  preferences: {
    notifications: boolean;
    asyncFirstOnly: boolean;
    minHoursPerWeek: number;
  };
  isLoadingProfile: boolean;
  login: (profile?: Partial<UserProfile>) => void;
  logout: () => void;
  fetchProfile: (force?: boolean) => Promise<void>;
  updateProfileApi: (profile: Partial<UserProfile>) => Promise<boolean>;
  setProfile: (profile: Partial<UserProfile>) => void;
  updateSkills: (skills: string[]) => void;
  updateAvailability: (hrs: number) => void;
  updateTimezone: (timezone: string, location: string) => void;
  updateWorkingRhythm: (rhythm: string) => void;
  toggleGoal: (goal: string) => void;
  setWorkStyle: (style: string) => void;
  updatePreferences: (prefs: Partial<UserState["preferences"]>) => void;
  connectGitAccount: (provider: "github" | "gitlab", username: string) => void;
  disconnectGitAccount: (provider: "github" | "gitlab") => void;
  syncGitAccount: (provider: "github" | "gitlab") => void;
  toggleRepoEvidence: (repoId: string) => void;
  addSkillItem: (
    name: string,
    category: SkillItem["category"],
    proficiency: SkillItem["proficiency"]
  ) => void;
  removeSkillItem: (id: string) => void;
  updateSkillProficiency: (id: string, proficiency: SkillItem["proficiency"]) => void;
}

export const BLANK_USER: UserProfile = {
  id: "",
  name: "",
  email: "",
  title: "",
  bio: "",
  location: "",
  timezone: "",
  skills: [],
  skillMatrix: [],
  techStack: [],
  availabilityHrs: 0,
  goals: [],
  workStyle: "",
  githubUrl: "",
  githubUsername: "",
  image: "",
  avatarUrl: "",
  onboarded: false,
  gitAccounts: [],
  experienceYears: undefined,
  experienceLevel: undefined,
  workPreference: undefined,
  flexibleHours: true,
  availableDays: [],
  portfolioUrl: "",
  linkedinUrl: "",
  websiteUrl: "",
  profileCompleteness: 0,
};

export const useUserStore = create<UserState>((set, get) => ({
  currentUser: BLANK_USER,
  isAuthenticated: false,
  isSyncing: false,
  isLoadingProfile: false,
  preferences: {
    notifications: true,
    asyncFirstOnly: true,
    minHoursPerWeek: 5,
  },
  login: (profile) =>
    set((state) => ({
      isAuthenticated: true,
      currentUser: profile ? { ...state.currentUser, ...profile } : state.currentUser,
    })),
  logout: () =>
    set({
      isAuthenticated: false,
      currentUser: BLANK_USER,
    }),
  fetchProfile: async (force = false) => {
    if (!force && get().isAuthenticated && get().currentUser?.id) {
      return;
    }
    set({ isLoadingProfile: true });
    try {
      const res = await fetch("/api/users/me");
      if (res.ok) {
        const data = await res.json();
        set((state) => ({
          isAuthenticated: true,
          currentUser: {
            ...state.currentUser,
            id: data.id,
            name: data.name,
            email: data.email,
            title: data.title || "",
            bio: data.bio || "",
            location: data.location || "",
            timezone: data.timezone || "",
            image: data.image || "",
            avatarUrl: data.image || "",
            githubUsername: data.githubUsername || "",
            githubUrl: data.githubUrl || (data.githubUsername ? `https://github.com/${data.githubUsername}` : ""),
            skills: data.tags || data.primaryStack || [],
            techStack: data.primaryStack || data.tags || [],
            availabilityHrs: data.availabilityHrs ?? 0,
            workStyle: data.workStyle || "",
            goals: Array.isArray(data.goals) && data.goals.length > 0
              ? data.goals
              : data.projectGoal
              ? data.projectGoal.split(",").map((g: string) => g.trim()).filter(Boolean)
              : [],
            onboarded: data.onboarded ?? false,
            gitAccounts: data.gitAccounts || [],
            experienceYears: data.experienceYears !== undefined && data.experienceYears !== null ? Number(data.experienceYears) : undefined,
            experienceLevel: data.experienceLevel || undefined,
            workPreference: data.workPreference || undefined,
            flexibleHours: data.flexibleHours ?? true,
            availableDays: Array.isArray(data.availableDays) ? data.availableDays : [],
            portfolioUrl: data.portfolioUrl || "",
            linkedinUrl: data.linkedinUrl || "",
            websiteUrl: data.websiteUrl || "",
            profileCompleteness: typeof data.profileCompleteness === "number" ? data.profileCompleteness : 0,
          },
        }));
      } else {
        set({ isAuthenticated: false, currentUser: BLANK_USER });
      }
    } catch (err) {
      console.error("fetchProfile error:", err);
      set({ isAuthenticated: false, currentUser: BLANK_USER });
    } finally {
      set({ isLoadingProfile: false });
    }
  },
  updateProfileApi: async (profileUpdates) => {
    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profileUpdates,
          tags: profileUpdates.skills || profileUpdates.techStack,
          primaryStack: profileUpdates.techStack || profileUpdates.skills,
          skills: profileUpdates.skills || profileUpdates.techStack,
          goals: profileUpdates.goals,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        set((state) => ({
          currentUser: {
            ...state.currentUser,
            ...profileUpdates,
            id: data.id || state.currentUser.id,
            name: data.name ?? state.currentUser.name,
            title: data.title ?? state.currentUser.title,
            bio: data.bio ?? state.currentUser.bio,
            location: data.location ?? state.currentUser.location,
            timezone: data.timezone ?? state.currentUser.timezone,
            image: data.image ?? state.currentUser.image,
            avatarUrl: data.image ?? state.currentUser.avatarUrl,
            experienceYears: data.experienceYears !== undefined && data.experienceYears !== null ? Number(data.experienceYears) : state.currentUser.experienceYears,
            experienceLevel: data.experienceLevel ?? state.currentUser.experienceLevel,
            workPreference: data.workPreference ?? state.currentUser.workPreference,
            flexibleHours: data.flexibleHours ?? state.currentUser.flexibleHours,
            availableDays: data.availableDays ?? state.currentUser.availableDays,
            portfolioUrl: data.portfolioUrl ?? state.currentUser.portfolioUrl,
            linkedinUrl: data.linkedinUrl ?? state.currentUser.linkedinUrl,
            websiteUrl: data.websiteUrl ?? state.currentUser.websiteUrl,
            onboarded: data.onboarded ?? state.currentUser.onboarded,
            profileCompleteness: typeof data.profileCompleteness === "number" ? data.profileCompleteness : state.currentUser.profileCompleteness,
          },
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to update profile:", err);
      return false;
    }
  },
  setProfile: (profile) =>
    set((state) => ({
      currentUser: { ...state.currentUser, ...profile },
    })),
  updateSkills: (skills) =>
    set((state) => ({
      currentUser: { ...state.currentUser, skills },
    })),
  updateAvailability: (availabilityHrs) =>
    set((state) => ({
      currentUser: { ...state.currentUser, availabilityHrs },
    })),
  updateTimezone: (timezone, location) =>
    set((state) => ({
      currentUser: { ...state.currentUser, timezone, location },
    })),
  updateWorkingRhythm: (rhythm) =>
    set((state) => ({
      currentUser: { ...state.currentUser, workStyle: rhythm },
    })),
  toggleGoal: (goal) =>
    set((state) => {
      const currentGoals = state.currentUser.goals || [];
      const updatedGoals = currentGoals.includes(goal)
        ? currentGoals.filter((g) => g !== goal)
        : [...currentGoals, goal];
      return {
        currentUser: { ...state.currentUser, goals: updatedGoals },
      };
    }),
  setWorkStyle: (workStyle) =>
    set((state) => ({
      currentUser: { ...state.currentUser, workStyle },
    })),
  updatePreferences: (prefs) =>
    set((state) => ({
      preferences: { ...state.preferences, ...prefs },
    })),
  connectGitAccount: (provider, username) =>
    set((state) => {
      const currentAccounts = state.currentUser.gitAccounts || [];
      const updated = currentAccounts.map((acc) =>
        acc.provider === provider
          ? {
              ...acc,
              connected: true,
              username,
              profileUrl: `https://${provider}.com/${username}`,
              lastSyncedAt: new Date().toISOString(),
              totalRepos: acc.repositories.length || 0,
              repositories: acc.repositories.length ? acc.repositories : [],
            }
          : acc
      );
      return {
        currentUser: { ...state.currentUser, gitAccounts: updated },
      };
    }),
  disconnectGitAccount: (provider) =>
    set((state) => {
      const currentAccounts = state.currentUser.gitAccounts || [];
      const updated = currentAccounts.map((acc) =>
        acc.provider === provider
          ? {
              provider,
              connected: false,
              repositories: [],
            }
          : acc
      );
      return {
        currentUser: { ...state.currentUser, gitAccounts: updated },
      };
    }),
  syncGitAccount: (provider) => {
    set({ isSyncing: true });
    setTimeout(() => {
      set((state) => {
        const currentAccounts = state.currentUser.gitAccounts || [];
        const updated = currentAccounts.map((acc) =>
          acc.provider === provider
            ? {
                ...acc,
                lastSyncedAt: new Date().toISOString(),
              }
            : acc
        );
        return {
          isSyncing: false,
          currentUser: { ...state.currentUser, gitAccounts: updated },
        };
      });
    }, 600);
  },
  toggleRepoEvidence: (repoId) =>
    set((state) => {
      const currentAccounts = state.currentUser.gitAccounts || [];
      const updated = currentAccounts.map((acc) => ({
        ...acc,
        repositories: acc.repositories.map((repo) =>
          repo.id === repoId ? { ...repo, isEvidence: !repo.isEvidence } : repo
        ),
      }));
      return {
        currentUser: { ...state.currentUser, gitAccounts: updated },
      };
    }),
  addSkillItem: (name, category, proficiency) =>
    set((state) => {
      const currentMatrix = state.currentUser.skillMatrix || [];
      const newSkill: SkillItem = {
        id: `skill-${Date.now()}`,
        name: name.trim(),
        category,
        proficiency,
        yearsOfExperience: proficiency === "Senior" ? 5 : proficiency === "Mid" ? 3 : 1,
      };
      const updatedMatrix = [...currentMatrix, newSkill];
      const updatedTags = Array.from(
        new Set([...state.currentUser.skills, newSkill.name])
      );
      return {
        currentUser: {
          ...state.currentUser,
          skillMatrix: updatedMatrix,
          skills: updatedTags,
        },
      };
    }),
  removeSkillItem: (id) =>
    set((state) => {
      const currentMatrix = state.currentUser.skillMatrix || [];
      const target = currentMatrix.find((s) => s.id === id);
      const updatedMatrix = currentMatrix.filter((s) => s.id !== id);
      const updatedTags = target
        ? state.currentUser.skills.filter((s) => s !== target.name)
        : state.currentUser.skills;
      return {
        currentUser: {
          ...state.currentUser,
          skillMatrix: updatedMatrix,
          skills: updatedTags,
        },
      };
    }),
  updateSkillProficiency: (id, proficiency) =>
    set((state) => {
      const currentMatrix = state.currentUser.skillMatrix || [];
      const updatedMatrix = currentMatrix.map((s) =>
        s.id === id ? { ...s, proficiency } : s
      );
      return {
        currentUser: {
          ...state.currentUser,
          skillMatrix: updatedMatrix,
        },
      };
    }),
}));
