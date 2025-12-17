import { create } from "zustand";
import { ExperienceData, ExperienceType } from "@/types";

// Form step data for the wizard
interface ExperienceFormState {
  // Current step
  currentStep: number;
  totalSteps: number;
  
  // Form data
  experienceType: ExperienceType | null;
  formData: Partial<ExperienceData>;
  summary: string;
  
  // Actions
  setExperienceType: (type: ExperienceType) => void;
  setFormData: (data: Partial<ExperienceData>) => void;
  updateFormData: <K extends keyof ExperienceData>(key: K, value: ExperienceData[K]) => void;
  setSummary: (summary: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  reset: () => void;
}

// Step counts for each experience type
const stepCounts: Record<ExperienceType, number> = {
  INTERVIEW: 7,
  WORK: 5,
  TRANSITION: 5,
  LEARNING: 5,
  OPEN: 4,
};

export const useExperienceFormStore = create<ExperienceFormState>((set, get) => ({
  currentStep: 0,
  totalSteps: 1,
  experienceType: null,
  formData: {},
  summary: "",
  
  setExperienceType: (type) => {
    set({
      experienceType: type,
      totalSteps: stepCounts[type],
      formData: { type } as Partial<ExperienceData>,
      currentStep: 1,
    });
  },
  
  setFormData: (data) => {
    set({ formData: data });
  },
  
  updateFormData: (key, value) => {
    const { formData } = get();
    set({
      formData: { ...formData, [key]: value },
    });
  },
  
  setSummary: (summary) => {
    set({ summary });
  },
  
  nextStep: () => {
    const { currentStep, totalSteps } = get();
    if (currentStep < totalSteps) {
      set({ currentStep: currentStep + 1 });
    }
  },
  
  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },
  
  goToStep: (step) => {
    const { totalSteps } = get();
    if (step >= 0 && step <= totalSteps) {
      set({ currentStep: step });
    }
  },
  
  reset: () => {
    set({
      currentStep: 0,
      totalSteps: 1,
      experienceType: null,
      formData: {},
      summary: "",
    });
  },
}));

// Filter state for browsing experiences
interface FilterState {
  searchQuery: string;
  experienceType: ExperienceType | "ALL";
  interviewType: "ALL" | "CAMPUS" | "OFF_CAMPUS";
  employmentType: "ALL" | "INTERNSHIP" | "FULL_TIME" | "PART_TIME";
  experienceLevel: "ALL" | string;
  sortBy: "RECENT" | "UPVOTES" | "COMMENTS";
  
  // Actions
  setSearchQuery: (query: string) => void;
  setExperienceType: (type: ExperienceType | "ALL") => void;
  setInterviewType: (type: "ALL" | "CAMPUS" | "OFF_CAMPUS") => void;
  setEmploymentType: (type: "ALL" | "INTERNSHIP" | "FULL_TIME" | "PART_TIME") => void;
  setExperienceLevel: (level: "ALL" | string) => void;
  setSortBy: (sort: "RECENT" | "UPVOTES" | "COMMENTS") => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  searchQuery: "",
  experienceType: "ALL",
  interviewType: "ALL",
  employmentType: "ALL",
  experienceLevel: "ALL",
  sortBy: "RECENT",
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  setExperienceType: (type) => set({ experienceType: type }),
  setInterviewType: (type) => set({ interviewType: type }),
  setEmploymentType: (type) => set({ employmentType: type }),
  setExperienceLevel: (level) => set({ experienceLevel: level }),
  setSortBy: (sort) => set({ sortBy: sort }),
  resetFilters: () => set({
    searchQuery: "",
    experienceType: "ALL",
    interviewType: "ALL",
    employmentType: "ALL",
    experienceLevel: "ALL",
    sortBy: "RECENT",
  }),
}));

