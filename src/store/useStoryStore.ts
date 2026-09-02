import { create } from "zustand";

export interface StoryViewerItem {
  id: string;
  name: string;
  avatarUrl?: string;
  title?: string;
  viewedAt: string;
}

export interface StoryItem {
  id: string;
  mediaUrl?: string | null;
  caption?: string | null;
  createdAt: string;
  expiresAt: string;
  viewsCount?: number;
  isViewed?: boolean;
  viewers?: StoryViewerItem[];
}

export interface UserStoryGroup {
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
    title: string;
    isMe: boolean;
  };
  hasUnviewed?: boolean;
  stories: StoryItem[];
}

interface StoryState {
  storyGroups: UserStoryGroup[];
  activeGroupIndex: number | null;
  activeStoryIndex: number;
  isLoading: boolean;
  isSubmitting: boolean;

  fetchStories: () => Promise<void>;
  createStory: (mediaUrl?: string, caption?: string) => Promise<boolean>;
  recordView: (storyId: string) => Promise<void>;
  replyStory: (storyId: string, message: string) => Promise<{ success: boolean; receiverId?: string }>;
  openStoryModal: (groupIndex: number, storyIndex?: number) => void;
  closeStoryModal: () => void;
  nextStory: () => void;
  prevStory: () => void;
}

export const useStoryStore = create<StoryState>((set, get) => ({
  storyGroups: [],
  activeGroupIndex: null,
  activeStoryIndex: 0,
  isLoading: false,
  isSubmitting: false,

  fetchStories: async () => {
    try {
      set({ isLoading: true });
      const res = await fetch("/api/stories");
      if (!res.ok) return;
      const data = await res.json();
      set({ storyGroups: data || [], isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createStory: async (mediaUrl, caption) => {
    try {
      set({ isSubmitting: true });
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaUrl, caption }),
      });
      if (!res.ok) return false;
      await get().fetchStories();
      set({ isSubmitting: false });
      return true;
    } catch {
      set({ isSubmitting: false });
      return false;
    }
  },

  recordView: async (storyId: string) => {
    try {
      await fetch(`/api/stories/${storyId}/view`, { method: "POST" });
    } catch {
      // ignore
    }
  },

  replyStory: async (storyId: string, message: string) => {
    try {
      const res = await fetch(`/api/stories/${storyId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) return { success: false };
      const data = await res.json();
      return { success: true, receiverId: data.receiverId };
    } catch {
      return { success: false };
    }
  },

  openStoryModal: (groupIndex, storyIndex = 0) => {
    set({
      activeGroupIndex: groupIndex,
      activeStoryIndex: storyIndex,
    });
  },

  closeStoryModal: () => {
    set({
      activeGroupIndex: null,
      activeStoryIndex: 0,
    });
  },

  nextStory: () => {
    const { storyGroups, activeGroupIndex, activeStoryIndex } = get();
    if (activeGroupIndex === null) return;

    const currentGroup = storyGroups[activeGroupIndex];
    if (!currentGroup) return;

    if (activeStoryIndex < currentGroup.stories.length - 1) {
      set({ activeStoryIndex: activeStoryIndex + 1 });
    } else if (activeGroupIndex < storyGroups.length - 1) {
      set({
        activeGroupIndex: activeGroupIndex + 1,
        activeStoryIndex: 0,
      });
    } else {
      get().closeStoryModal();
    }
  },

  prevStory: () => {
    const { storyGroups, activeGroupIndex, activeStoryIndex } = get();
    if (activeGroupIndex === null) return;

    if (activeStoryIndex > 0) {
      set({ activeStoryIndex: activeStoryIndex - 1 });
    } else if (activeGroupIndex > 0) {
      const prevGroup = storyGroups[activeGroupIndex - 1];
      set({
        activeGroupIndex: activeGroupIndex - 1,
        activeStoryIndex: prevGroup.stories.length - 1,
      });
    }
  },
}));
