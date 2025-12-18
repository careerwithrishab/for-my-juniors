"use client";

import { useState, useEffect, useCallback } from "react";
import {
  initializeLLM,
  getLLMStatus,
  normalizeRole,
  normalizeCompany,
  suggestTopics,
  suggestImprovements,
  getAllSuggestions,
  LLMSuggestion,
  LLMStatus,
} from "@/lib/llm";

export function useLLM() {
  const [status, setStatus] = useState<LLMStatus>({
    isLoading: false,
    isReady: false,
    error: null,
    progress: 0,
  });

  const initialize = useCallback(async () => {
    setStatus((prev) => ({ ...prev, isLoading: true, progress: 0 }));
    
    const success = await initializeLLM((progress) => {
      setStatus((prev) => ({ ...prev, progress }));
    });
    
    const newStatus = getLLMStatus();
    setStatus({
      ...newStatus,
      isReady: success,
    });
    
    return success;
  }, []);

  return {
    status,
    initialize,
    normalizeRole,
    normalizeCompany,
    suggestTopics,
    suggestImprovements,
    getAllSuggestions,
  };
}

// Debounced suggestions hook
export function useLLMSuggestions(
  formData: {
    role?: string;
    companyName?: string;
    description?: string;
  },
  debounceMs: number = 500
) {
  const [suggestions, setSuggestions] = useState<LLMSuggestion[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setIsProcessing(true);
    
    const timer = setTimeout(() => {
      const newSuggestions = getAllSuggestions(formData);
      setSuggestions(newSuggestions);
      setIsProcessing(false);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [formData.role, formData.companyName, formData.description, debounceMs]);

  const applySuggestion = useCallback(
    (suggestion: LLMSuggestion): { field: string; value: string } | null => {
      switch (suggestion.type) {
        case "role":
          return { field: "role", value: suggestion.suggestion };
        case "company":
          return { field: "companyName", value: suggestion.suggestion };
        default:
          return null;
      }
    },
    []
  );

  const dismissSuggestion = useCallback((index: number) => {
    setSuggestions((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return {
    suggestions,
    isProcessing,
    applySuggestion,
    dismissSuggestion,
  };
}

