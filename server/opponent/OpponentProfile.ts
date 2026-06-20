export interface OpponentArchetype {
  id: string;
  name: string;
  builderSkill: "Beginner" | "Medium" | "High" | "Very High";
  breakerSkill: "Beginner" | "Medium" | "High" | "Very High";
  traits: string[];
  typicalMistakes: string[];
  focusArea: string; // Used for Breaker logic
}

export const CIPHER: OpponentArchetype = {
  id: "cipher",
  name: "CIPHER",
  builderSkill: "High",
  breakerSkill: "Medium",
  traits: [
    "Writes efficient algorithms",
    "Frequently misses edge cases",
    "Sometimes forgets empty inputs",
    "Rarely validates unusual cases"
  ],
  typicalMistakes: ["Empty arrays", "Boundary values", "Duplicate handling"],
  focusArea: "efficiency"
};

export const GLITCH: OpponentArchetype = {
  id: "glitch",
  name: "GLITCH",
  builderSkill: "Medium",
  breakerSkill: "High",
  traits: [
    "Excellent bug hunter",
    "Sometimes submits inefficient solutions",
    "Overcomplicates logic"
  ],
  typicalMistakes: ["O(n²) solutions", "Unnecessary memory usage"],
  focusArea: "strange edge cases"
};

export const SENTINEL: OpponentArchetype = {
  id: "sentinel",
  name: "SENTINEL",
  builderSkill: "Medium",
  breakerSkill: "Medium",
  traits: ["Balanced player", "Makes few mistakes", "No specialization"],
  typicalMistakes: ["Standard logic bugs", "Minor edge cases"],
  focusArea: "robustness"
};

export const VECTOR: OpponentArchetype = {
  id: "vector",
  name: "VECTOR",
  builderSkill: "Very High",
  breakerSkill: "Medium",
  traits: [
    "Optimization specialist",
    "Strong time complexity",
    "Occasionally overlooks corner cases"
  ],
  typicalMistakes: ["Over-optimization causing logic bugs", "Corner cases"],
  focusArea: "optimization"
};

export const PHANTOM: OpponentArchetype = {
  id: "phantom",
  name: "PHANTOM",
  builderSkill: "Very High",
  breakerSkill: "Very High",
  traits: [
    "Endgame opponent",
    "Rarely makes mistakes",
    "Still must not be perfect"
  ],
  typicalMistakes: ["Highly obscure edge cases", "Complex hidden bugs"],
  focusArea: "all categories"
};

export const ALL_ARCHETYPES = [CIPHER, GLITCH, SENTINEL, VECTOR, PHANTOM];

/**
 * Helper to select an archetype based on the selected match difficulty.
 * If random selection is preferred across difficulties, this logic can be adjusted.
 */
export function getArchetypeForDifficulty(difficulty: string): OpponentArchetype {
  switch (difficulty) {
    case "Beginner":
      return [CIPHER, GLITCH, SENTINEL][Math.floor(Math.random() * 3)];
    case "Intermediate":
      return [CIPHER, GLITCH, SENTINEL, VECTOR][Math.floor(Math.random() * 4)];
    case "Advanced":
      return [VECTOR, PHANTOM][Math.floor(Math.random() * 2)];
    case "Expert":
      return PHANTOM;
    default:
      return SENTINEL;
  }
}
