"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useExperienceFormStore } from "@/store/experience-store";
import { createExperience } from "@/lib/firestore";
import { InterviewExperience } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  Send,
  Loader2,
  Briefcase,
  Building2,
  Calendar,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const outcomeConfig = {
  SELECTED: { label: "Selected", icon: CheckCircle2, color: "text-green-600 bg-green-500/10" },
  REJECTED: { label: "Rejected", icon: XCircle, color: "text-red-500 bg-red-500/10" },
  ON_HOLD: { label: "On Hold", icon: Clock, color: "text-yellow-600 bg-yellow-500/10" },
  PENDING: { label: "Pending", icon: Clock, color: "text-muted-foreground bg-muted" },
};

function DifficultyStars({ difficulty }: { difficulty: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < difficulty
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

export function ReviewStep() {
  const router = useRouter();
  const { user, userData } = useAuth();
  const { formData, experienceType, reset, setSummary, summary } = useExperienceFormStore();
  const [submitting, setSubmitting] = useState(false);

  const data = formData as InterviewExperience;

  const generateTags = (): string[] => {
    const tags: string[] = [];
    
    if (data.type === "INTERVIEW") {
      tags.push(data.companyName?.toLowerCase() || "");
      tags.push(data.role?.toLowerCase() || "");
      tags.push(data.interviewType?.toLowerCase() || "");
      tags.push(data.employmentType?.toLowerCase().replace("_", " ") || "");
      tags.push(data.outcome?.toLowerCase() || "");
    }
    
    return tags.filter(Boolean);
  };

  const handleSubmit = async () => {
    if (!user || !userData || !experienceType || !summary.trim()) {
      toast.error("Please add a summary before submitting");
      return;
    }

    setSubmitting(true);
    try {
      await createExperience(
        user.uid,
        userData.username,
        experienceType,
        data,
        summary,
        generateTags()
      );

      toast.success("Experience submitted for review!");
      reset();
      router.push("/my-experiences");
    } catch (error) {
      console.error("Error submitting:", error);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (data.type !== "INTERVIEW") {
    return <div>Unsupported type</div>;
  }

  const outcome = outcomeConfig[data.outcome];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold mb-2">Review Your Experience</h2>
        <p className="text-muted-foreground">
          Make sure everything looks good before submitting
        </p>
      </div>

      {/* Preview Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="secondary" className="gap-1.5 bg-blue-500/10 text-blue-600">
              <Briefcase className="h-3.5 w-3.5" />
              Interview Experience
            </Badge>
            <Badge className={`gap-1 ${outcome.color}`}>
              <outcome.icon className="h-3 w-3" />
              {outcome.label}
            </Badge>
          </div>

          <h3 className="text-xl font-semibold">
            {data.role} at {data.companyName}
          </h3>
          <p className="text-sm text-muted-foreground">
            {data.interviewType === "CAMPUS" ? "Campus" : "Off-Campus"} •{" "}
            {data.employmentType.replace("_", " ")}
          </p>
        </CardHeader>

        <Separator />

        <CardContent className="pt-4 space-y-4">
          {/* Quick Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {format(
                  new Date(data.interviewYear, data.interviewMonth - 1),
                  "MMM yyyy"
                )}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span>{data.experienceLevel.replace("_", " ")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{data.opportunitySource}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Difficulty:</span>
              <DifficultyStars difficulty={data.overallDifficulty} />
            </div>
          </div>

          {/* Rounds Summary */}
          <div>
            <p className="text-sm font-medium mb-2">
              {data.rounds.length} Round{data.rounds.length !== 1 ? "s" : ""}
            </p>
            <div className="flex flex-wrap gap-2">
              {data.rounds.map((round) => (
                <Badge key={round.roundNumber} variant="outline">
                  R{round.roundNumber}: {round.roundType}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Input */}
      <div>
        <Label htmlFor="summary" className="text-base font-medium">
          Write a Summary
        </Label>
        <p className="text-sm text-muted-foreground mb-2">
          This will be shown as the preview text. Keep it concise and helpful.
        </p>
        <Textarea
          id="summary"
          placeholder="Write a brief summary of your interview experience..."
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="min-h-[120px]"
        />
        <p className="text-xs text-muted-foreground mt-1">
          {summary.length} / 500 characters recommended
        </p>
      </div>

      {/* Submit */}
      <div className="space-y-3">
        <Button
          onClick={handleSubmit}
          disabled={submitting || !summary.trim()}
          className="w-full gap-2"
          size="lg"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit for Review
            </>
          )}
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          Your experience will be reviewed by admins before publishing.
          <br />
          You&apos;ll be notified once it&apos;s approved.
        </p>
      </div>
    </div>
  );
}

