"use client";

// Note: Full transformers.js integration with semantic embeddings can be added later
// For now, we use efficient rule-based suggestions that work instantly

// State management for future LLM features
let isLoading = false;
let isReady = false;
let loadError: Error | null = null;

// Common role abbreviations and their expansions
const roleNormalizations: Record<string, string> = {
  "swe": "Software Engineer",
  "sde": "Software Development Engineer",
  "se": "Software Engineer",
  "fe": "Frontend Engineer",
  "be": "Backend Engineer",
  "fs": "Full Stack Engineer",
  "ml": "Machine Learning Engineer",
  "ai": "AI Engineer",
  "ds": "Data Scientist",
  "da": "Data Analyst",
  "de": "Data Engineer",
  "pm": "Product Manager",
  "tpm": "Technical Program Manager",
  "em": "Engineering Manager",
  "devops": "DevOps Engineer",
  "sre": "Site Reliability Engineer",
  "qa": "Quality Assurance Engineer",
  "ux": "UX Designer",
  "ui": "UI Designer",
  "ba": "Business Analyst",
  "sa": "Solutions Architect",
  "ta": "Technical Architect",
};

// Company name normalizations
const companyNormalizations: Record<string, string> = {
  "google": "Google",
  "microsoft": "Microsoft",
  "amazon": "Amazon",
  "meta": "Meta",
  "facebook": "Meta",
  "apple": "Apple",
  "netflix": "Netflix",
  "uber": "Uber",
  "airbnb": "Airbnb",
  "stripe": "Stripe",
  "twitter": "X (Twitter)",
  "x": "X (Twitter)",
  "linkedin": "LinkedIn",
  "salesforce": "Salesforce",
  "oracle": "Oracle",
  "ibm": "IBM",
  "flipkart": "Flipkart",
  "swiggy": "Swiggy",
  "zomato": "Zomato",
  "paytm": "Paytm",
  "phonepe": "PhonePe",
  "razorpay": "Razorpay",
  "cred": "CRED",
  "meesho": "Meesho",
  "groww": "Groww",
  "zerodha": "Zerodha",
  "ola": "Ola",
  "myntra": "Myntra",
  "dream11": "Dream11",
  "atlassian": "Atlassian",
  "adobe": "Adobe",
  "nvidia": "NVIDIA",
  "intel": "Intel",
  "qualcomm": "Qualcomm",
  "samsung": "Samsung",
  "tcs": "Tata Consultancy Services",
  "infosys": "Infosys",
  "wipro": "Wipro",
  "cognizant": "Cognizant",
  "accenture": "Accenture",
  "deloitte": "Deloitte",
  "kpmg": "KPMG",
  "ey": "Ernst & Young",
  "pwc": "PwC",
  "mckinsey": "McKinsey & Company",
  "bcg": "Boston Consulting Group",
  "bain": "Bain & Company",
};

// Skill/topic suggestions based on keywords
const topicSuggestions: Record<string, string[]> = {
  "react": ["React.js", "Frontend Development", "JavaScript", "Component Architecture"],
  "node": ["Node.js", "Backend Development", "JavaScript", "API Development"],
  "python": ["Python", "Backend Development", "Scripting", "Automation"],
  "java": ["Java", "Backend Development", "Object-Oriented Programming"],
  "dsa": ["Data Structures", "Algorithms", "Problem Solving", "Competitive Programming"],
  "leetcode": ["LeetCode", "Coding Practice", "Interview Preparation", "Algorithms"],
  "system design": ["System Design", "Scalability", "Architecture", "Distributed Systems"],
  "sql": ["SQL", "Databases", "Data Analysis", "Query Optimization"],
  "aws": ["AWS", "Cloud Computing", "DevOps", "Infrastructure"],
  "docker": ["Docker", "Containerization", "DevOps", "Microservices"],
  "kubernetes": ["Kubernetes", "Container Orchestration", "DevOps", "Cloud Native"],
  "ml": ["Machine Learning", "AI", "Data Science", "Deep Learning"],
  "nlp": ["Natural Language Processing", "AI", "Text Processing", "LLMs"],
  "api": ["API Development", "REST", "GraphQL", "Backend"],
};

export interface LLMSuggestion {
  type: "role" | "company" | "topic" | "improvement";
  original: string;
  suggestion: string;
  confidence: number;
}

export interface LLMStatus {
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  progress: number;
}

// Initialize the LLM features (rule-based suggestions work immediately)
export async function initializeLLM(
  onProgress?: (progress: number) => void
): Promise<boolean> {
  if (isReady) return true;
  if (isLoading) return false;
  
  isLoading = true;
  loadError = null;
  
  try {
    // Rule-based suggestions are ready immediately
    // Full semantic model loading can be added here later
    if (onProgress) onProgress(100);
    isReady = true;
    isLoading = false;
    return true;
  } catch (error) {
    loadError = error as Error;
    isLoading = false;
    console.error("Failed to initialize LLM:", error);
    return false;
  }
}

