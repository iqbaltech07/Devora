import { create } from "zustand";
import { PeerReview } from "./types";

interface ReviewState {
  reviews: PeerReview[];
  addReview: (review: Omit<PeerReview, "id" | "createdAt">) => void;
  getReviewsForUser: (userId: string) => PeerReview[];
  getUserReputationSummary: (userId: string) => {
    totalReviews: number;
    averageCodeQuality: number;
    averageCommunication: number;
    averageReliability: number;
    averageSynergyScore: number;
    wouldBuildAgainPercent: number;
    topTags: string[];
  };
}

const INITIAL_REVIEWS: PeerReview[] = [];

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviews: INITIAL_REVIEWS,
  addReview: (newRev) =>
    set((state) => ({
      reviews: [
        {
          ...newRev,
          id: `rev-${Date.now()}`,
          createdAt: new Date().toISOString(),
        },
        ...state.reviews,
      ],
    })),
  getReviewsForUser: (userId) => {
    return get().reviews.filter((r) => r.revieweeId === userId);
  },
  getUserReputationSummary: (userId) => {
    const userReviews = get().reviews.filter((r) => r.revieweeId === userId);
    if (userReviews.length === 0) {
      return {
        totalReviews: 0,
        averageCodeQuality: 5.0,
        averageCommunication: 5.0,
        averageReliability: 5.0,
        averageSynergyScore: 95,
        wouldBuildAgainPercent: 100,
        topTags: ["Strong Overlap", "Verified Commits"],
      };
    }

    const total = userReviews.length;
    const avgCode =
      userReviews.reduce((sum, r) => sum + r.codeQualityRating, 0) / total;
    const avgComm =
      userReviews.reduce((sum, r) => sum + r.communicationRating, 0) / total;
    const avgRel =
      userReviews.reduce((sum, r) => sum + r.reliabilityRating, 0) / total;
    const avgSynergy =
      userReviews.reduce((sum, r) => sum + r.overallSynergyScore, 0) / total;

    const buildAgainCount = userReviews.filter(
      (r) => r.wouldBuildAgain === "DEFINITELY"
    ).length;
    const wouldBuildAgainPercent = Math.round((buildAgainCount / total) * 100);

    const allTags = userReviews.flatMap((r) => r.endorsementTags);
    const tagCounts: Record<string, number> = {};
    allTags.forEach((t) => {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    });
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([t]) => t)
      .slice(0, 4);

    return {
      totalReviews: total,
      averageCodeQuality: Number(avgCode.toFixed(1)),
      averageCommunication: Number(avgComm.toFixed(1)),
      averageReliability: Number(avgRel.toFixed(1)),
      averageSynergyScore: Math.round(avgSynergy),
      wouldBuildAgainPercent,
      topTags,
    };
  },
}));
