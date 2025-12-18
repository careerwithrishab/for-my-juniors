"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Experience, ExperienceType } from "@/types";
import { getExperiences, vote, getUserVote } from "@/lib/firestore";
import { useAuth } from "@/lib/auth-context";
import { useFilterStore } from "@/store/experience-store";
import {
  ExperienceCard,
  ExperienceCardSkeleton,
} from "@/components/experience/experience-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Filter,
  X,
  Briefcase,
  Building2,
  RefreshCw,
  BookOpen,
  FileText,
  SlidersHorizontal,
  Lock,
  LogIn,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const typeOptions = [
  { value: "ALL", label: "All Types", icon: FileText },
  { value: "INTERVIEW", label: "Interviews", icon: Briefcase },
  { value: "WORK", label: "Work Experience", icon: Building2 },
  { value: "TRANSITION", label: "Transitions", icon: RefreshCw },
  { value: "LEARNING", label: "Learning", icon: BookOpen },
];

const sortOptions = [
  { value: "RECENT", label: "Most Recent" },
  { value: "UPVOTES", label: "Most Upvoted" },
  { value: "COMMENTS", label: "Most Discussed" },
];

// Sample experiences to show as preview
const sampleExperiences: Experience[] = [
  {
    id: "sample-1",
    userId: "sample",
    username: "Rahul Sharma",
    type: "INTERVIEW",
    data: {
      type: "INTERVIEW",
      interviewType: "CAMPUS",
      role: "Software Engineer",
      employmentType: "FULL_TIME",
      companyName: "Google",
      interviewMonth: 9,
      interviewYear: 2024,
      opportunitySource: "College Placement Portal",
      designation: "Final Year B.Tech CSE",
      experienceLevel: "FRESHER",
      rounds: [
        { roundNumber: 1, roundType: "Online Assessment", description: "2 DSA problems", difficulty: 3, tips: "" },
        { roundNumber: 2, roundType: "Technical Round", description: "System design basics", difficulty: 4, tips: "" },
      ],
      overallDifficulty: 4,
      preparationTips: "Focus on DSA and system design basics. Striver's SDE sheet helped a lot!",
      outcome: "SELECTED",
      offerDetails: "35 LPA CTC, Bangalore",
    },
    summary: "Got selected at Google through campus placements! The process had 4 rounds - OA, 2 technical, and 1 HR. Preparation tip: Focus on DSA fundamentals and practice on LeetCode.",
    status: "PUBLISHED",
    upvotes: 127,
    downvotes: 3,
    commentCount: 24,
    createdAt: new Date("2024-10-15"),
    updatedAt: new Date("2024-10-15"),
    publishedAt: new Date("2024-10-15"),
    tags: ["Google", "Campus Placement", "SDE", "DSA"],
    companyName: "Google",
    role: "Software Engineer",
  },
  {
    id: "sample-2",
    userId: "sample",
    username: "Priya Patel",
    type: "WORK",
    data: {
      type: "WORK",
      companyName: "Microsoft",
      role: "Product Manager",
      duration: "2 years",
      teamSize: 12,
      workDescription: "Led feature development for Azure products",
      learnings: "Cross-functional collaboration and stakeholder management",
      pros: ["Great work culture", "Learning opportunities", "Good benefits"],
      cons: ["Fast-paced", "High expectations"],
      rating: 5,
      wouldRecommend: true,
    },
    summary: "My 2-year journey as a PM at Microsoft was incredible. The work culture is amazing, and you get exposure to world-class products. Highly recommend for anyone looking to grow!",
    status: "PUBLISHED",
    upvotes: 89,
    downvotes: 2,
    commentCount: 15,
    createdAt: new Date("2024-09-20"),
    updatedAt: new Date("2024-09-20"),
    publishedAt: new Date("2024-09-20"),
    tags: ["Microsoft", "Product Management", "Work Culture"],
    companyName: "Microsoft",
    role: "Product Manager",
  },
];

