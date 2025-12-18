"use client";

import { useState } from "react";
import { useExperienceFormStore } from "@/store/experience-store";
import { OpenExperience } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Plus, X, MessageSquare, Tag, FileText } from "lucide-react";

interface OpenWizardProps {
  step: number;
}

const categories = [
  "Career Advice",
  "Industry Insights",
  "Networking",
  "Freelancing",
  "Entrepreneurship",
  "Work-Life Balance",
  "Mental Health",
  "Skill Building",
  "Productivity",
  "Interview Tips",
  "Salary Negotiation",
  "Remote Work",
  "Other",
];

export function OpenWizard({ step }: OpenWizardProps) {
  const { formData, updateFormData, nextStep } = useExperienceFormStore();
  const data = formData as Partial<OpenExperience>;

  const [takeaways, setTakeaways] = useState<string[]>(data.keyTakeaways || []);
  const [newTakeaway, setNewTakeaway] = useState("");

  const addTakeaway = () => {
    if (newTakeaway.trim()) {
      const updated = [...takeaways, newTakeaway.trim()];
      setTakeaways(updated);
      updateFormData("keyTakeaways", updated);
      setNewTakeaway("");
    }
  };

  const removeTakeaway = (index: number) => {
    const updated = takeaways.filter((_, i) => i !== index);
    setTakeaways(updated);
    updateFormData("keyTakeaways", updated);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.title && data.category;
      case 2:
        return data.content && data.content.length >= 100;
      case 3:
        return takeaways.length >= 1;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed()) {
      nextStep();
    }
  };

  // Step 1: Title & Category
  if (step === 1) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">What&apos;s your story?</h2>
            <p className="text-sm text-muted-foreground">Give it a title and category</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Why I chose startups over MNCs"
              value={data.title || ""}
              onChange={(e) => updateFormData("title", e.target.value)}
              className="mt-1.5"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Make it catchy and descriptive
            </p>
          </div>

          <div>
            <Label>Category</Label>
            <Select
              value={data.category}
              onValueChange={(value) => updateFormData("category", value)}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select a category" />
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
        </div>

        <Button onClick={handleNext} disabled={!canProceed()} className="w-full gap-2">
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Step 2: Content
  if (step === 2) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Share your thoughts</h2>
            <p className="text-sm text-muted-foreground">Write your experience or advice</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="content">Your Story</Label>
            <Textarea
              id="content"
              placeholder="Share your experience, insights, or advice. Be detailed and authentic - this could really help someone!"
              value={data.content || ""}
              onChange={(e) => updateFormData("content", e.target.value)}
              className="mt-1.5 min-h-[300px]"
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-muted-foreground">
                Minimum 100 characters
              </p>
              <p className={`text-xs ${(data.content?.length || 0) >= 100 ? "text-green-600" : "text-muted-foreground"}`}>
                {data.content?.length || 0} / 100+
              </p>
            </div>
          </div>
        </div>

        <Button onClick={handleNext} disabled={!canProceed()} className="w-full gap-2">
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Step 3: Key Takeaways
  if (step === 3) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Tag className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Key Takeaways</h2>
            <p className="text-sm text-muted-foreground">Summarize the main points</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Add Key Takeaways</Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                placeholder="Add a key point..."
                value={newTakeaway}
                onChange={(e) => setNewTakeaway(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTakeaway()}
              />
              <Button type="button" size="icon" onClick={addTakeaway}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Add at least 1 key takeaway. These help readers quickly understand the value.
            </p>
          </div>

          <div className="space-y-2">
            {takeaways.map((takeaway, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg"
              >
                <Badge variant="outline" className="shrink-0 mt-0.5">
                  {index + 1}
                </Badge>
                <p className="flex-1 text-sm">{takeaway}</p>
                <button
                  onClick={() => removeTakeaway(index)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {takeaways.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No takeaways added yet</p>
            </div>
          )}
        </div>

        <Button onClick={handleNext} disabled={!canProceed()} className="w-full gap-2">
          Review & Submit <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return null;
}