export function getLLMStatus(): LLMStatus {
  return {
    isLoading,
    isReady,
    error: loadError?.message || null,
    progress: isReady ? 100 : 0,
  };
}

// Normalize role titles
export function normalizeRole(input: string): LLMSuggestion | null {
  const lower = input.toLowerCase().trim();
  
  // Check for exact abbreviation matches
  for (const [abbr, full] of Object.entries(roleNormalizations)) {
    if (lower === abbr || lower.includes(abbr + " ") || lower.startsWith(abbr + "-")) {
      return {
        type: "role",
        original: input,
        suggestion: full,
        confidence: 0.95,
      };
    }
  }
  
  // Check for partial matches
  for (const [abbr, full] of Object.entries(roleNormalizations)) {
    if (lower.includes(abbr)) {
      return {
        type: "role",
        original: input,
        suggestion: input.replace(new RegExp(abbr, "gi"), full),
        confidence: 0.7,
      };
    }
  }
  
  return null;
}

// Normalize company names
export function normalizeCompany(input: string): LLMSuggestion | null {
  const lower = input.toLowerCase().trim();
  
  // Check for exact matches
  if (companyNormalizations[lower]) {
    return {
      type: "company",
      original: input,
      suggestion: companyNormalizations[lower],
      confidence: 0.98,
    };
  }
  
  // Check for partial matches
  for (const [key, full] of Object.entries(companyNormalizations)) {
    if (lower.includes(key) || key.includes(lower)) {
      return {
        type: "company",
        original: input,
        suggestion: full,
        confidence: 0.8,
      };
    }
  }
  
  // Capitalize first letter of each word for unknown companies
  const capitalized = input
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
  
  if (capitalized !== input) {
    return {
      type: "company",
      original: input,
      suggestion: capitalized,
      confidence: 0.6,
    };
  }
  
  return null;
}

// Suggest topics based on text content
export function suggestTopics(text: string): LLMSuggestion[] {
  const suggestions: LLMSuggestion[] = [];
  const lower = text.toLowerCase();
  const addedTopics = new Set<string>();
  
  for (const [keyword, topics] of Object.entries(topicSuggestions)) {
    if (lower.includes(keyword)) {
      for (const topic of topics) {
        if (!addedTopics.has(topic)) {
          suggestions.push({
            type: "topic",
            original: keyword,
            suggestion: topic,
            confidence: 0.8,
          });
          addedTopics.add(topic);
        }
      }
    }
  }
  
  return suggestions.slice(0, 8); // Limit to 8 suggestions
}

// Writing improvement suggestions
export function suggestImprovements(text: string): LLMSuggestion[] {
  const suggestions: LLMSuggestion[] = [];
  
  // Check for very short descriptions
  if (text.length < 50 && text.length > 0) {
    suggestions.push({
      type: "improvement",
      original: text,
      suggestion: "Consider adding more details to make your experience more helpful to juniors.",
      confidence: 0.9,
    });
  }
  
  // Check for lack of specifics
  if (text.length > 20 && !text.match(/\d+/)) {
    suggestions.push({
      type: "improvement",
      original: text,
      suggestion: "Adding specific numbers (rounds, duration, CTC) can make your experience more informative.",
      confidence: 0.7,
    });
  }
  
  // Check for all caps
  if (text === text.toUpperCase() && text.length > 10) {
    suggestions.push({
      type: "improvement",
      original: text,
      suggestion: "Consider using normal capitalization for better readability.",
      confidence: 0.95,
    });
  }
  
  // Check for no punctuation
  if (text.length > 100 && !text.match(/[.!?]/)) {
    suggestions.push({
      type: "improvement",
      original: text,
      suggestion: "Consider breaking your text into sentences for better readability.",
      confidence: 0.8,
    });
  }
  
  return suggestions;
}

// Semantic search using embeddings (placeholder for future transformers.js integration)
// Full implementation requires loading a model which adds ~50MB download
export async function computeEmbedding(_text: string): Promise<number[] | null> {
  // TODO: Add full transformers.js integration when needed
  // This would use: pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2")
  console.log("Semantic embeddings not yet implemented");
  return null;
}

// Compute similarity between two texts (placeholder)
export async function computeSimilarity(
  _text1: string,
  _text2: string
): Promise<number | null> {
  // TODO: Implement with actual embeddings
  return null;
}

// Get all suggestions for an experience form
export function getAllSuggestions(formData: {
  role?: string;
  companyName?: string;
  description?: string;
}): LLMSuggestion[] {
  const suggestions: LLMSuggestion[] = [];
  
  if (formData.role) {
    const roleSuggestion = normalizeRole(formData.role);
    if (roleSuggestion) suggestions.push(roleSuggestion);
  }
  
  if (formData.companyName) {
    const companySuggestion = normalizeCompany(formData.companyName);
    if (companySuggestion) suggestions.push(companySuggestion);
  }
  
  if (formData.description) {
    suggestions.push(...suggestTopics(formData.description));
    suggestions.push(...suggestImprovements(formData.description));
  }
  
  return suggestions;
}

