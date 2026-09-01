import { create } from "zustand";
import { CandidatePartner, CompatibilityResult } from "./types";

export const CANDIDATES_DATA: CandidatePartner[] = [];

export const INITIAL_MATCHES: CompatibilityResult[] = [];

interface MatchState {
  candidates: CandidatePartner[];
  swipedIds: string[];
  matchedCandidates: CandidatePartner[];
  incomingLikes: CandidatePartner[];
  passedIds: string[];
  lastAction: { type: "LIKE" | "PASS"; candidateId: string } | null;
  inspectingCandidate: CandidatePartner | null;
  latestMatchedCandidate: CandidatePartner | null;
  showMatchCelebration: boolean;
  matches: CompatibilityResult[];
  selectedMatchId: string | null;
  isLoadingMatches: boolean;
  isLoadingCandidates: boolean;
  isLoadingIncomingLikes: boolean;
  isResettingDeck: boolean;

  // Actions
  swipeLeft: (candidateId: string) => void;
  swipeRight: (candidateId: string) => void;
  acceptIncomingLike: (candidateId: string) => Promise<void>;
  passIncomingLike: (candidateId: string) => Promise<void>;
  undoSwipe: () => void;
  resetDeck: () => Promise<void>;
  setInspectingCandidate: (candidate: CandidatePartner | null) => void;
  closeMatchCelebration: () => void;
  selectMatch: (id: string | null) => void;
  
  // Async Data Fetching
  fetchCandidates: (force?: boolean) => Promise<void>;
  fetchMatches: (force?: boolean) => Promise<void>;
  fetchIncomingLikes: (force?: boolean) => Promise<void>;
}

