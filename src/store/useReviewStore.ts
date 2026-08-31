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

const INITIAL_REVIEWS: PeerReview[] = [
  {
    id: "rev-1",
    projectId: "proj-devora-1",
    projectTitle: "Devora",
    reviewerId: "user-sarah-2",
    reviewerName: "Sarah Chen",
    reviewerTitle: "Fullstack Audio Engineer",
    revieweeId: "user-current-1",
    revieweeName: "M Iqbal Ferdiansyah",
    codeQualityRating: 5,
    communicationRating: 5,
    reliabilityRating: 5,
    overallSynergyScore: 96,
    wouldBuildAgain: "DEFINITELY",
    endorsementTags: ["Clean Architecture", "Async Master", "Deep TypeScript Guru", "Fast Turnaround"],
    writtenReview:
      "Iqbal is one of the most disciplined builders I have collaborated with. The state management architecture and custom design token integration was executed flawlessly with zero slop. Highly recommended as a co-founder or lead builder.",
    createdAt: "2026-08-28T10:00:00.000Z",
  },
  {
    id: "rev-2",
    projectId: "proj-resensify-2",
    projectTitle: "Resensify",
    reviewerId: "user-current-1",
    reviewerName: "M Iqbal Ferdiansyah",
    reviewerTitle: "Senior Fullstack Engineer",
    revieweeId: "user-alex-1",
    revieweeName: "Alex Rivera",
    codeQualityRating: 5,
    communicationRating: 4,
    reliabilityRating: 5,
    overallSynergyScore: 92,
    wouldBuildAgain: "DEFINITELY",
    endorsementTags: ["Postgres Wizard", "Redis Streams", "High Reliability"],
    writtenReview:
      "Alex delivered the relational schema and Redis caching pipeline ahead of sprint deadline. High rigor on database indexing and SQL query performance.",
    createdAt: "2026-08-25T14:30:00.000Z",
  },
];

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
