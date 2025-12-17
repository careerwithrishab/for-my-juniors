"use client";

import Link from "next/link";
import { Experience, ExperienceType } from "@/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ArrowUp,
  ArrowDown,
  MessageCircle,
  Briefcase,
  GraduationCap,
  RefreshCw,
  BookOpen,
  FileText,
  Building2,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ExperienceCardProps {
  experience: Experience;
  onVote?: (type: "UP" | "DOWN") => void;
  userVote?: "UP" | "DOWN" | null;
}

const typeConfig: Record<
  ExperienceType,
  { label: string; icon: React.ElementType; color: string }
> = {
  INTERVIEW: {
    label: "Interview",
    icon: Briefcase,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  WORK: {
    label: "Work Experience",
    icon: Building2,
    color: "bg-green-500/10 text-green-600 dark:text-green-400",
  },
  TRANSITION: {
    label: "Transition",
    icon: RefreshCw,
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  },
  LEARNING: {
    label: "Learning",
    icon: BookOpen,
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },
  OPEN: {
    label: "Open",
    icon: FileText,
    color: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
  },
};

const outcomeConfig = {
  SELECTED: {
    label: "Selected",
    icon: CheckCircle2,
    color: "text-green-600 dark:text-green-400",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    color: "text-red-500 dark:text-red-400",
  },
  ON_HOLD: {
    label: "On Hold",
    icon: Clock,
    color: "text-yellow-600 dark:text-yellow-400",
  },
  PENDING: {
    label: "Pending",
    icon: Clock,
    color: "text-muted-foreground",
  },
};

export function ExperienceCard({
  experience,
  onVote,
  userVote,
}: ExperienceCardProps) {
  const { type, data, summary, username, upvotes, downvotes, commentCount, createdAt } =
    experience;
  const config = typeConfig[type];
  const TypeIcon = config.icon;

  // Extract relevant info based on type
  const getTitle = () => {
    if (data.type === "INTERVIEW") {
      return `${data.role} at ${data.companyName}`;
    }
    if (data.type === "WORK") {
      return `${data.role} at ${data.companyName}`;
    }
    if (data.type === "TRANSITION") {
      return `${data.fromRole} → ${data.toRole}`;
    }
    if (data.type === "LEARNING") {
      return `Learning ${data.skill}`;
    }
    if (data.type === "OPEN") {
      return data.title;
    }
    return "Experience";
  };

  const getSubtitle = () => {
    if (data.type === "INTERVIEW") {
      return `${data.interviewType === "CAMPUS" ? "Campus" : "Off-Campus"} • ${data.employmentType.replace("_", " ")}`;
    }
    if (data.type === "WORK") {
      return data.duration;
    }
    if (data.type === "TRANSITION") {
      return data.timelineDuration;
    }
    if (data.type === "LEARNING") {
      return `${data.category} • ${data.duration}`;
    }
    if (data.type === "OPEN") {
      return data.category;
    }
    return "";
  };

  const getOutcome = () => {
    if (data.type === "INTERVIEW") {
      return outcomeConfig[data.outcome];
    }
    return null;
  };

  const outcome = getOutcome();
  const score = upvotes - downvotes;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <Badge
              variant="secondary"
              className={`shrink-0 gap-1.5 ${config.color}`}
            >
              <TypeIcon className="h-3.5 w-3.5" />
              {config.label}
            </Badge>
            {outcome && (
              <Badge
                variant="outline"
                className={`shrink-0 gap-1 ${outcome.color}`}
              >
                <outcome.icon className="h-3 w-3" />
                {outcome.label}
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground shrink-0">
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </span>
        </div>

        <Link href={`/experience/${experience.id}`} className="block mt-2">
          <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
            {getTitle()}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground">{getSubtitle()}</p>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-3">{summary}</p>
      </CardContent>

      <CardFooter className="pt-3 border-t border-border/50 flex items-center justify-between">
        {/* Author */}
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {username?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">{username}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Voting */}
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${userVote === "UP" ? "text-primary" : ""}`}
              onClick={() => onVote?.("UP")}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <span
              className={`text-sm font-medium min-w-[2ch] text-center ${
                score > 0
                  ? "text-green-600"
                  : score < 0
                    ? "text-red-500"
                    : "text-muted-foreground"
              }`}
            >
              {score}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${userVote === "DOWN" ? "text-destructive" : ""}`}
              onClick={() => onVote?.("DOWN")}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Comments */}
          <Link href={`/experience/${experience.id}#comments`}>
            <Button variant="ghost" size="sm" className="gap-1.5 h-8">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">{commentCount}</span>
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

// Skeleton for loading state
export function ExperienceCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="h-6 w-24 bg-muted animate-pulse rounded-md" />
          <div className="h-4 w-16 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-6 w-3/4 bg-muted animate-pulse rounded mt-2" />
        <div className="h-4 w-1/2 bg-muted animate-pulse rounded mt-1" />
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
        </div>
      </CardContent>
      <CardFooter className="pt-3 border-t">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-muted animate-pulse rounded-full" />
            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-20 bg-muted animate-pulse rounded" />
            <div className="h-8 w-16 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

