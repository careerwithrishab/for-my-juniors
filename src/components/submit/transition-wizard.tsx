"use client";

import { useState, useEffect } from "react";
import { useExperienceFormStore } from "@/store/experience-store";
import { TransitionStory } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, ArrowRightLeft, Target, Lightbulb, Clock, Sparkles, X } from "lucide-react";
import { normalizeRole, normalizeCompany, LLMSuggestion } from "@/lib/llm";
import { AnimatePresence, motion } from "framer-motion";

interface TransitionWizardProps {
  step: number;
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

export function TransitionWizard({ step }: TransitionWizardProps) {
  const { formData, updateFormData, nextStep } = useExperienceFormStore();
  const data = formData as Partial<TransitionStory>;

  // AI suggestions
  const [fromRoleSuggestion, setFromRoleSuggestion] = useState<LLMSuggestion | null>(null);
  const [toRoleSuggestion, setToRoleSuggestion] = useState<LLMSuggestion | null>(null);
  const [fromCompanySuggestion, setFromCompanySuggestion] = useState<LLMSuggestion | null>(null);
  const [toCompanySuggestion, setToCompanySuggestion] = useState<LLMSuggestion | null>(null);

  useEffect(() => {
    if (!data.fromRole || data.fromRole.length < 2) {
      setFromRoleSuggestion(null);
      return;
    }
    const timer = setTimeout(() => {
      setFromRoleSuggestion(normalizeRole(data.fromRole || ""));
    }, 300);
    return () => clearTimeout(timer);
  }, [data.fromRole]);

  useEffect(() => {
    if (!data.toRole || data.toRole.length < 2) {
      setToRoleSuggestion(null);
      return;
    }
    const timer = setTimeout(() => {
      setToRoleSuggestion(normalizeRole(data.toRole || ""));
    }, 300);
    return () => clearTimeout(timer);
  }, [data.toRole]);

  useEffect(() => {
    if (!data.fromCompany || data.fromCompany.length < 2) {
      setFromCompanySuggestion(null);
      return;
    }
    const timer = setTimeout(() => {
      setFromCompanySuggestion(normalizeCompany(data.fromCompany || ""));
    }, 300);
    return () => clearTimeout(timer);
  }, [data.fromCompany]);

  useEffect(() => {
    if (!data.toCompany || data.toCompany.length < 2) {
      setToCompanySuggestion(null);
      return;
    }
    const timer = setTimeout(() => {
      setToCompanySuggestion(normalizeCompany(data.toCompany || ""));
    }, 300);
    return () => clearTimeout(timer);
  }, [data.toCompany]);

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.fromRole && data.toRole;
      case 2:
        return data.transitionReason;
      case 3:
        return data.challengesFaced && data.howOvercame;
      case 4:
        return data.timelineDuration && data.adviceForOthers;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed()) {
      nextStep();
    }
  };

  // Step 1: From/To Roles
  if (step === 1) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Your Transition</h2>
            <p className="text-sm text-muted-foreground">From where to where?</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* From */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <h3 className="font-medium text-muted-foreground">FROM</h3>
            <div>
              <Label htmlFor="fromRole">Previous Role</Label>
              <Input
                id="fromRole"
                placeholder="e.g., Software Engineer"
                value={data.fromRole || ""}
                onChange={(e) => updateFormData("fromRole", e.target.value)}
                className="mt-1.5"
              />
              <InlineSuggestion
                suggestion={fromRoleSuggestion}
                onApply={() => {
                  if (fromRoleSuggestion) {
                    updateFormData("fromRole", fromRoleSuggestion.suggestion);
                    setFromRoleSuggestion(null);
                  }
                }}
                onDismiss={() => setFromRoleSuggestion(null)}
              />
            </div>
            <div>
              <Label htmlFor="fromCompany">Previous Company (optional)</Label>
              <Input
                id="fromCompany"
                placeholder="e.g., TCS"
                value={data.fromCompany || ""}
                onChange={(e) => updateFormData("fromCompany", e.target.value)}
                className="mt-1.5"
              />
              <InlineSuggestion
                suggestion={fromCompanySuggestion}
                onApply={() => {
                  if (fromCompanySuggestion) {
                    updateFormData("fromCompany", fromCompanySuggestion.suggestion);
                    setFromCompanySuggestion(null);
                  }
                }}
                onDismiss={() => setFromCompanySuggestion(null)}
              />
            </div>
          </div>

          {/* To */}
          <div className="space-y-4 p-4 border rounded-lg border-primary/30 bg-primary/5">
            <h3 className="font-medium text-primary">TO</h3>
            <div>
              <Label htmlFor="toRole">New Role</Label>
              <Input
                id="toRole"
                placeholder="e.g., Product Manager"
                value={data.toRole || ""}
                onChange={(e) => updateFormData("toRole", e.target.value)}
                className="mt-1.5"
              />
              <InlineSuggestion
                suggestion={toRoleSuggestion}
                onApply={() => {
                  if (toRoleSuggestion) {
                    updateFormData("toRole", toRoleSuggestion.suggestion);
                    setToRoleSuggestion(null);
                  }
                }}
                onDismiss={() => setToRoleSuggestion(null)}
              />
            </div>
            <div>
              <Label htmlFor="toCompany">New Company (optional)</Label>
              <Input
                id="toCompany"
                placeholder="e.g., Google"
                value={data.toCompany || ""}
                onChange={(e) => updateFormData("toCompany", e.target.value)}
                className="mt-1.5"
              />
              <InlineSuggestion
                suggestion={toCompanySuggestion}
                onApply={() => {
                  if (toCompanySuggestion) {
                    updateFormData("toCompany", toCompanySuggestion.suggestion);
                    setToCompanySuggestion(null);
                  }
                }}
                onDismiss={() => setToCompanySuggestion(null)}
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

  // Step 2: Why the transition
  if (step === 2) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Motivation</h2>
            <p className="text-sm text-muted-foreground">Why did you make this change?</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="reason">Why did you transition?</Label>
            <Textarea
              id="reason"
              placeholder="What motivated you to make this change? Was it career growth, interest, salary, work-life balance, or something else?"
              value={data.transitionReason || ""}
              onChange={(e) => updateFormData("transitionReason", e.target.value)}
              className="mt-1.5 min-h-[150px]"
            />
          </div>
        </div>

        <Button onClick={handleNext} disabled={!canProceed()} className="w-full gap-2">
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Step 3: Challenges & Solutions
  if (step === 3) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Lightbulb className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Challenges & Solutions</h2>
            <p className="text-sm text-muted-foreground">The hurdles and how you overcame them</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="challenges">What challenges did you face?</Label>
            <Textarea
              id="challenges"
              placeholder="Skill gaps, doubts, rejections, imposter syndrome, financial concerns, etc."
              value={data.challengesFaced || ""}
              onChange={(e) => updateFormData("challengesFaced", e.target.value)}
              className="mt-1.5 min-h-[120px]"
            />
          </div>

          <div>
            <Label htmlFor="overcome">How did you overcome them?</Label>
            <Textarea
              id="overcome"
              placeholder="What strategies, resources, or mindset shifts helped you succeed?"
              value={data.howOvercame || ""}
              onChange={(e) => updateFormData("howOvercame", e.target.value)}
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

  // Step 4: Timeline & Advice
  if (step === 4) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Timeline & Advice</h2>
            <p className="text-sm text-muted-foreground">Help others on a similar journey</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="timeline">How long did the transition take?</Label>
            <Input
              id="timeline"
              placeholder="e.g., 6 months of preparation, 3 months of job search"
              value={data.timelineDuration || ""}
              onChange={(e) => updateFormData("timelineDuration", e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="advice">Your advice for others</Label>
            <Textarea
              id="advice"
              placeholder="What would you tell someone who wants to make a similar transition? Resources, mindset, networking tips, etc."
              value={data.adviceForOthers || ""}
              onChange={(e) => updateFormData("adviceForOthers", e.target.value)}
              className="mt-1.5 min-h-[150px]"
            />
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

