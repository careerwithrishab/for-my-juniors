"use client";

import { useState, useEffect } from "react";
import { useExperienceFormStore } from "@/store/experience-store";
import { WorkExperience, Difficulty } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Plus, X, Star, Building2, Briefcase, Clock, Users, ThumbsUp, ThumbsDown, Sparkles } from "lucide-react";
import { normalizeRole, normalizeCompany, LLMSuggestion } from "@/lib/llm";
import { AnimatePresence, motion } from "framer-motion";

interface WorkWizardProps {
  step: number;
}

function RatingSelector({
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

function InlineSuggestion({
  suggestion,
  onApply,
  onDismiss,
}: {
  suggestion: LLMSuggestion | null;
  onApply: () => void;
  onDismiss: () => void;
}) {
  if (!suggestion) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        className="flex items-center gap-2 mt-1.5 text-sm"
      >
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span className="text-muted-foreground">Did you mean</span>
        <button
          type="button"
          onClick={onApply}
          className="font-medium text-primary hover:underline"
        >
          {suggestion.suggestion}
        </button>
        <span className="text-muted-foreground">?</span>
        <button
          type="button"
          onClick={onDismiss}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

export function WorkWizard({ step }: WorkWizardProps) {
  const { formData, updateFormData, nextStep } = useExperienceFormStore();
  const data = formData as Partial<WorkExperience>;

  const [pros, setPros] = useState<string[]>(data.pros || []);
  const [cons, setCons] = useState<string[]>(data.cons || []);
  const [newPro, setNewPro] = useState("");
  const [newCon, setNewCon] = useState("");
  
  // AI suggestions
  const [roleSuggestion, setRoleSuggestion] = useState<LLMSuggestion | null>(null);
  const [companySuggestion, setCompanySuggestion] = useState<LLMSuggestion | null>(null);

  useEffect(() => {
    if (!data.role || data.role.length < 2) {
      setRoleSuggestion(null);
      return;
    }
    const timer = setTimeout(() => {
      setRoleSuggestion(normalizeRole(data.role || ""));
    }, 300);
    return () => clearTimeout(timer);
  }, [data.role]);

  useEffect(() => {
    if (!data.companyName || data.companyName.length < 2) {
      setCompanySuggestion(null);
      return;
    }
    const timer = setTimeout(() => {
      setCompanySuggestion(normalizeCompany(data.companyName || ""));
    }, 300);
    return () => clearTimeout(timer);
  }, [data.companyName]);

  const addPro = () => {
    if (newPro.trim()) {
      const updated = [...pros, newPro.trim()];
      setPros(updated);
      updateFormData("pros", updated);
      setNewPro("");
    }
  };

  const removePro = (index: number) => {
    const updated = pros.filter((_, i) => i !== index);
    setPros(updated);
    updateFormData("pros", updated);
  };

  const addCon = () => {
    if (newCon.trim()) {
      const updated = [...cons, newCon.trim()];
      setCons(updated);
      updateFormData("cons", updated);
      setNewCon("");
    }
  };

  const removeCon = (index: number) => {
    const updated = cons.filter((_, i) => i !== index);
    setCons(updated);
    updateFormData("cons", updated);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.companyName && data.role && data.duration;
      case 2:
        return data.workDescription && data.learnings;
      case 3:
        return pros.length > 0 || cons.length > 0;
      case 4:
        return data.rating !== undefined;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed()) {
      nextStep();
    }
  };

  // Step 1: Company & Role
  if (step === 1) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Company & Role</h2>
            <p className="text-sm text-muted-foreground">Where did you work?</p>
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
            <InlineSuggestion
              suggestion={companySuggestion}
              onApply={() => {
                if (companySuggestion) {
                  updateFormData("companyName", companySuggestion.suggestion);
                  setCompanySuggestion(null);
                }
              }}
              onDismiss={() => setCompanySuggestion(null)}
            />
          </div>

          <div>
            <Label htmlFor="role">Your Role / Position</Label>
            <Input
              id="role"
              placeholder="e.g., Software Engineer, Data Analyst"
              value={data.role || ""}
              onChange={(e) => updateFormData("role", e.target.value)}
              className="mt-1.5"
            />
            <InlineSuggestion
              suggestion={roleSuggestion}
              onApply={() => {
                if (roleSuggestion) {
                  updateFormData("role", roleSuggestion.suggestion);
                  setRoleSuggestion(null);
                }
              }}
              onDismiss={() => setRoleSuggestion(null)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                placeholder="e.g., 6 months, 2 years"
                value={data.duration || ""}
                onChange={(e) => updateFormData("duration", e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="teamSize">Team Size (optional)</Label>
              <Input
                id="teamSize"
                type="number"
                placeholder="e.g., 10"
                value={data.teamSize || ""}
                onChange={(e) => updateFormData("teamSize", parseInt(e.target.value) || undefined)}
                className="mt-1.5"
              />
            </div>
          </div>
        </div>

        <Button onClick={handleNext} disabled={!canProceed()} className="w-full gap-2">
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Step 2: Work Description
  if (step === 2) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Briefcase className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Work & Learnings</h2>
            <p className="text-sm text-muted-foreground">Describe your day-to-day and growth</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="workDescription">Day-to-Day Work</Label>
            <Textarea
              id="workDescription"
              placeholder="What did your typical day look like? What projects did you work on? What technologies did you use?"
              value={data.workDescription || ""}
              onChange={(e) => updateFormData("workDescription", e.target.value)}
              className="mt-1.5 min-h-[120px]"
            />
          </div>

          <div>
            <Label htmlFor="learnings">Key Learnings</Label>
            <Textarea
              id="learnings"
              placeholder="What skills did you develop? What did you learn about the industry, teamwork, or yourself?"
              value={data.learnings || ""}
              onChange={(e) => updateFormData("learnings", e.target.value)}
              className="mt-1.5 min-h-[100px]"
            />
          </div>
        </div>

        <Button onClick={handleNext} disabled={!canProceed()} className="w-full gap-2">
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Step 3: Pros & Cons
  if (step === 3) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Pros & Cons</h2>
            <p className="text-sm text-muted-foreground">The good and the challenges</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Pros */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-green-500" />
              <Label>What was great?</Label>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a pro..."
                value={newPro}
                onChange={(e) => setNewPro(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addPro()}
              />
              <Button type="button" size="icon" onClick={addPro}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {pros.map((pro, index) => (
                <Badge key={index} variant="secondary" className="gap-1 bg-green-500/10 text-green-700">
                  {pro}
                  <button onClick={() => removePro(index)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Cons */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ThumbsDown className="h-4 w-4 text-red-500" />
              <Label>Challenges / Areas to improve</Label>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a con..."
                value={newCon}
                onChange={(e) => setNewCon(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCon()}
              />
              <Button type="button" size="icon" onClick={addCon}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {cons.map((con, index) => (
                <Badge key={index} variant="secondary" className="gap-1 bg-red-500/10 text-red-700">
                  {con}
                  <button onClick={() => removeCon(index)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
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

  // Step 4: Overall Rating
  if (step === 4) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Star className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Overall Rating</h2>
            <p className="text-sm text-muted-foreground">Your final verdict</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <Label>Overall Experience Rating</Label>
            <div className="mt-2">
              <RatingSelector
                value={data.rating || 3}
                onChange={(d) => updateFormData("rating", d)}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {data.rating === 1 && "Poor experience"}
              {data.rating === 2 && "Below average"}
              {data.rating === 3 && "Average experience"}
              {data.rating === 4 && "Good experience"}
              {data.rating === 5 && "Excellent experience!"}
            </p>
          </div>

          <div>
            <Label>Would you recommend this company to others?</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {[
                { value: true, label: "Yes, I'd recommend it", color: "border-green-500 bg-green-500/5" },
                { value: false, label: "No, I wouldn't", color: "border-red-500 bg-red-500/5" },
              ].map((option) => (
                <Card
                  key={option.label}
                  className={`cursor-pointer transition-all ${
                    data.wouldRecommend === option.value
                      ? option.color
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => updateFormData("wouldRecommend", option.value)}
                >
                  <CardContent className="p-4 text-center">
                    <span className="font-medium">{option.label}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <Button onClick={handleNext} disabled={!canProceed()} className="w-full gap-2">
          Review & Submit <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return null;
}

