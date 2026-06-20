import Groq from "groq-sdk";

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

export interface MatchFeedbackReport {
  didWell: string;
  missed: string;
  suggestedLearningTopic: string;
}

export class MatchFeedback {
  /**
   * Generates post-match feedback evaluating the player's overall performance.
   */
  static async generateFeedback(
    ai: Groq,
    playerStats: {
      problemTitle: string;
      builderScore: number;
      breakerScore: number;
      opponentName: string;
      playerWeaknessesFoundByOpponent: any[];
      opponentWeaknessesFoundByPlayer: any[];
    }
  ): Promise<MatchFeedbackReport> {
    
    const prompt = `You are a competitive programming coach providing post-match feedback to the player in "Adversarial Algorithm Arena".
Match Details:
- Problem: ${playerStats.problemTitle}
- Opponent: ${playerStats.opponentName}
- Player Builder Score: ${playerStats.builderScore}
- Player Breaker Score (bugs they found): ${playerStats.breakerScore}
- Weaknesses the opponent found in player's code: ${JSON.stringify(playerStats.playerWeaknessesFoundByOpponent)}
- Exploits the player found in opponent's code: ${JSON.stringify(playerStats.opponentWeaknessesFoundByPlayer)}

INSTRUCTIONS:
Evaluate the player's performance. Focus strictly on their code quality and bug hunting.
Respond strictly in valid JSON format matching this structure:
{
  "didWell": "1-2 sentences on what they did well (e.g. good optimization, found hidden bugs).",
  "missed": "1-2 sentences on what they missed (e.g. missed edge cases, algorithmic inefficiency).",
  "suggestedLearningTopic": "A specific computer science or programming topic (e.g., 'Boundary Conditions', 'Recursion Safety', 'Dynamic Programming', 'Input Validation')."
}`;

    try {
      const response = await ai.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const parsed = JSON.parse(cleanJSONString(response.choices[0]?.message?.content || "{}"));
      return {
        didWell: parsed.didWell || "Solid overall performance in the arena.",
        missed: parsed.missed || "Could improve efficiency and edge case coverage.",
        suggestedLearningTopic: parsed.suggestedLearningTopic || "Complexity Optimization"
      };
    } catch (error) {
      console.error("MatchFeedback.generateFeedback error:", error);
      return {
        didWell: "Solid overall performance in the arena.",
        missed: "Could improve efficiency and edge case coverage.",
        suggestedLearningTopic: "Complexity Optimization"
      };
    }
  }
}
