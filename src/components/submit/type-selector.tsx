"use client";

import { ExperienceType } from "@/types";
import { useExperienceFormStore } from "@/store/experience-store";
import { Card, CardContent } from "@/components/ui/card";
import {
  Briefcase,
  Building2,
  RefreshCw,
  BookOpen,
  FileText,
  ArrowRight,
} from "lucide-react";

const experienceTypes: {
  type: ExperienceType;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  examples: string[];
}[] = [
  {
    type: "INTERVIEW",
    title: "Interview Experience",
    description: "Share your interview journey with round-by-round details",
    icon: Briefcase,
    color: "from-blue-500/20 to-blue-600/5 hover:from-blue-500/30 hover:to-blue-600/10",
    examples: ["Campus placement", "Off-campus interview", "Internship interview"],
  },
  {
    type: "WORK",
    title: "Work Experience",
    description: "Share insights about team, role, culture, and growth",
    icon: Building2,
    color: "from-green-500/20 to-green-600/5 hover:from-green-500/30 hover:to-green-600/10",
    examples: ["Day in the life", "Team culture", "Growth opportunities"],
  },
  {
    type: "TRANSITION",
    title: "Transition Story",
    description: "Share your role switch, domain change, or career pivot",
    icon: RefreshCw,
    color: "from-orange-500/20 to-orange-600/5 hover:from-orange-500/30 hover:to-orange-600/10",
    examples: ["Dev to PM", "Backend to Data Science", "Service to Product"],
  },
  {
    type: "LEARNING",
    title: "Learning Journey",
    description: "Share how you learned a new skill from scratch",
    icon: BookOpen,
    color: "from-purple-500/20 to-purple-600/5 hover:from-purple-500/30 hover:to-purple-600/10",
    examples: ["DSA preparation", "System Design", "New programming language"],
  },
  {
    type: "OPEN",
    title: "Open Experience",
    description: "Share any other career-related experience",
    icon: FileText,
    color: "from-gray-500/20 to-gray-600/5 hover:from-gray-500/30 hover:to-gray-600/10",
    examples: ["Hackathon", "Open source contribution", "Freelancing"],
  },
];

export function TypeSelector() {
  const { setExperienceType } = useExperienceFormStore();

  return (
    <div className="space-y-4">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold mb-2">
          What would you like to share?
        </h2>
        <p className="text-muted-foreground">
          Select the type that best matches your experience
        </p>
      </div>

      <div className="grid gap-4">
        {experienceTypes.map((item) => (
          <Card
            key={item.type}
            className={`group cursor-pointer transition-all duration-300 hover:shadow-md border-2 border-transparent hover:border-primary/20 bg-gradient-to-r ${item.color}`}
            onClick={() => setExperienceType(item.type)}
          >
            <CardContent className="p-5 flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-background/80 flex items-center justify-center">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {item.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.examples.map((example) => (
                    <span
                      key={example}
                      className="text-xs px-2 py-0.5 rounded-full bg-background/60 text-muted-foreground"
                    >
                      {example}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

