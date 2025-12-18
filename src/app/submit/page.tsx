"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useExperienceFormStore } from "@/store/experience-store";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// Steps
import { TypeSelector } from "@/components/submit/type-selector";
import { InterviewWizard } from "@/components/submit/interview-wizard";
import { ReviewStep } from "@/components/submit/review-step";

export default function SubmitPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { currentStep, totalSteps, experienceType, reset, prevStep } =
    useExperienceFormStore();

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Reset form on mount
  useEffect(() => {
    reset();
  }, [reset]);

  if (loading) {
    return (
      <div className="container max-w-3xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-2 bg-muted rounded-full" />
          <div className="h-96 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const progress = totalSteps > 1 ? (currentStep / totalSteps) * 100 : 0;

  const renderStep = () => {
    // Step 0: Type selection
    if (currentStep === 0) {
      return <TypeSelector />;
    }

    // Type-specific wizards
    switch (experienceType) {
      case "INTERVIEW":
        if (currentStep === totalSteps) {
          return <ReviewStep />;
        }
        return <InterviewWizard step={currentStep} />;
      // Add other types here
      default:
        return <TypeSelector />;
    }
  };

  return (
    <div className="container max-w-3xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          {currentStep > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={prevStep}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Share Your Experience</h1>
            <p className="text-muted-foreground">
              {currentStep === 0
                ? "Choose the type of experience you want to share"
                : `Step ${currentStep} of ${totalSteps}`}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        {currentStep > 0 && (
          <Progress value={progress} className="h-2" />
        )}
      </div>

      {/* Form Content */}
      <Card>
        <CardContent className="p-6 md:p-8">{renderStep()}</CardContent>
      </Card>
    </div>
  );
}