// Blurred card component for non-logged-in users
function BlurredExperienceCard({ onSignIn }: { onSignIn: () => void }) {
  return (
    <Card className="relative overflow-hidden group cursor-pointer" onClick={onSignIn}>
      {/* Blurred background content */}
      <div className="blur-sm pointer-events-none">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20" />
              <div>
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-3 w-16 bg-muted rounded mt-1" />
              </div>
            </div>
            <Badge variant="secondary">Interview</Badge>
          </div>
          <div className="space-y-2 mb-4">
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-3/4 bg-muted rounded" />
            <div className="h-4 w-1/2 bg-muted rounded" />
          </div>
          <div className="flex gap-2">
            <Badge variant="outline">Amazon</Badge>
            <Badge variant="outline">SDE</Badge>
          </div>
        </CardContent>
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <h3 className="font-semibold mb-1">Sign in to unlock</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Access 500+ real experiences from seniors
        </p>
        <Button size="sm" className="gap-2">
          <LogIn className="h-4 w-4" />
          Sign in with Google
        </Button>
      </div>
    </Card>
  );
}

function ExperiencesContent() {
  const searchParams = useSearchParams();
  const { user, signInWithGoogle } = useAuth();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState<Record<string, "UP" | "DOWN">>({});
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const {
    searchQuery,
    experienceType,
    sortBy,
    setSearchQuery,
    setExperienceType,
    setSortBy,
    resetFilters,
  } = useFilterStore();

  // Initialize from URL params
  useEffect(() => {
    const typeParam = searchParams.get("type") as ExperienceType | null;
    if (typeParam && typeOptions.some((t) => t.value === typeParam)) {
      setExperienceType(typeParam);
    }
  }, [searchParams, setExperienceType]);

  // Fetch experiences
  const fetchExperiences = useCallback(async () => {
    // If user is not logged in, show sample experiences only
    if (!user) {
      setLoading(false);
      setExperiences([]);
      return;
    }

    setLoading(true);
    try {
      const sortField =
        sortBy === "RECENT"
          ? "createdAt"
          : sortBy === "UPVOTES"
            ? "upvotes"
            : "commentCount";

      const { experiences: data } = await getExperiences(
        {
          status: "PUBLISHED",
          type: experienceType !== "ALL" ? experienceType : undefined,
        },
        sortField,
        50
      );

      // Filter by search query locally (for now)
      let filtered = data;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = data.filter(
          (exp) =>
            exp.summary.toLowerCase().includes(query) ||
            exp.companyName?.toLowerCase().includes(query) ||
            exp.role?.toLowerCase().includes(query) ||
            exp.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      }

      setExperiences(filtered);

      // Fetch user votes
      if (user) {
        const votes: Record<string, "UP" | "DOWN"> = {};
        await Promise.all(
          filtered.map(async (exp) => {
            const userVote = await getUserVote(exp.id, user.uid);
            if (userVote) {
              votes[exp.id] = userVote.voteType;
            }
          })
        );
        setUserVotes(votes);
      }
    } catch (error) {
      console.error("Error fetching experiences:", error);
    } finally {
      setLoading(false);
    }
  }, [experienceType, sortBy, searchQuery, user]);

  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  const handleVote = async (experienceId: string, voteType: "UP" | "DOWN") => {
    if (!user) {
      return;
    }

    try {
      await vote(experienceId, user.uid, voteType);
      
      // Update local state
      setUserVotes((prev) => {
        const newVotes = { ...prev };
        if (prev[experienceId] === voteType) {
          delete newVotes[experienceId];
        } else {
          newVotes[experienceId] = voteType;
        }
        return newVotes;
      });

      // Refresh experiences to get updated counts
      fetchExperiences();
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const hasActiveFilters =
    experienceType !== "ALL" || searchQuery || sortBy !== "RECENT";

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Experience Type */}
      <div>
        <label className="text-sm font-medium mb-2 block">Experience Type</label>
        <Select
          value={experienceType}
          onValueChange={(value) =>
            setExperienceType(value as ExperienceType | "ALL")
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {typeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <option.icon className="h-4 w-4" />
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sort By */}
      <div>
        <label className="text-sm font-medium mb-2 block">Sort By</label>
        <Select
          value={sortBy}
          onValueChange={(value) =>
            setSortBy(value as "RECENT" | "UPVOTES" | "COMMENTS")
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reset */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={resetFilters}
          className="w-full gap-2"
        >
          <X className="h-4 w-4" />
          Reset Filters
        </Button>
      )}
    </div>
  );

  // Show sample + blurred cards for non-logged-in users
  const renderGuestView = () => {
    // Filter sample experiences by type if selected
    let filteredSamples = sampleExperiences;
    if (experienceType !== "ALL") {
      filteredSamples = sampleExperiences.filter(
        (exp) => exp.type === experienceType
      );
    }

    // If searching, filter samples too
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredSamples = filteredSamples.filter(
        (exp) =>
          exp.summary.toLowerCase().includes(query) ||
          exp.companyName?.toLowerCase().includes(query) ||
          exp.role?.toLowerCase().includes(query)
      );
    }

    const showSample = filteredSamples.length > 0;

    return (
      <>
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 rounded-lg mb-6 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Sign in to unlock all experiences</h3>
              <p className="text-sm text-muted-foreground">
                Here&apos;s a preview of what awaits you. Sign in to access 500+ verified experiences!
              </p>
            </div>
            <Button onClick={() => signInWithGoogle()} className="gap-2 shrink-0">
              <LogIn className="h-4 w-4" />
              Sign in
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Showing preview experiences
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Show one sample card */}
          {showSample && (
            <ExperienceCard
              key={filteredSamples[0].id}
              experience={filteredSamples[0]}
              userVote={null}
              onVote={() => signInWithGoogle()}
            />
          )}

          {/* Show blurred cards */}
          <BlurredExperienceCard onSignIn={signInWithGoogle} />
          <BlurredExperienceCard onSignIn={signInWithGoogle} />
          
          {/* Show more blurred cards on larger screens */}
          <div className="hidden lg:block">
            <BlurredExperienceCard onSignIn={signInWithGoogle} />
          </div>
          <div className="hidden lg:block">
            <BlurredExperienceCard onSignIn={signInWithGoogle} />
          </div>
          <div className="hidden lg:block">
            <BlurredExperienceCard onSignIn={signInWithGoogle} />
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Explore Experiences</h1>
        <p className="text-muted-foreground">
          Discover real stories from seniors who&apos;ve been there
        </p>
      </div>

      {/* Search & Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by company, role, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Desktop Filters */}
        <div className="hidden md:flex gap-3">
          <Select
            value={experienceType}
            onValueChange={(value) =>
              setExperienceType(value as ExperienceType | "ALL")
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {typeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <option.icon className="h-4 w-4" />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={(value) =>
              setSortBy(value as "RECENT" | "UPVOTES" | "COMMENTS")
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="icon" onClick={resetFilters}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Mobile Filter Button */}
        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 justify-center">
                  !
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-6">
          {experienceType !== "ALL" && (
            <Badge variant="secondary" className="gap-1 pr-1">
              {typeOptions.find((t) => t.value === experienceType)?.label}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 hover:bg-transparent"
                onClick={() => setExperienceType("ALL")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {searchQuery && (
            <Badge variant="secondary" className="gap-1 pr-1">
              Search: {searchQuery}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 hover:bg-transparent"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}

      {/* Results */}
      {!user ? (
        renderGuestView()
      ) : loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ExperienceCardSkeleton key={i} />
          ))}
        </div>
      ) : experiences.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No experiences found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? `No results for "${searchQuery}". Try adjusting your search.`
                : "No experiences match your current filters. Be the first to share!"}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={resetFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            Showing {experiences.length} experiences
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiences.map((experience) => (
              <ExperienceCard
                key={experience.id}
                experience={experience}
                userVote={userVotes[experience.id] || null}
                onVote={(type) => handleVote(experience.id, type)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function ExperiencesPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ExperienceCardSkeleton key={i} />
            ))}
          </div>
        </div>
      }
    >
      <ExperiencesContent />
    </Suspense>
  );
}
