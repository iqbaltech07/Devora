export type ProjectStage = "IDEATION" | "PROTOTYPE" | "MVP" | "PRODUCTION";

export interface ProjectMilestone {
  id: string;
  title: string;
  description?: string;
  targetQuarter?: string;
  status: "UPCOMING" | "IN_PROGRESS" | "COMPLETED";
}

export interface GitRepository {
  id: string;
  name: string;
  description: string;
  stars?: number;
  starsCount?: number;
  forks?: number;
  forksCount?: number;
  language: string;
  languageColor?: string;
  url: string;
  isPrivate?: boolean;
  updatedAt: string;
  isEvidence?: boolean;
  isPrimaryEvidence?: boolean;
}

export interface GitAccount {
  provider: "github" | "gitlab";
  username?: string;
  connected?: boolean;
  connectedAt?: string;
  profileUrl?: string;
  avatarUrl?: string;
  lastSyncedAt?: string;
  totalRepos?: number;
  repositories: GitRepository[];
}

export interface SkillItem {
  id: string;
  name: string;
  category: "Frontend" | "Backend" | "Database" | "DevOps" | "DevOps & Cloud" | "AI" | "AI & Agents" | "Mobile" | "UI/UX";
  proficiency: "Junior" | "Mid" | "Senior";
  yearsOfExperience: number;
  isPrimary?: boolean;
}

export type ExperienceLevel = "BEGINNER" | "JUNIOR" | "INTERMEDIATE" | "SENIOR";
export type WorkPreference = "REMOTE" | "HYBRID" | "ONSITE";

export interface Certificate {
  id: string;
  userId?: string;
  title: string;
  issuer: string;
  issueDate?: string | null;
  credentialUrl?: string | null;
  fileUrl?: string | null;
  createdAt?: string;
}

export interface PortfolioProject {
  id: string;
  userId?: string;
  title: string;
  description?: string | null;
  liveUrl?: string | null;
  repoUrl?: string | null;
  tags: string[];
  imageUrl?: string | null;
  createdAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  title: string;
  bio: string;
  location: string;
  timezone: string;
  skills: string[];
  skillMatrix?: SkillItem[];
  techStack: string[];
  availabilityHrs: number;
  goals: string[];
  workStyle?: string;
  workingRhythm?: string;
  githubUrl?: string;
  githubUsername?: string;
  avatarUrl?: string;
  image?: string;
  onboarded?: boolean;
  gitAccounts?: GitAccount[];

  // Professional Developer Profile Fields (Phase 1)
  experienceYears?: number;
  experienceLevel?: ExperienceLevel;
  workPreference?: WorkPreference;
  flexibleHours?: boolean;
  availableDays?: string[];
  portfolioUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  profileCompleteness?: number;

  certificates?: Certificate[];
  portfolios?: PortfolioProject[];
  projects?: any[];
  tags?: string[];
  primaryStack?: string[];
}

export interface ProjectRole {
  id: string;
  roleTitle: string;
  requiredSkills: string[];
  hoursPerWeek: number;
  responsibilityLevel?: "LEAD" | "CORE_BUILDER" | "CONTRIBUTOR" | "ADVISOR";
  urgency?: "IMMEDIATE" | "NEXT_SPRINT" | "FLEXIBLE";
  description?: string;
}

export interface Project {
  id: string;
  ownerId: string;
  ownerName: string;
  title: string;
  description: string;
  stage: ProjectStage;
  repoUrl?: string;
  roles: ProjectRole[];
  tags: string[];
  roadmap?: ProjectMilestone[];
  createdAt: string;
  isRecruiting?: boolean;
}

export interface MatchReason {
  title: string;
  description: string;
  type: "stack" | "availability" | "role" | "domain";
}

export interface CompatibilityResult {
  targetUserId: string;
  candidateName: string;
  candidateTitle: string;
  score: number; // 0 - 100
  reasons: MatchReason[];
  stackOverlap: string[];
  complementarySkills: string[];
  hoursOverlap: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  sentAt: string;
  read?: boolean;
  delivered?: boolean;
}

export interface Invitation {
  id: string;
  senderId: string;
  senderName: string;
  senderTitle?: string;
  recipientId: string;
  projectId: string;
  projectTitle: string;
  roleTitle?: string;
  hoursPerWeek?: number;
  note: string;
  counterNote?: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "COUNTER_PROPOSED";
  createdAt: string;
}

export interface JoinRequest {
  id: string;
  projectId: string;
  projectTitle: string;
  applicantId: string;
  applicantName: string;
  applicantTitle: string;
  applicantAvatarUrl?: string;
  roleTitle: string;
  skills: string[];
  hoursPerWeek: number;
  pitchNote: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
  createdAt: string;
}

export interface PeerReview {
  id: string;
  projectId: string;
  projectTitle: string;
  reviewerId: string;
  reviewerName: string;
  reviewerTitle: string;
  revieweeId: string;
  revieweeName: string;
  codeQualityRating: number; // 1 - 5
  communicationRating: number; // 1 - 5
  reliabilityRating: number; // 1 - 5
  overallSynergyScore: number; // 0 - 100
  wouldBuildAgain: "DEFINITELY" | "CONDITIONAL" | "NO";
  endorsementTags: string[];
  writtenReview: string;
  createdAt: string;
}

export interface CandidatePartner {
  id: string;
  name: string;
  avatarUrl?: string;
  title: string;
  bio: string;
  location: string;
  timezone: string;
  availabilityHrs: number;
  workStyle: string;
  githubUsername?: string;
  githubUrl?: string;
  matchScore: number;
  matchTier?: "EXCELLENT" | "STRONG" | "GOOD";
  matchReasons: MatchReason[];
  primaryStack: string[];
  skills: SkillItem[];
  repositories: GitRepository[];
  lookingFor: {
    roles: string[];
    commitment: string;
    projectTypes: string[];
  };
  buildingProject?: {
    title: string;
    description: string;
    stage: ProjectStage;
    tech: string[];
  };
  tags: string[];

  // Professional profile attributes
  experienceYears?: number;
  experienceLevel?: ExperienceLevel;
  workPreference?: WorkPreference;
  flexibleHours?: boolean;
  availableDays?: string[];
  portfolioUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  profileCompleteness?: number;

  certificates?: Certificate[];
  portfolios?: PortfolioProject[];
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: "info" | "success" | "warning" | "error";
}

