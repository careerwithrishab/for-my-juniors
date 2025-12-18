"use client";

import { useState } from "react";
import { LLMSuggestion } from "@/lib/llm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  Check,
  X,
  Lightbulb,
  Building2,
  Briefcase,
  Tag,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AISuggestionsProps {
  suggestions: LLMSuggestion[];
  isProcessing: boolean;
  onApply: (suggestion: LLMSuggestion) => void;
  onDismiss: (index: number) => void;
  className?: string;
}

const suggestionIcons = {
  role: Briefcase,
  company: Building2,
  topic: Tag,
  improvement: Lightbulb,
};

const suggestionColors = {
  role: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  company: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  topic: "bg-green-500/10 text-green-600 border-green-500/20",
  improvement: "bg-amber-500/10 text-amber-600 border-amber-500/20",
};

const suggestionLabels = {
  role: "Role",
  company: "Company",
  topic: "Topic",
  improvement: "Tip",
};

export function AISuggestions({
  suggestions,
  isProcessing,
  onApply,
  onDismiss,
  className = "",
}: AISuggestionsProps) {
  const [appliedIndices, setAppliedIndices] = useState<Set<number>>(new Set());

  if (suggestions.length === 0 && !isProcessing) {
    return null;
  }

  const handleApply = (suggestion: LLMSuggestion, index: number) => {
    onApply(suggestion);
    setAppliedIndices((prev) => new Set(prev).add(index));
    setTimeout(() => {
      onDismiss(index);
      setAppliedIndices((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }, 500);
  };

  return (
    <Card className={`border-primary/20 bg-primary/5 ${className}`}>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
            {isProcessing ? (
              <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            )}
          </div>
          <span className="text-sm font-medium text-primary">AI Suggestions</span>
        </div>

        <AnimatePresence mode="popLayout">
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => {
              const Icon = suggestionIcons[suggestion.type];
              const colorClass = suggestionColors[suggestion.type];
              const label = suggestionLabels[suggestion.type];
              const isApplied = appliedIndices.has(index);

              return (
                <motion.div
                  key={`${suggestion.type}-${suggestion.original}-${index}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-start gap-2 p-2 rounded-lg border ${colorClass} ${
                    isApplied ? "opacity-50" : ""
                  }`}
                >
                  <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {label}
                      </Badge>
                      {suggestion.confidence >= 0.9 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-green-500/30 text-green-600">
                          High confidence
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm">
                      {suggestion.type === "improvement" ? (
                        suggestion.suggestion
                      ) : (
                        <>
                          <span className="text-muted-foreground line-through">
                            {suggestion.original}
                          </span>
                          {" → "}
                          <span className="font-medium">{suggestion.suggestion}</span>
                        </>
                      )}
                    </p>
                  </div>
                  {suggestion.type !== "improvement" && suggestion.type !== "topic" && (
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-green-600 hover:bg-green-500/10"
                        onClick={() => handleApply(suggestion, index)}
                        disabled={isApplied}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-muted-foreground hover:bg-muted"
                        onClick={() => onDismiss(index)}
                        disabled={isApplied}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// Compact version for inline suggestions
export function AIInlineSuggestion({
  suggestion,
  onApply,
  onDismiss,
}: {
  suggestion: LLMSuggestion;
  onApply: () => void;
  onDismiss: () => void;
}) {
  if (suggestion.type === "improvement" || suggestion.type === "topic") {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="flex items-center gap-2 mt-1.5 text-sm"
    >
      <Sparkles className="h-3.5 w-3.5 text-primary" />
      <span className="text-muted-foreground">Did you mean</span>
      <button
        onClick={onApply}
        className="font-medium text-primary hover:underline"
      >
        {suggestion.suggestion}
      </button>
      <span className="text-muted-foreground">?</span>
      <button
        onClick={onDismiss}
        className="text-muted-foreground hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

// Topic pills component
export function AITopicPills({
  topics,
  selectedTopics,
  onToggle,
}: {
  topics: LLMSuggestion[];
  selectedTopics: string[];
  onToggle: (topic: string) => void;
}) {
  const topicSuggestions = topics.filter((t) => t.type === "topic");

  if (topicSuggestions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span>Suggested topics based on your content:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {topicSuggestions.map((topic, index) => {
          const isSelected = selectedTopics.includes(topic.suggestion);
          return (
            <Badge
              key={index}
              variant={isSelected ? "default" : "outline"}
              className={`cursor-pointer transition-all ${
                isSelected
                  ? "bg-primary hover:bg-primary/90"
                  : "hover:bg-primary/10 hover:border-primary"
              }`}
              onClick={() => onToggle(topic.suggestion)}
            >
              {isSelected && <Check className="h-3 w-3 mr-1" />}
              {topic.suggestion}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}

