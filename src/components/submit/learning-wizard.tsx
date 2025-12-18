"use client";

import { useState } from "react";
import { useExperienceFormStore } from "@/store/experience-store";
import { LearningJourney } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Plus, X, BookOpen, Clock, Rocket, Lightbulb, Trophy } from "lucide-react";

interface LearningWizardProps {
  step: number;
}

const categories = [
  "Data Structures & Algorithms",
  "Web Development",
  "Mobile Development",
  "Data Science & ML",
  "Cloud & DevOps",
  "System Design",
  "Cybersecurity",
  "Blockchain",
  "Game Development",
  "Competitive Programming",
  "UI/UX Design",
  "Other",
];

export function LearningWizard({ step }: LearningWizardProps) {
  const { formData, updateFormData, nextStep } = useExperienceFormStore();
  const data = formData as Partial<LearningJourney>;

  const [resources, setResources] = useState<string[]>(data.resources || []);
  const [projects, setProjects] = useState<string[]>(data.projectsBuilt || []);
  const [newResource, setNewResource] = useState("");
  const [newProject, setNewProject] = useState("");

  const addResource = () => {
    if (newResource.trim()) {
      const updated = [...resources, newResource.trim()];
      setResources(updated);
      updateFormData("resources", updated);
      setNewResource("");
    }
  };

  const removeResource = (index: number) => {
    const updated = resources.filter((_, i) => i !== index);
    setResources(updated);
    updateFormData("resources", updated);
  };

  const addProject = () => {
    if (newProject.trim()) {
      const updated = [...projects, newProject.trim()];
      setProjects(updated);
      updateFormData("projectsBuilt", updated);
      setNewProject("");
    }
  };

  const removeProject = (index: number) => {
    const updated = projects.filter((_, i) => i !== index);
    setProjects(updated);
    updateFormData("projectsBuilt", updated);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.skill && data.category && data.duration;
      case 2:
        return resources.length > 0 && data.learningPath;
      case 3:
        return data.challengesFaced;
      case 4:
        return data.outcomes && data.tips;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed()) {
      nextStep();
    }
  };

  // Step 1: Skill & Category
  if (step === 1) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">What did you learn?</h2>
            <p className="text-sm text-muted-foreground">The skill or topic you mastered</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="skill">Skill / Topic</Label>
            <Input
              id="skill"
              placeholder="e.g., React.js, Machine Learning, DSA"
              value={data.skill || ""}
              onChange={(e) => updateFormData("skill", e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label>Category</Label>
            <Select
              value={data.category}
              onValueChange={(value) => updateFormData("category", value)}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="duration">How long did it take?</Label>
            <Input
              id="duration"
              placeholder="e.g., 3 months, 6 weeks"
              value={data.duration || ""}
              onChange={(e) => updateFormData("duration", e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>

        <Button onClick={handleNext} disabled={!canProceed()} className="w-full gap-2">
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Step 2: Resources & Path
  if (step === 2) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Rocket className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Resources & Path</h2>
            <p className="text-sm text-muted-foreground">How did you learn it?</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Resources Used</Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                placeholder="Add a resource (course, book, website)..."
                value={newResource}
                onChange={(e) => setNewResource(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addResource()}
              />
              <Button type="button" size="icon" onClick={addResource}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {resources.map((resource, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {resource}
                  <button onClick={() => removeResource(index)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              e.g., Striver&apos;s SDE Sheet, freeCodeCamp, CS50, Neetcode
            </p>
          </div>

          <div>
            <Label htmlFor="path">Your Learning Path</Label>
            <Textarea
              id="path"
              placeholder="Describe your learning journey step by step. What did you start with? What order did you follow? What was your daily routine?"
              value={data.learningPath || ""}
              onChange={(e) => updateFormData("learningPath", e.target.value)}
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

  // Step 3: Challenges & Projects
  if (step === 3) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Lightbulb className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Challenges & Projects</h2>
            <p className="text-sm text-muted-foreground">What you built and struggled with</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="challenges">Challenges Faced</Label>
            <Textarea
              id="challenges"
              placeholder="What was difficult? Where did you get stuck? Any frustrations or breakthroughs?"
              value={data.challengesFaced || ""}
              onChange={(e) => updateFormData("challengesFaced", e.target.value)}
              className="mt-1.5 min-h-[120px]"
            />
          </div>

          <div>
            <Label>Projects Built (optional)</Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                placeholder="Add a project..."
                value={newProject}
                onChange={(e) => setNewProject(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addProject()}
              />
              <Button type="button" size="icon" onClick={addProject}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {projects.map((project, index) => (
                <Badge key={index} variant="secondary" className="gap-1 bg-primary/10 text-primary">
                  {project}
                  <button onClick={() => removeProject(index)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <Button onClick={handleNext} disabled={!canProceed()} className="w-full gap-2">
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Step 4: Outcomes & Tips
  if (step === 4) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Outcomes & Tips</h2>
            <p className="text-sm text-muted-foreground">Results and advice for others</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="outcomes">What were the outcomes?</Label>
            <Textarea
              id="outcomes"
              placeholder="Did you get a job? Build something cool? Win a competition? Feel more confident? Be specific!"
              value={data.outcomes || ""}
              onChange={(e) => updateFormData("outcomes", e.target.value)}
              className="mt-1.5 min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="tips">Tips for Others</Label>
            <Textarea
              id="tips"
              placeholder="What would you tell someone starting this learning journey today? What would you do differently?"
              value={data.tips || ""}
              onChange={(e) => updateFormData("tips", e.target.value)}
              className="mt-1.5 min-h-[120px]"
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

