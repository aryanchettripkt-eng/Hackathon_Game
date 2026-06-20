import Groq from "groq-sdk";
import { OpponentArchetype } from "./OpponentProfile.js";
import { DifficultyController } from "./DifficultyController.js";

// Helper to sanitize JSON response from Gemini/Groq
function cleanJSONString(rawText: string): string {
  let cleaned = rawText.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

export class OpponentEngine {
  /**
   * Generates the opponent's flawed solution for the Builder phase.
   */
  static async generateSolution(
    ai: Groq,
    problemTitle: string,
    problemDescription: string,
    language: string,
    archetype: OpponentArchetype,
    difficulty: string
  ): Promise<{ code: string; intendedFlaws: string[] }> {
    const builderConfig = DifficultyController.getBuilderConfig(difficulty);
    
    // Expert AI has 0 flaws usually, but occasionally 1
    let numFlaws = Math.floor(Math.random() * (builderConfig.flawCountMax - builderConfig.flawCountMin + 1)) + builderConfig.flawCountMin;
    if (difficulty === "Expert" && Math.random() < 0.2) {
      numFlaws = 1;
    }

    const flawThemes = [
      "off-by-one errors in loops",
      "inefficient O(n^2) nested loops instead of O(n)",
      "missing null or empty array checks",
      "improper handling of negative numbers",
      "ignoring standard boundary cases",
      "using wrong variable in inner loop",
      "memory leaks by unnecessary array duplication"
    ];
    const randomTheme = flawThemes[Math.floor(Math.random() * flawThemes.length)];

    const prompt = `You are playing the role of an AI coding opponent named "${archetype.name}" in the "Adversarial Algorithm Arena".
Your task is to write a solution for the following problem in ${language}:
Title: ${problemTitle}
Description: ${problemDescription}

Opponent Profile:
- Builder Skill: ${archetype.builderSkill}
- Traits: ${archetype.traits.join(", ")}
- Typical Mistakes: ${archetype.typicalMistakes.join(", ")}

INSTRUCTIONS:
You MUST write a functional-looking solution, BUT you must intentionally inject EXACTLY ${numFlaws} subtle flaw(s)/bug(s) into the code based on your typical mistakes. 
To keep things interesting, focus on this specific theme for the flaw(s): "${randomTheme}".
If ${numFlaws} is 0, write a perfect optimal solution.
Do NOT leave comments indicating where the flaw is. Make it look like a genuine human mistake.

Respond strictly in valid JSON format:
{
  "code": "The raw code string",
  "intendedFlaws": ["A brief description of the flaw injected, or empty if 0"]
}`;

    try {
      const response = await ai.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const parsed = JSON.parse(cleanJSONString(response.choices[0]?.message?.content || "{}"));
      return {
        code: parsed.code || "// Opponent failed to generate code.",
        intendedFlaws: parsed.intendedFlaws || []
      };
    } catch (error) {
      console.error("OpponentEngine.generateSolution error:", error);
      return { code: "// Fallback code due to error", intendedFlaws: [] };
    }
  }

  /**
   * AI Breaker Phase: Analyzes player code and finds weaknesses based on a search budget.
   */
  static async analyzePlayerCode(
    ai: Groq,
    playerCode: string,
    problemTitle: string,
    problemDescription: string,
    examples: any[],
    language: string,
    archetype: OpponentArchetype,
    difficulty: string
  ): Promise<any> {
    const breakerConfig = DifficultyController.getBreakerConfig(difficulty);
    
    const prompt = `You are an AI opponent named "${archetype.name}" reviewing the player's code in the "Adversarial Algorithm Arena".
Problem: ${problemTitle}
Description: ${problemDescription || "Solve the algorithmic challenge."}
Examples/Tests: ${JSON.stringify(examples || [])}
Language: ${language}
Player Code:
${playerCode}

Opponent Profile:
- Breaker Skill: ${archetype.breakerSkill}
- Focus Area: ${archetype.focusArea}

INSTRUCTIONS:
You must analyze the player's code and RATE it based on the following preestablished measurements:
1. correctnessScore (0 to 50): Does the code actually solve the problem description and pass the examples? Deduct points heavily for logic bugs.
2. efficiencyScore (0 to 25): Is the time/space complexity optimal for this problem? Deduct points for suboptimal big-O.
3. robustnessScore (0 to 25): Does it handle edge cases (empty inputs, large bounds)? Deduct points if missing.

Also, find bugs/inefficiencies based on your Focus Area: ${archetype.focusArea}.
Based on your detection probability of ${breakerConfig.detectionProbability * 100}%, you might miss things.
You can return a MAXIMUM of ${breakerConfig.likelyFindingsMax} weaknesses. If the code is perfect, return 0.
For each weakness you find, assign a "confidenceScore" between 0 and 100 representing how sure you are.

Respond strictly in valid JSON format matching this structure:
{
  "correctnessScore": number (0 to 50),
  "efficiencyScore": number (0 to 25),
  "robustnessScore": number (0 to 25),
  "timeComplexity": "e.g. O(N)",
  "spaceComplexity": "e.g. O(1)",
  "weaknesses": [
    {
      "type": "string",
      "severity": "Low | Medium | High",
      "description": "string",
      "confidenceScore": number (0-100)
    }
  ]
}`;

    try {
      const response = await ai.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const report = JSON.parse(cleanJSONString(response.choices[0]?.message?.content || "{}"));
      
      // Simulate search budget / detection probability
      let finalWeaknesses = [];
      if (report.weaknesses && Array.isArray(report.weaknesses)) {
        for (const w of report.weaknesses) {
          // If random value is within detection probability, the AI "finds" it
          if (Math.random() <= breakerConfig.detectionProbability) {
            finalWeaknesses.push(w);
          }
        }
        // Limit to likelyFindingsMax
        if (finalWeaknesses.length > breakerConfig.likelyFindingsMax) {
          finalWeaknesses = finalWeaknesses.slice(0, breakerConfig.likelyFindingsMax);
        }
      }

      report.weaknesses = finalWeaknesses;
      report.totalScore = (report.correctnessScore || 40) + (report.efficiencyScore || 20) + (report.robustnessScore || 20);

      return report;
    } catch (error) {
      console.error("OpponentEngine.analyzePlayerCode error:", error);
      return {
        correctnessScore: 40,
        efficiencyScore: 20,
        robustnessScore: 20,
        totalScore: 80,
        timeComplexity: "O(N log N)",
        spaceComplexity: "O(N)",
        weaknesses: []
      };
    }
  }
}
