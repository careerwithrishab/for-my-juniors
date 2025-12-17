"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Building2,
  RefreshCw,
  BookOpen,
  ArrowRight,
  Users,
  Shield,
  Sparkles,
  GraduationCap,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const experienceTypes = [
  {
    type: "INTERVIEW",
    title: "Interview Experiences",
    description: "Campus & off-campus placement stories with round-by-round details",
    icon: Briefcase,
    color: "from-blue-500/20 to-blue-600/5",
    iconColor: "text-blue-500",
    count: "500+",
  },
  {
    type: "WORK",
    title: "Work Experiences",
    description: "Real insights about team culture, growth, and daily work life",
    icon: Building2,
    color: "from-green-500/20 to-green-600/5",
    iconColor: "text-green-500",
    count: "300+",
  },
  {
    type: "TRANSITION",
    title: "Transition Stories",
    description: "Role switches, domain changes, and career pivots explained",
    icon: RefreshCw,
    color: "from-orange-500/20 to-orange-600/5",
    iconColor: "text-orange-500",
    count: "150+",
  },
  {
    type: "LEARNING",
    title: "Learning Journeys",
    description: "Skill acquisition paths from DSA to Data Science and beyond",
    icon: BookOpen,
    color: "from-purple-500/20 to-purple-600/5",
    iconColor: "text-purple-500",
    count: "400+",
  },
];

const features = [
  {
    title: "Verified Experiences",
    description: "Every post is reviewed by admins. College and company badges add credibility.",
    icon: Shield,
  },
  {
    title: "Structured Data",
    description: "Not random blog posts. Highly organized, filterable, and searchable content.",
    icon: Sparkles,
  },
  {
    title: "Community Driven",
    description: "Upvote the best experiences. Comment and engage with authors.",
    icon: Users,
  },
];

const stats = [
  { value: "10K+", label: "Experiences Shared" },
  { value: "50K+", label: "Students Helped" },
  { value: "500+", label: "Companies Covered" },
  { value: "100+", label: "Colleges Represented" },
];

export default function HomePage() {
  const { user, signInWithGoogle } = useAuth();

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-subtle" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

        <div className="container relative mx-auto px-4 py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <Badge
              variant="secondary"
              className="mb-6 px-4 py-1.5 text-sm font-medium"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Community-Driven Knowledge Platform
            </Badge>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Real Experiences from
              <span className="text-primary block mt-2">
                Seniors Who&apos;ve Been There
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Structured, verified career experiences to help you make informed
              decisions. From interviews to work life, learn from those who&apos;ve
              walked the path.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/experiences">
                <Button size="lg" className="gap-2 px-8">
                  Explore Experiences
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              {!user && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={signInWithGoogle}
                  className="gap-2"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border/50 bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Types */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Explore By Experience Type
          </h2>
          <p className="text-muted-foreground">
            Every experience is categorized and structured for easy discovery.
            Find exactly what you&apos;re looking for.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {experienceTypes.map((item) => (
            <Link key={item.type} href={`/experiences?type=${item.type}`}>
              <Card className="group h-full hover:shadow-lg transition-all duration-300 hover:border-primary/30 overflow-hidden">
                <CardContent className="p-6">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4`}
                  >
                    <item.icon className={`h-6 w-6 ${item.iconColor}`} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {item.description}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {item.count} experiences
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 border-y border-border/50">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Why For My Juniors?
            </h2>
            <p className="text-muted-foreground">
              We&apos;re not just another experience sharing platform. Here&apos;s what
              makes us different.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="text-center p-6 rounded-2xl bg-background border border-border/50"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">Share Your Experience</h2>
          <p className="text-muted-foreground">
            Help juniors by sharing your journey. It only takes a few minutes.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Sign In",
                description: "Use your Google account to get started. College emails get a verified badge.",
                icon: GraduationCap,
              },
              {
                step: "2",
                title: "Fill the Form",
                description: "Our step-by-step wizard makes it easy. One question at a time.",
                icon: CheckCircle2,
              },
              {
                step: "3",
                title: "Get Published",
                description: "Admin reviews and publishes. Your experience helps thousands.",
                icon: TrendingUp,
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/submit">
              <Button size="lg" className="gap-2">
                Share Your Experience
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent">
          <CardContent className="p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to make informed career decisions?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of students learning from real experiences. It&apos;s
              free, community-driven, and built for you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/experiences">
                <Button size="lg" className="gap-2">
                  Start Exploring
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              {!user && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={signInWithGoogle}
                >
                  Create Account
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
