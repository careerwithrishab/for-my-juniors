"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Experience } from "@/types";
import { getExperiences } from "@/lib/firestore";
import { useAuth } from "@/lib/auth-context";
import { ExperienceCard, ExperienceCardSkeleton } from "@/components/experience/experience-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PenLine, Clock, CheckCircle2, XCircle, FileText } from "lucide-react";

export default function MyExperiencesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchMyExperiences = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const { experiences: data } = await getExperiences(
          { userId: user.uid },
          "createdAt",
          100
        );
        setExperiences(data);
      } catch (error) {
        console.error("Error fetching experiences:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMyExperiences();
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="grid gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <ExperienceCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const pendingExperiences = experiences.filter((e) => e.status === "PENDING");
  const publishedExperiences = experiences.filter((e) => e.status === "PUBLISHED");
  const rejectedExperiences = experiences.filter((e) => e.status === "REJECTED");

  const getFilteredExperiences = () => {
    switch (activeTab) {
      case "pending":
        return pendingExperiences;
      case "published":
        return publishedExperiences;
      case "rejected":
        return rejectedExperiences;
      default:
        return experiences;
    }
  };

  const filteredExperiences = getFilteredExperiences();

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">My Experiences</h1>
          <p className="text-muted-foreground">
            Track and manage your submitted experiences
          </p>
        </div>
        <Link href="/submit">
          <Button className="gap-2">
            <PenLine className="h-4 w-4" />
            New Experience
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingExperiences.length}</p>
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
              <p className="text-2xl font-bold">{publishedExperiences.length}</p>
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
              <p className="text-2xl font-bold">{rejectedExperiences.length}</p>
              <p className="text-xs text-muted-foreground">Rejected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="all" className="gap-1.5">
            All
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">
              {experiences.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-1.5">
            Pending
            {pendingExperiences.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {pendingExperiences.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <ExperienceCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredExperiences.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {activeTab === "all"
                  ? "No experiences yet"
                  : `No ${activeTab} experiences`}
              </h3>
              <p className="text-muted-foreground mb-4">
                {activeTab === "all"
                  ? "Share your first experience to help juniors!"
                  : "Nothing to show here."}
              </p>
              {activeTab === "all" && (
                <Link href="/submit">
                  <Button>Share Experience</Button>
                </Link>
              )}
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredExperiences.map((experience) => (
                <div key={experience.id} className="relative">
                  {/* Status Badge */}
                  <div className="absolute -top-2 -right-2 z-10">
                    {experience.status === "PENDING" && (
                      <Badge className="bg-yellow-500 text-white">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending Review
                      </Badge>
                    )}
                    {experience.status === "REJECTED" && (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Rejected
                      </Badge>
                    )}
                  </div>

                  <ExperienceCard experience={experience} />

                  {/* Admin Feedback for rejected */}
                  {experience.status === "REJECTED" && experience.adminFeedback && (
                    <Card className="mt-2 border-destructive/30 bg-destructive/5">
                      <CardContent className="p-3">
                        <p className="text-sm font-medium text-destructive mb-1">
                          Admin Feedback:
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {experience.adminFeedback}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

