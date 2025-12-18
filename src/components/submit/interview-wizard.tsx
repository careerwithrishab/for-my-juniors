"use client";

import { useState } from "react";
import { useExperienceFormStore } from "@/store/experience-store";
import { InterviewExperience, InterviewRound, Difficulty } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Plus, Trash2, Star, Building2, Briefcase, GraduationCap, Target, FileText } from "lucide-react";

interface InterviewWizardProps {
  step: number;
}

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

const opportunitySources = [
  "College Placement Portal",
  "LinkedIn",
  "Company Career Page",
  "Referral",
  "AngelList / Wellfound",
  "Naukri / Indeed",
  "Other",
];

const roundTypes = [
  "Online Assessment",
  "Technical Round",
  "Coding Round",
  "System Design",
  "HR Round",
  "Managerial Round",
  "Culture Fit",
  "Other",
];

function DifficultySelector({
  value,
  onChange,
}: {
  value: Difficulty;
  onChange: (d: Difficulty) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((level) => (
        <button
          key={level}
          type="button"
          onClick={() => onChange(level as Difficulty)}
          className="p-1 transition-colors"
        >
          <Star
            className={`h-6 w-6 ${
              level <= value
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground/30 hover:text-muted-foreground/50"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function InterviewWizard({ step }: InterviewWizardProps) {
  const { formData, updateFormData, nextStep } = useExperienceFormStore();
  const data = formData as Partial<InterviewExperience>;

  const [rounds, setRounds] = useState<InterviewRound[]>(data.rounds || []);

  const addRound = () => {
    const newRound: InterviewRound = {
      roundNumber: rounds.length + 1,
      roundType: "Technical Round",
      description: "",
      difficulty: 3,
      tips: "",
    };
    const updated = [...rounds, newRound];
    setRounds(updated);
    updateFormData("rounds", updated);
  };

  const updateRound = (index: number, field: keyof InterviewRound, value: unknown) => {
    const updated = rounds.map((r, i) =>
      i === index ? { ...r, [field]: value } : r
    );
    setRounds(updated);
    updateFormData("rounds", updated);
  };

  const removeRound = (index: number) => {
    const updated = rounds
      .filter((_, i) => i !== index)
      .map((r, i) => ({ ...r, roundNumber: i + 1 }));
    setRounds(updated);
    updateFormData("rounds", updated);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.interviewType && data.role && data.employmentType;
      case 2:
        return data.companyName && data.interviewMonth && data.interviewYear && data.opportunitySource;
      case 3:
        return data.designation && data.experienceLevel;
      case 4:
        return rounds.length > 0 && rounds.every(r => r.description);
      case 5:
        return data.overallDifficulty && data.preparationTips;
      case 6:
        return data.outcome;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed()) {
      nextStep();
    }
  };

  // Step 1: Context
  if (step === 1) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Briefcase className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Interview Context</h2>
            <p className="text-sm text-muted-foreground">Basic details about the interview</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Interview Type</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {[
                { value: "CAMPUS", label: "Campus Placement" },
                { value: "OFF_CAMPUS", label: "Off-Campus" },
              ].map((option) => (
                <Card
                  key={option.value}
                  className={`cursor-pointer transition-all ${
                    data.interviewType === option.value
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => updateFormData("interviewType", option.value)}
                >
                  <CardContent className="p-4 text-center">
                    <span className="font-medium">{option.label}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="role">Role / Position</Label>
            <Input
              id="role"
              placeholder="e.g., Software Engineer, Data Analyst"
              value={data.role || ""}
              onChange={(e) => updateFormData("role", e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label>Employment Type</Label>
            <Select
              value={data.employmentType}
              onValueChange={(value) => updateFormData("employmentType", value)}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INTERNSHIP">Internship</SelectItem>
                <SelectItem value="FULL_TIME">Full-time</SelectItem>
                <SelectItem value="PART_TIME">Part-time</SelectItem>
                <SelectItem value="CONTRACT">Contract</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleNext} disabled={!canProceed()} className="w-full gap-2">
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Step 2: Company & Timing
  if (step === 2) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Company & Timeline</h2>
            <p className="text-sm text-muted-foreground">Where and when was this interview?</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="company">Company Name</Label>
            <Input
              id="company"
              placeholder="e.g., Google, Microsoft, Flipkart"
              value={data.companyName || ""}
              onChange={(e) => updateFormData("companyName", e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Month</Label>
              <Select
                value={data.interviewMonth?.toString()}
                onValueChange={(value) => updateFormData("interviewMonth", parseInt(value))}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, i) => (
                    <SelectItem key={month} value={(i + 1).toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Year</Label>
              <Select
                value={data.interviewYear?.toString()}
                onValueChange={(value) => updateFormData("interviewYear", parseInt(value))}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>How did you find this opportunity?</Label>
            <Select
              value={data.opportunitySource}
              onValueChange={(value) => updateFormData("opportunitySource", value)}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                {opportunitySources.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleNext} disabled={!canProceed()} className="w-full gap-2">
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Step 3: Candidate Background
  if (step === 3) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Your Background</h2>
            <p className="text-sm text-muted-foreground">Your experience level at the time</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="designation">Your Designation / Role at that time</Label>
            <Input
              id="designation"
              placeholder="e.g., Final Year Student, SDE-1 at XYZ"
              value={data.designation || ""}
              onChange={(e) => updateFormData("designation", e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label>Experience Level</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {[
                { value: "FRESHER", label: "Fresher" },
                { value: "1_YEAR", label: "~1 Year" },
                { value: "2_YEARS", label: "~2 Years" },
                { value: "3_PLUS_YEARS", label: "3+ Years" },
                { value: "5_PLUS_YEARS", label: "5+ Years" },
              ].map((option) => (
                <Card
                  key={option.value}
                  className={`cursor-pointer transition-all ${
                    data.experienceLevel === option.value
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => updateFormData("experienceLevel", option.value)}
                >
                  <CardContent className="p-3 text-center">
                    <span className="text-sm font-medium">{option.label}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <Button onClick={handleNext} disabled={!canProceed()} className="w-full gap-2">
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Step 4: Interview Rounds
  if (step === 4) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Interview Rounds</h2>
            <p className="text-sm text-muted-foreground">Add details for each round</p>
          </div>
        </div>

        <div className="space-y-4">
          {rounds.map((round, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Round {round.roundNumber}</Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => removeRound(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Round Type</Label>
                    <Select
                      value={round.roundType}
                      onValueChange={(value) => updateRound(index, "roundType", value)}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roundTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Difficulty</Label>
                    <div className="mt-2">
                      <DifficultySelector
                        value={round.difficulty}
                        onChange={(d) => updateRound(index, "difficulty", d)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label>What happened in this round?</Label>
                  <Textarea
                    placeholder="Describe the questions asked, topics covered, etc."
                    value={round.description}
                    onChange={(e) => updateRound(index, "description", e.target.value)}
                    className="mt-1.5 min-h-[80px]"
                  />
                </div>

                <div>
                  <Label>Tips for this round (optional)</Label>
                  <Input
                    placeholder="Any specific tips for this round?"
                    value={round.tips || ""}
                    onChange={(e) => updateRound(index, "tips", e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            variant="outline"
            onClick={addRound}
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Round
          </Button>
        </div>

        <Button onClick={handleNext} disabled={!canProceed()} className="w-full gap-2">
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Step 5: Preparation & Difficulty
  if (step === 5) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Preparation & Insights</h2>
            <p className="text-sm text-muted-foreground">Share your preparation tips</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Overall Interview Difficulty</Label>
            <div className="mt-2">
              <DifficultySelector
                value={data.overallDifficulty || 3}
                onChange={(d) => updateFormData("overallDifficulty", d)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="tips">Preparation Tips</Label>
            <Textarea
              id="tips"
              placeholder="What would you suggest others to prepare? Resources, topics, strategies..."
              value={data.preparationTips || ""}
              onChange={(e) => updateFormData("preparationTips", e.target.value)}
              className="mt-1.5 min-h-[120px]"
            />
          </div>
        </div>

        <Button onClick={handleNext} disabled={!canProceed()} className="w-full gap-2">
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Step 6: Outcome
  if (step === 6) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Outcome</h2>
            <p className="text-sm text-muted-foreground">What was the final result?</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Interview Outcome</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {[
                { value: "SELECTED", label: "Selected ✓", color: "border-green-500 bg-green-500/5" },
                { value: "REJECTED", label: "Rejected ✗", color: "border-red-500 bg-red-500/5" },
                { value: "ON_HOLD", label: "On Hold ⏳", color: "border-yellow-500 bg-yellow-500/5" },
                { value: "PENDING", label: "Pending ⌛", color: "border-gray-500 bg-gray-500/5" },
              ].map((option) => (
                <Card
                  key={option.value}
                  className={`cursor-pointer transition-all ${
                    data.outcome === option.value
                      ? option.color
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => updateFormData("outcome", option.value)}
                >
                  <CardContent className="p-4 text-center">
                    <span className="font-medium">{option.label}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {data.outcome === "SELECTED" && (
            <div>
              <Label htmlFor="offer">Offer Details (optional)</Label>
              <Textarea
                id="offer"
                placeholder="CTC, location, joining date, etc. (keep it anonymous)"
                value={data.offerDetails || ""}
                onChange={(e) => updateFormData("offerDetails", e.target.value)}
                className="mt-1.5"
              />
            </div>
          )}
        </div>

        <Button onClick={handleNext} disabled={!canProceed()} className="w-full gap-2">
          Review & Submit <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return null;
}
