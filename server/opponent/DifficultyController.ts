export interface BuilderDifficultyConfig {
  flawCountMin: number;
  flawCountMax: number;
  examples: string[];
}

export interface BreakerDifficultyConfig {
  detectionProbability: number; // 0 to 1
  likelyFindingsMax: number;
}

export class DifficultyController {
  
  static getBuilderConfig(difficulty: string): BuilderDifficultyConfig {
    switch (difficulty) {
      case "Beginner":
        return {
          flawCountMin: 2,
          flawCountMax: 4,
          examples: ["O(n²)", "off-by-one", "empty input failure"]
        };
      case "Intermediate":
        return {
          flawCountMin: 1,
          flawCountMax: 2,
          examples: ["one hidden edge case", "one inefficiency"]
        };
      case "Advanced":
        return {
          flawCountMin: 0,
          flawCountMax: 1,
          examples: ["rare edge case", "subtle inefficiency"]
        };
      case "Expert":
        return {
          flawCountMin: 0,
          flawCountMax: 0, // occasionally 1, managed in the engine
          examples: ["one hidden weakness rarely"]
        };
      default:
        return { flawCountMin: 1, flawCountMax: 2, examples: [] };
    }
  }

  static getBreakerConfig(difficulty: string): BreakerDifficultyConfig {
    switch (difficulty) {
      case "Beginner":
        return { detectionProbability: 0.30, likelyFindingsMax: 1 };
      case "Intermediate":
        return { detectionProbability: 0.60, likelyFindingsMax: 3 };
      case "Advanced":
        return { detectionProbability: 0.80, likelyFindingsMax: 4 };
      case "Expert":
        return { detectionProbability: 0.95, likelyFindingsMax: 10 }; // Most flaws
      default:
        return { detectionProbability: 0.60, likelyFindingsMax: 2 };
    }
  }
}