export const useMatchStore = create<MatchState>((set, get) => ({
  candidates: CANDIDATES_DATA,
  swipedIds: [],
  matchedCandidates: [],
  incomingLikes: [],
  passedIds: [],
  lastAction: null,
  inspectingCandidate: null,
  latestMatchedCandidate: null,
  showMatchCelebration: false,
  matches: INITIAL_MATCHES,
  selectedMatchId: "cand-alex-1",
  isLoadingMatches: false,
  isLoadingCandidates: false,
  isLoadingIncomingLikes: false,
  isResettingDeck: false,

  swipeLeft: async (candidateId) => {
    // 1. Instant 0ms Optimistic state update
    set((state) => ({
      swipedIds: [...state.swipedIds, candidateId],
      passedIds: [...state.passedIds, candidateId],
      lastAction: { type: "PASS", candidateId },
    }));

    // 2. Async database persistence
    try {
      await fetch("/api/swipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          swipedId: candidateId,
          targetUserId: candidateId,
          direction: "LEFT",
        }),
      });
    } catch (err) {
      console.error("swipeLeft error:", err);
    }
  },

  swipeRight: async (candidateId) => {
    const candidate =
      get().candidates.find((c) => c.id === candidateId) ||
      get().inspectingCandidate;
    
    // 1. Instant 0ms Optimistic UI
    set((state) => ({
      swipedIds: [...state.swipedIds, candidateId],
      lastAction: { type: "LIKE", candidateId },
    }));

    // 2. Async API swipe record
    try {
      const res = await fetch("/api/swipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          swipedId: candidateId,
          targetUserId: candidateId,
          direction: "RIGHT",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.isMatch || data.matched || data.alreadyMatched) {
          // It's a mutual match!
          if (candidate) {
            set((state) => ({
              matchedCandidates: state.matchedCandidates.some((c) => c.id === candidate.id)
                ? state.matchedCandidates
                : [...state.matchedCandidates, candidate],
              latestMatchedCandidate: candidate,
              showMatchCelebration: true,
            }));
          }
          // Refresh matches list from server
          get().fetchMatches(true);
        }
      }
    } catch (err) {
      console.error("swipeRight error:", err);
    }
  },

  acceptIncomingLike: async (candidateId: string) => {
    const likePartner = get().incomingLikes.find((c) => c.id === candidateId);
    
    // 1. Optimistic removal from incoming likes
    set((state) => ({
      incomingLikes: state.incomingLikes.filter((c) => c.id !== candidateId),
      swipedIds: [...state.swipedIds, candidateId],
      lastAction: { type: "LIKE", candidateId },
    }));

    // 2. Perform swipe right to establish mutual match
    try {
      const res = await fetch("/api/swipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          swipedId: candidateId,
          targetUserId: candidateId,
          direction: "RIGHT",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.isMatch || data.matched || data.alreadyMatched) {
          if (likePartner) {
            set((state) => ({
              matchedCandidates: state.matchedCandidates.some((c) => c.id === likePartner.id)
                ? state.matchedCandidates
                : [...state.matchedCandidates, likePartner],
              latestMatchedCandidate: likePartner,
              showMatchCelebration: true,
            }));
          }
          get().fetchMatches(true);
        }
      }
    } catch (err) {
      console.error("acceptIncomingLike error:", err);
    }
  },

  passIncomingLike: async (candidateId: string) => {
    // 1. Optimistic removal from incoming likes
    set((state) => ({
      incomingLikes: state.incomingLikes.filter((c) => c.id !== candidateId),
      swipedIds: [...state.swipedIds, candidateId],
      passedIds: [...state.passedIds, candidateId],
      lastAction: { type: "PASS", candidateId },
    }));

    // 2. Perform swipe left
    try {
      await fetch("/api/swipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          swipedId: candidateId,
          targetUserId: candidateId,
          direction: "LEFT",
        }),
      });
    } catch (err) {
      console.error("passIncomingLike error:", err);
    }
  },

  undoSwipe: () =>
    set((state) => {
      if (!state.lastAction) return state;
      const { candidateId, type } = state.lastAction;
      return {
        swipedIds: state.swipedIds.filter((id) => id !== candidateId),
        passedIds:
          type === "PASS"
            ? state.passedIds.filter((id) => id !== candidateId)
            : state.passedIds,
        matchedCandidates:
          type === "LIKE"
            ? state.matchedCandidates.filter((c) => c.id !== candidateId)
            : state.matchedCandidates,
        lastAction: null,
      };
    }),

  resetDeck: async () => {
    if (get().isResettingDeck) return;
    set({
      isResettingDeck: true,
      swipedIds: [],
      passedIds: [],
      lastAction: null,
    });
    try {
      const res = await fetch("/api/swipes", { method: "DELETE" });
      if (!res.ok && res.status === 429) {
        console.warn("Deck reset rate limited. Please wait.");
      }
      await get().fetchCandidates(true);
      await get().fetchIncomingLikes(true);
    } catch (err) {
      console.error("resetDeck error:", err);
    } finally {
      set({ isResettingDeck: false });
    }
  },

  setInspectingCandidate: (candidate) =>
    set({ inspectingCandidate: candidate }),

  closeMatchCelebration: () =>
    set({ showMatchCelebration: false, latestMatchedCandidate: null }),

  selectMatch: (id) =>
    set({ selectedMatchId: id }),

  fetchCandidates: async (force = false) => {
    if (get().isLoadingCandidates) return;
    if (!force && get().candidates.length > 0) {
      return;
    }
    set({ isLoadingCandidates: true });
    try {
      const res = await fetch(`/api/candidates?t=${Date.now()}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data: CandidatePartner[] = await res.json();
        set({ candidates: data });
      } else if (res.status === 429) {
        console.warn("Candidates request rate limited.");
      }
    } catch (err) {
      console.error("fetchCandidates error:", err);
    } finally {
      set({ isLoadingCandidates: false });
    }
  },

  fetchMatches: async (force = false) => {
    if (get().isLoadingMatches) return;
    if (!force && get().matchedCandidates.length > 0) {
      return;
    }
    set({ isLoadingMatches: true });
    try {
      const res = await fetch(`/api/matches?t=${Date.now()}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        const candMap = new Map<string, CandidatePartner>();
        (data.candidates || []).forEach((c: CandidatePartner) => {
          if (c?.id) candMap.set(c.id, c);
        });

        const matchMap = new Map<string, CompatibilityResult>();
        (data.matches || []).forEach((m: CompatibilityResult) => {
          if (m?.targetUserId) matchMap.set(m.targetUserId, m);
        });

        set({
          matchedCandidates: Array.from(candMap.values()),
          matches: Array.from(matchMap.values()),
        });
      } else if (res.status === 429) {
        console.warn("Matches request rate limited.");
      }
    } catch (err) {
      console.error("fetchMatches error:", err);
    } finally {
      set({ isLoadingMatches: false });
    }
  },

  fetchIncomingLikes: async (force = false) => {
    if (get().isLoadingIncomingLikes) return;
    if (!force && get().incomingLikes.length > 0) {
      return;
    }
    set({ isLoadingIncomingLikes: true });
    try {
      const res = await fetch(`/api/likes/received?t=${Date.now()}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        set({ incomingLikes: data.likes || [] });
      } else if (res.status === 429) {
        console.warn("Incoming likes request rate limited.");
      }
    } catch (err) {
      console.error("fetchIncomingLikes error:", err);
    } finally {
      set({ isLoadingIncomingLikes: false });
    }
  },
}));
