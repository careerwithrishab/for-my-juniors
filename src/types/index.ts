// Experience Types
export type ExperienceType =
  | "INTERVIEW"
  | "WORK"
  | "TRANSITION"
  | "LEARNING"
  | "OPEN";

export type ExperienceStatus = "PENDING" | "PUBLISHED" | "REJECTED";

export type InterviewType = "CAMPUS" | "OFF_CAMPUS";
export type EmploymentType = "INTERNSHIP" | "FULL_TIME" | "PART_TIME" | "CONTRACT";
export type ExperienceLevel = "FRESHER" | "1_YEAR" | "2_YEARS" | "3_PLUS_YEARS" | "5_PLUS_YEARS";
export type InterviewOutcome = "SELECTED" | "REJECTED" | "ON_HOLD" | "PENDING";
export type Difficulty = 1 | 2 | 3 | 4 | 5;

// Interview Round Types
export interface InterviewRound {
  roundNumber: number;
  roundType: string; // "Technical", "HR", "System Design", "Coding", etc.
  description: string;
  difficulty: Difficulty;
  tips?: string;
}

// Interview Experience
export interface InterviewExperience {
  type: "INTERVIEW";
  interviewType: InterviewType;
  role: string;
  employmentType: EmploymentType;
  companyName: string;
  interviewMonth: number;
  interviewYear: number;
  opportunitySource: string;
  designation: string;
  experienceLevel: ExperienceLevel;
  rounds: InterviewRound[];
  overallDifficulty: Difficulty;
  preparationTips: string;
  outcome: InterviewOutcome;
  offerDetails?: string;
}

// Work Experience
export interface WorkExperience {
  type: "WORK";
  companyName: string;
  role: string;
  duration: string;
  teamSize?: number;
  workDescription: string;
  learnings: string;
  pros: string[];
  cons: string[];
  rating: Difficulty;
  wouldRecommend: boolean;
}

// Transition Story
export interface TransitionStory {
  type: "TRANSITION";
  fromRole: string;
  toRole: string;
  fromCompany?: string;
  toCompany?: string;
  transitionReason: string;
  challengesFaced: string;
  howOvercame: string;
  timelineDuration: string;
  adviceForOthers: string;
}

// Learning Journey
export interface LearningJourney {
  type: "LEARNING";
  skill: string;
  category: string; // DSA, Web Dev, Data Science, etc.
  duration: string;
  resources: string[];
  learningPath: string;
  projectsBuilt?: string[];
  challengesFaced: string;
  outcomes: string;
  tips: string;
}

// Open Experience
export interface OpenExperience {
  type: "OPEN";
  title: string;
  category: string;
  content: string;
  keyTakeaways: string[];
}

// Union type for all experience data
export type ExperienceData =
  | InterviewExperience
  | WorkExperience
  | TransitionStory
  | LearningJourney
  | OpenExperience;

// Main Experience document
export interface Experience {
  id: string;
  userId: string;
  username: string;
  type: ExperienceType;
  data: ExperienceData;
  summary: string;
  status: ExperienceStatus;
  adminFeedback?: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  // For filtering
  tags: string[];
  companyName?: string;
  role?: string;
}

// Vote
export interface Vote {
  id: string;
  experienceId: string;
  oderId: string;
  voteType: "UP" | "DOWN";
  createdAt: Date;
}

// Comment
export interface Comment {
  id: string;
  experienceId: string;
  userId: string;
  username: string;
  content: string;
  parentId?: string; // For nested comments (1 level)
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Report
export interface Report {
  id: string;
  targetType: "EXPERIENCE" | "COMMENT";
  targetId: string;
  reporterId: string;
  reason: string;
  status: "PENDING" | "REVIEWED" | "RESOLVED";
  createdAt: Date;
}

