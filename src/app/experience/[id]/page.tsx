"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Experience, Comment, ExperienceType, InterviewExperience } from "@/types";
import { getExperience, getComments, createComment, vote, getUserVote } from "@/lib/firestore";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  MessageCircle,
  Briefcase,
  Building2,
  RefreshCw,
  BookOpen,
  FileText,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  Send,
  GraduationCap,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";

const typeConfig: Record<
  ExperienceType,
  { label: string; icon: React.ElementType; color: string }
> = {
  INTERVIEW: {
    label: "Interview Experience",
    icon: Briefcase,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  WORK: {
    label: "Work Experience",
    icon: Building2,
    color: "bg-green-500/10 text-green-600 dark:text-green-400",
  },
  TRANSITION: {
    label: "Transition Story",
    icon: RefreshCw,
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  },
  LEARNING: {
    label: "Learning Journey",
    icon: BookOpen,
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },
  OPEN: {
    label: "Open Experience",
    icon: FileText,
    color: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
  },
};

const outcomeConfig = {
  SELECTED: {
    label: "Selected",
    icon: CheckCircle2,
    color: "text-green-600 bg-green-500/10",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    color: "text-red-500 bg-red-500/10",
  },
  ON_HOLD: {
    label: "On Hold",
    icon: Clock,
    color: "text-yellow-600 bg-yellow-500/10",
  },
  PENDING: {
    label: "Pending",
    icon: Clock,
    color: "text-muted-foreground bg-muted",
  },
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

export default function ExperienceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user, userData } = useAuth();
  const [experience, setExperience] = useState<Experience | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [userVote, setUserVote] = useState<"UP" | "DOWN" | null>(null);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [exp, cmts] = await Promise.all([
          getExperience(resolvedParams.id),
          getComments(resolvedParams.id),
        ]);

        if (!exp || exp.status !== "PUBLISHED") {
          router.push("/experiences");
          return;
        }

        setExperience(exp);
        setComments(cmts);

        if (user) {
          const vote = await getUserVote(resolvedParams.id, user.uid);
          if (vote) {
            setUserVote(vote.voteType);
          }
        }
      } catch (error) {
        console.error("Error fetching experience:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.id, user, router]);

  const handleVote = async (voteType: "UP" | "DOWN") => {
    if (!user) {
      toast.error("Please sign in to vote");
      return;
    }

    try {
      await vote(resolvedParams.id, user.uid, voteType);
      
      // Update local state
      if (userVote === voteType) {
        setUserVote(null);
      } else {
        setUserVote(voteType);
      }

      // Refresh experience
      const updated = await getExperience(resolvedParams.id);
      if (updated) setExperience(updated);
    } catch (error) {
      toast.error("Failed to vote");
    }
  };

  const handleSubmitComment = async () => {
    if (!user || !userData || !newComment.trim()) return;

    setSubmittingComment(true);
    try {
      await createComment(
        resolvedParams.id,
        user.uid,
        userData.username,
        newComment.trim()
      );
      
      setNewComment("");
      
      // Refresh comments
      const updatedComments = await getComments(resolvedParams.id);
      setComments(updatedComments);
      
      // Update comment count
      const updated = await getExperience(resolvedParams.id);
      if (updated) setExperience(updated);
      
      toast.success("Comment added!");
    } catch (error) {
      toast.error("Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-32 bg-muted rounded" />
          <div className="h-10 w-3/4 bg-muted rounded" />
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  if (!experience) return null;

  const { type, data, summary, username, upvotes, downvotes, createdAt } = experience;
  const config = typeConfig[type];
  const TypeIcon = config.icon;
  const score = upvotes - downvotes;

  const renderInterviewDetails = (data: InterviewExperience) => {
    const outcome = outcomeConfig[data.outcome];
    
    return (
      <>
        {/* Quick Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Type</p>
            <p className="font-medium">
              {data.interviewType === "CAMPUS" ? "Campus" : "Off-Campus"}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Employment</p>
            <p className="font-medium">{data.employmentType.replace("_", " ")}</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Timeline</p>
            <p className="font-medium">
              {format(new Date(data.interviewYear, data.interviewMonth - 1), "MMM yyyy")}
            </p>
          </div>
          <div className={`p-4 rounded-xl ${outcome.color}`}>
            <p className="text-xs opacity-70 mb-1">Outcome</p>
            <div className="flex items-center gap-1.5 font-medium">
              <outcome.icon className="h-4 w-4" />
              {outcome.label}
            </div>
          </div>
        </div>

        {/* Rounds */}
        {data.rounds && data.rounds.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Interview Rounds</h3>
            <div className="space-y-4">
              {data.rounds.map((round, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Badge variant="outline" className="mb-2">
                          Round {round.roundNumber}
                        </Badge>
                        <h4 className="font-medium">{round.roundType}</h4>
                      </div>
                      <DifficultyStars difficulty={round.difficulty} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {round.description}
                    </p>
                    {round.tips && (
                      <p className="text-sm mt-2 text-primary">
                        💡 Tip: {round.tips}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Overall Difficulty */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Overall Difficulty</h3>
          <DifficultyStars difficulty={data.overallDifficulty} />
        </div>

        {/* Preparation Tips */}
        {data.preparationTips && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Preparation Tips</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {data.preparationTips}
            </p>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Link href="/experiences">
        <Button variant="ghost" className="gap-2 mb-6 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Experiences
        </Button>
      </Link>

      {/* Main Card */}
      <Card className="mb-8">
        <CardHeader className="pb-4">
          {/* Type Badge & Date */}
          <div className="flex items-center justify-between mb-4">
            <Badge variant="secondary" className={`gap-1.5 ${config.color}`}>
              <TypeIcon className="h-4 w-4" />
              {config.label}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {data.type === "INTERVIEW" && `${data.role} at ${data.companyName}`}
            {data.type === "WORK" && `${data.role} at ${data.companyName}`}
            {data.type === "TRANSITION" && `${data.fromRole} → ${data.toRole}`}
            {data.type === "LEARNING" && `Learning ${data.skill}`}
            {data.type === "OPEN" && data.title}
          </h1>

          {/* Author & Voting */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{username}</span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className={userVote === "UP" ? "text-primary" : ""}
                onClick={() => handleVote("UP")}
              >
                <ArrowUp className="h-5 w-5" />
              </Button>
              <span
                className={`font-semibold min-w-[2ch] text-center ${
                  score > 0
                    ? "text-green-600"
                    : score < 0
                      ? "text-red-500"
                      : ""
                }`}
              >
                {score}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className={userVote === "DOWN" ? "text-destructive" : ""}
                onClick={() => handleVote("DOWN")}
              >
                <ArrowDown className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          {/* Summary */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Summary</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{summary}</p>
          </div>

          {/* Type-specific details */}
          {data.type === "INTERVIEW" && renderInterviewDetails(data)}
        </CardContent>
      </Card>

      {/* Comments Section */}
      <div id="comments">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comments ({comments.length})
        </h2>

        {/* Add Comment */}
        {user ? (
          <Card className="mb-6">
            <CardContent className="p-4">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mb-3 min-h-[100px]"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || submittingComment}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  {submittingComment ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6 p-6 text-center">
            <p className="text-muted-foreground mb-3">
              Sign in to join the discussion
            </p>
            <Button variant="outline">Sign In</Button>
          </Card>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No comments yet. Be the first to share your thoughts!
            </p>
          ) : (
            comments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {comment.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {comment.username}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                        {comment.isEdited && (
                          <span className="text-xs text-muted-foreground">
                            (edited)
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

