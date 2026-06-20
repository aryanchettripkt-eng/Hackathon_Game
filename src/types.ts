/**
 * Game and User database model schemas
 */

export type LanguageCode = "python" | "javascript" | "cpp" | "java";

export interface UserStats {
  id: string;
  username: string;
  builderRating: number;
  breakerRating: number;
  overallRating: number;
  winRate: number;
  winStreak: number;
  matchesPlayed: number;
  vulnerabilitiesFound: number;
  problemsSolved: number;
  tier: "Beginner" | "Intermediate" | "Advanced" | "Expert" | "Master" | "Grandmaster";
  favoriteLanguage: LanguageCode;
  rankBadge: string;
}

export interface Problem {
  id: string;
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  description: string;
  constraints: string[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  timeLimit: string;
  templates: Record<LanguageCode, string>;
}

export interface Weakness {
  type: string;
  severity: "Low" | "Medium" | "High";
  description: string;
}

export interface BuilderAnalysisReport {
  correctnessScore: number;
  efficiencyScore: number;
  robustnessScore: number;
  totalScore: number;
  timeComplexity: string;
  spaceComplexity: string;
  weaknesses: Weakness[];
}

export interface Finding {
  id: string;
  title: string;
  category: "logic_bug" | "timeout" | "memory_issue" | "security_concern" | "critical_failure" | "minor_edge_case";
  description: string;
  exampleInput: string;
  expectedOutput: string;
  observedOutput: string;
  isValid?: boolean;
  scoreAwarded?: number;
  reasoning?: string;
  timestamp: string;
}

export interface MatchHistory {
  id: string;
  opponentName: string;
  opponentRating: number;
  problemTitle: string;
  date: string;
  result: "VICTORY" | "DEFEAT" | "DRAW";
  builderScore: number;
  breakerScore: number;
  pointsExchanged: number;
}

export interface LeaderboardRow {
  rank: number;
  username: string;
  overallRating: number;
  builderRating: number;
  breakerRating: number;
  tier: string;
  trend: "up" | "down" | "stable";
  winRate: number;
}

export interface LiveMatchState {
  id: string;
  step: number; // 1 to 8 matched steps
  problem: Problem | null;
  selectedLanguage: LanguageCode;
  opponent: {
    username: string;
    builderRating: number;
    breakerRating: number;
    overallRating: number;
    tier: string;
  } | null;
  hintLevel: number; // 0, 1, 2, 3
  hintsUnlocked: { level: number; text: string; penalty: number }[];
  builderCode: string;
  builderAnalysis: BuilderAnalysisReport | null;
  opponentCode: string;
  opponentAnalysisSnapshot: {
    correctnessScore: number;
    efficiencyScore: number;
    robustnessScore: number;
    totalScore: number;
    timeComplexity: string;
    spaceComplexity: string;
  } | null;
  breakerFindings: Finding[];
  breakerHintsUnlocked: string[];
  pointsBreakdown: {
    baseBuilder: number;
    flagsStolen: number;
    defenceBonus: number;
    precisionBonus: number;
    spamPenalty: number;
    finalBuilder: number;
    finalBreaker: number;
  } | null;
}
