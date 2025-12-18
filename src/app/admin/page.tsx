"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Experience, ExperienceType } from "@/types";
import {
  getPendingExperiences,
  getExperienceStats,
  updateExperienceStatus,
} from "@/lib/firestore";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Users,
  TrendingUp,
  Briefcase,
  Building2,
  RefreshCw,
  BookOpen,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Shield,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const typeConfig: Record<ExperienceType, { icon: React.ElementType; color: string }> = {
  INTERVIEW: { icon: Briefcase, color: "text-blue-500" },
  WORK: { icon: Building2, color: "text-green-500" },
  TRANSITION: { icon: RefreshCw, color: "text-orange-500" },
  LEARNING: { icon: BookOpen, color: "text-purple-500" },
  OPEN: { icon: FileText, color: "text-gray-500" },
};

export default function AdminPage() {
  const router = useRouter();
  const { userData, loading: authLoading } = useAuth();
  const [pendingExperiences, setPendingExperiences] = useState<Experience[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, published: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectFeedback, setRejectFeedback] = useState("");
  const [processing, setProcessing] = useState(false);

  // Check admin access
  useEffect(() => {
    if (!authLoading && (!userData || userData.role !== "ADMIN")) {
      router.push("/");
    }
  }, [userData, authLoading, router]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [pending, statsData] = await Promise.all([
          getPendingExperiences(),
          getExperienceStats(),
        ]);
        setPendingExperiences(pending);
        setStats(statsData);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userData?.role === "ADMIN") {
      fetchData();
    }
  }, [userData]);

  const handleApprove = async (experience: Experience) => {
    setProcessing(true);
    try {
      await updateExperienceStatus(experience.id, "PUBLISHED");
      setPendingExperiences((prev) => prev.filter((e) => e.id !== experience.id));
      setStats((prev) => ({
        ...prev,
        pending: prev.pending - 1,
        published: prev.published + 1,
      }));
      setSelectedExperience(null);
      toast.success("Experience approved and published!");
    } catch (error) {
      toast.error("Failed to approve");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedExperience) return;

    setProcessing(true);
    try {
      await updateExperienceStatus(
        selectedExperience.id,
        "REJECTED",
        rejectFeedback
      );
      setPendingExperiences((prev) =>
        prev.filter((e) => e.id !== selectedExperience.id)
      );
      setStats((prev) => ({
        ...prev,
        pending: prev.pending - 1,
        rejected: prev.rejected + 1,
      }));
      setShowRejectDialog(false);
      setSelectedExperience(null);
      setRejectFeedback("");
      toast.success("Experience rejected");
    } catch (error) {
      toast.error("Failed to reject");
    } finally {
      setProcessing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!userData || userData.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage and moderate content</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.published}</p>
              <p className="text-xs text-muted-foreground">Published</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.rejected}</p>
              <p className="text-xs text-muted-foreground">Rejected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            Pending Review
            <Badge variant="secondary" className="ml-2">
              {pendingExperiences.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingExperiences.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
              <p className="text-muted-foreground">
                No pending experiences to review.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {pendingExperiences.map((experience) => {
                  const TypeIcon = typeConfig[experience.type].icon;
                  const iconColor = typeConfig[experience.type].color;

                  return (
                    <Card
                      key={experience.id}
                      className="hover:border-primary/50 transition-colors"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <TypeIcon className={`h-4 w-4 ${iconColor}`} />
                              <Badge variant="outline" className="capitalize">
                                {experience.type.toLowerCase()}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                by {experience.username}
                              </span>
                            </div>

                            <h4 className="font-medium mb-1">
                              {experience.data.type === "INTERVIEW" &&
                                `${experience.data.role} at ${experience.data.companyName}`}
                              {experience.data.type === "WORK" &&
                                `${experience.data.role} at ${experience.data.companyName}`}
                              {experience.data.type === "TRANSITION" &&
                                `${experience.data.fromRole} → ${experience.data.toRole}`}
                              {experience.data.type === "LEARNING" &&
                                `Learning ${experience.data.skill}`}
                              {experience.data.type === "OPEN" && experience.data.title}
                            </h4>

                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {experience.summary}
                            </p>

                            <p className="text-xs text-muted-foreground mt-2">
                              Submitted{" "}
                              {formatDistanceToNow(new Date(experience.createdAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5"
                              onClick={() => setSelectedExperience(experience)}
                            >
                              <Eye className="h-4 w-4" />
                              Review
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              className="gap-1.5 bg-green-600 hover:bg-green-700"
                              onClick={() => handleApprove(experience)}
                              disabled={processing}
                            >
                              <ThumbsUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="gap-1.5"
                              onClick={() => {
                                setSelectedExperience(experience);
                                setShowRejectDialog(true);
                              }}
                              disabled={processing}
                            >
                              <ThumbsDown className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog
        open={!!selectedExperience && !showRejectDialog}
        onOpenChange={(open) => !open && setSelectedExperience(null)}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedExperience && (
            <>
              <DialogHeader>
                <DialogTitle>Review Experience</DialogTitle>
                <DialogDescription>
                  Submitted by {selectedExperience.username}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Summary</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedExperience.summary}
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Full Content</h4>
                  <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-60">
                    {JSON.stringify(selectedExperience.data, null, 2)}
                  </pre>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectDialog(true);
                  }}
                >
                  Reject
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleApprove(selectedExperience)}
                  disabled={processing}
                >
                  {processing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Approve & Publish"
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Experience</DialogTitle>
            <DialogDescription>
              Provide feedback to help the user improve their submission.
            </DialogDescription>
          </DialogHeader>

          <div>
            <Textarea
              placeholder="Explain why this is being rejected..."
              value={rejectFeedback}
              onChange={(e) => setRejectFeedback(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing || !rejectFeedback.trim()}
            >
              {processing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Reject"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

