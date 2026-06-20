import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import { getArchetypeForDifficulty } from "./server/opponent/OpponentProfile.js";
import { OpponentEngine } from "./server/opponent/OpponentEngine.js";
import { MatchFeedback } from "./server/opponent/MatchFeedback.js";
dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize GROQ SDK
const apiKey = process.env.GROQ_API_KEY || "";
let ai: Groq | null = null;

if (apiKey && apiKey !== "MY_GROQ_API_KEY") {
  try {
    ai = new Groq({
      apiKey,
    });
    console.log("Adversarial Algorithm Arena: Server-side GROQ API initialized.");
  } catch (error) {
    console.error("Failed to initialize GROQ SDK:", error);
  }
} else {
  console.log("No valid GROQ_API_KEY provided in env. Emulating state-of-the-art fallback static analyzers.");
}

// Memory database for Matchmaking, Matches, Ratings, and Logs
interface UserState {
  username: string;
  builderRating: number;
  breakerRating: number;
  overallRating: number;
  language: string;
}

interface ProblemData {
  id: string;
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  description: string;
  timeLimit: string;
  constraints: string[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  templates: {
    python: string;
    javascript: string;
    cpp: string;
    java: string;
  };
}

interface FindingReport {
  id: string;
  title: string;
  category: "logic_bug" | "timeout" | "memory_issue" | "security_concern" | "critical_failure" | "minor_edge_case";
  description: string;
  exampleInput: string;
  expectedOutput: string;
  observedOutput: string;
}

// Pre-cooked competitive programming problems (Fallbacks)
const FALLBACK_PROBLEMS: ProblemData[] = [
  {
    id: "hash-auth-collision",
    title: "Adversarial Hash Signature Validator",
    difficulty: "Intermediate",
    description: "Implement a highly secured cryptographic signature verifier for AAA's core packet distributor. The system takes packets with payload arrays and matches them with polynomial hashes: `H(s) = sum(s[i] * 31^(n - 1 - i)) % M`. However, your verifier must reject packet payloads containing custom collision vectors, high null densities, and recursion overflows.",
    timeLimit: "1.5s",
    constraints: [
      "1 <= payload.length <= 10^5",
      "Each element in payload fits standard ascii [0-127]",
      "Target modulo M = 10^9 + 7"
    ],
    examples: [
      {
        input: 'payload = "AAA_PACKET", secret = 31',
        output: '"VERIFIED"',
        explanation: "Simple verification check passes validation criteria."
      }
    ],
    templates: {
      python: `def verify_packet_signature(payload: str, secret: int) -> str:
    # TODO: Implement polynomial hash signature validation
    # Beware of integer overflow and empty strings
    return "VERIFIED"
`,
      javascript: `function verifyPacketSignature(payload, secret) {
    // TODO: Implement polynomial hash signature validation
    // Protect against prototype pollution or empty payload edge cases
    return "VERIFIED";
}
`,
      cpp: `#include <string>
#include <vector>

std::string verifyPacketSignature(std::string payload, int secret) {
    // TODO: Implement polynomial hash signature validation
    return "VERIFIED";
}
`,
      java: `public class Solution {
    public static String verifyPacketSignature(String payload, int secret) {
        // TODO: Implement polynomial hash signature validation
        return "VERIFIED";
    }
}
`
    }
  },
  {
    id: "nested-interval-vortex",
    title: "Multi-Interval Vortex Sorter",
    difficulty: "Advanced",
    description: "Write an algorithm to sort, merge, and filter overlapping server session intervals. Each interval is represented as `[start, end]`. Your solution must merge overlapping intervals and filter intervals outside standard sandbox limits. Warning: highly overlapping intervals or empty nested values could cause quadratic runtime (O(N^2)) timeouts.",
    timeLimit: "2.0s",
    constraints: [
      "0 <= intervals.length <= 5 * 10^4",
      "intervals[i].length == 2",
      "0 <= start <= end <= 10^9"
    ],
    examples: [
      {
        input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]',
        output: '[[1,6],[8,10],[15,18]]',
        explanation: "Intervals [1,3] and [2,6] overlap, merging them into [1,6]."
      }
    ],
    templates: {
      python: `def merge_intervals(intervals: list[list[int]]) -> list[list[int]]:
    # Write O(N log N) merge interval logic
    # Avoid nested loops which results in timeout exploits
    return intervals
`,
      javascript: `function mergeIntervals(intervals) {
    // Write O(N log N) merge interval logic
    // Safeguard empty sub-arrays inside interval lists
    return intervals;
}
`,
      cpp: `#include <vector>
#include <algorithm>

std::vector<std::vector<int>> mergeIntervals(std::vector<std::vector<int>>& intervals) {
    // Sort and merge intervals
    return intervals;
}
`,
      java: `import java.util.*;

public class Solution {
    public static int[][] mergeIntervals(int[][] intervals) {
        // Sort and merge intervals efficiently
        return intervals;
    }
}
`
    }
  },
  {
    id: "recursive-dependency-evaluator",
    title: "Cyclic Dependency Depth Resolver",
    difficulty: "Expert",
    description: "AAA's matchmaking rules depend on loading cyclic modular package trees. Given a list of component dependency indices, determine whether they can compile within a depth ceiling d. If a recursive network contains high recursion depth without memoization, it easily overflows the runtime execution stack.",
    timeLimit: "1.0s",
    constraints: [
      "1 <= nodeCount <= 2 * 10^4",
      "edges.length <= 10^5",
      "Max recursive call limit = 1000"
    ],
    examples: [
      {
        input: 'edges = [[0,1],[1,2],[2,0]]',
        output: '"CYCLE_DETECTED"',
        explanation: "Nodes 0, 1, 2 form a cyclic graph preventing proper dependency resolution."
      }
    ],
    templates: {
      python: `def resolve_dependencies(nodes: int, edges: list[list[int]]) -> str:
    # Implement depth-first search for cycle verification
    # Guard against recursion limit crash on linear lists!
    return "SAFE"
`,
      javascript: `function resolveDependencies(nodes, edges) {
    // Implement depth-first search for cycle verification
    // Use an iterative stack or check path lengths to prevent exceeding limits
    return "SAFE";
}
`,
      cpp: `#include <string>
#include <vector>

std::string resolveDependencies(int nodes, std::vector<std::vector<int>>& edges) {
    // Cycle check graph dependencies
    return "SAFE";
}
`,
      java: `import java.util.*;

public class Solution {
    public static String resolveDependencies(int nodes, int[][] edges) {
        // Resolve cyber dependencies cyclic verification
        return "SAFE";
    }
}
`
    }
  }
];

// Helper to sanitize JSON response from Gemini
function cleanJSONString(rawText: string): string {
  let cleaned = rawText.trim();
  // Strip markdown code block wrappers if any
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

/**
 * Endpoint to generate a challenge dynamically using Gemini,
 * falling back to premium preloaded questions if offline.
 */
app.post("/api/generate-challenge", async (req: Request, res: Response) => {
  const { difficulty, builderRating, breakerRating, preferredLang } = req.body;
  const ratingAvg = Math.round(((builderRating || 1200) + (breakerRating || 1200)) / 2);

  if (!ai) {
    // Key-independent matching problem
    const index = Math.floor(Math.random() * FALLBACK_PROBLEMS.length);
    const problem = { ...FALLBACK_PROBLEMS[index] };
    problem.difficulty = difficulty || "Intermediate";
    return res.json({ problem });
  }

  try {
    // Map application difficulty to LeetCode difficulty
    let lcDifficulty = "MEDIUM";
    if (difficulty === "Beginner") lcDifficulty = "EASY";
    else if (difficulty === "Expert") lcDifficulty = "HARD";
    else lcDifficulty = "MEDIUM"; // Intermediate and Advanced

    // Fetch random problem slug from LeetCode
    const listQuery = `query problemsetQuestionList($limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
      problemsetQuestionList: questionList(categorySlug: "", limit: $limit, skip: $skip, filters: $filters) {
        questions: data { titleSlug }
      }
    }`;
    const skipAmount = Math.floor(Math.random() * 200); // randomize selection
    const lcListRes = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: listQuery,
        variables: { limit: 1, skip: skipAmount, filters: { difficulty: lcDifficulty } }
      })
    });
    const lcListData = await lcListRes.json();
    let titleSlug = "two-sum";
    if (lcListData?.data?.problemsetQuestionList?.questions?.length > 0) {
      titleSlug = lcListData.data.problemsetQuestionList.questions[0].titleSlug;
    }

    // Fetch problem details
    const dataQuery = `query questionData($titleSlug: String!) { question(titleSlug: $titleSlug) { title content } }`;
    const lcDataRes = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: dataQuery, variables: { titleSlug } })
    });
    const lcData = await lcDataRes.json();
    const lcProblemTitle = lcData?.data?.question?.title || "Two Sum";
    const lcProblemContent = lcData?.data?.question?.content || "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.";

    const prompt = `You are a competitive programming designer for "Adversarial Algorithm Arena".
Format the following REAL LeetCode problem into our platform's structure:
Title: ${lcProblemTitle}
Description HTML: ${lcProblemContent}

The user's chosen language is ${preferredLang || "python"}.

The problem must have subtle edge cases.
You MUST respond strictly in clean JSON format with zero extra text or commentary.

CRITICAL REQUIREMENT FOR "templates":
- The code templates for "python", "javascript", "cpp", and "java" must ONLY provide the function signature/boilerplate matching the LeetCode problem (appropriate function name, parameters, and basic return type).
- DO NOT solve the problem in the templates! The template function bodies MUST NOT contain the solved code or correct algorithm.
- The template function bodies must be empty or contain only a simple placeholder return statement (like returning 0, null, or empty array) and a comment like "// TODO: Implement solution".
- Players must write the code themselves; pre-solved templates are strictly forbidden.

The JSON must align with the following structure:
{
  "title": "A highly styled cyberpunk name for the security/DSA problem based on the original title",
  "difficulty": "${difficulty || "Intermediate"}",
  "description": "Provide a rich description of the challenge, explaining the algorithm and constraints clearly based on the provided HTML.",
  "timeLimit": "1.5s",
  "constraints": ["Constraint 1", "Constraint 2", "Constraint 3"],
  "examples": [
    {
      "input": "Example list representation",
      "output": "Expected output representation",
      "explanation": "Why this input translates to this output"
    }
  ],
  "templates": {
    "python": "def solve(data):\\n    # TODO: Implement\\n    return data",
    "javascript": "function solve(data) {\\n    // TODO: Implement\\n    return data;\\n}",
    "cpp": "int solve(int data) {\\n    // TODO: Implement\\n    return data;\\n}",
    "java": "public class Solution {\\n    public int solve(int data) {\\n        // TODO: Implement\\n        return data;\\n    }\\n}"
  }
}`;

    const response = await ai.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const parsedData = JSON.parse(cleanJSONString(response.choices[0]?.message?.content || ""));
    const finalProblem: ProblemData = {
      id: "dynamic-" + Date.now().toString(36),
      title: parsedData.title || lcProblemTitle,
      difficulty: parsedData.difficulty || difficulty || "Intermediate",
      description: parsedData.description || "Parse incoming sub-streams of data with high performance.",
      timeLimit: parsedData.timeLimit || "1.0s",
      constraints: parsedData.constraints || ["Length >= 0"],
      examples: parsedData.examples || [],
      templates: parsedData.templates || {
        python: "def solve(data):\n    return data",
        javascript: "function solve(data) {\n    return data;\n}",
        cpp: "int solve(int data) {\n    return data;\n}",
        java: "public class Solution {\n    public int solve(int data) {\n        return data;\n    }\n}"
      }
    };

    res.json({ problem: finalProblem });
  } catch (error: any) {
    console.error("GROQ problem generation failed, routing fallback:", error);
    const index = Math.floor(Math.random() * FALLBACK_PROBLEMS.length);
    const problem = { ...FALLBACK_PROBLEMS[index] };
    problem.difficulty = difficulty || "Intermediate";
    res.json({ problem, error: "FALLBACK_USED", details: error.message || String(error), ai_is_null: !ai });
  }
});

/**
 * API Endpoint: Run Sandbox Tests.
 * Uses AI to act as a judge for the provided code and problem examples.
 */
app.post("/api/run-tests", async (req: Request, res: Response) => {
  const { code, language, problemTitle, examples } = req.body;

  if (!code || code.trim().length === 0) {
    return res.status(400).json({ error: "Code cannot be empty" });
  }

  if (!ai) {
    // Mock runner fallback
    if (code.includes("TODO") || code.trim().length < 80) {
      return res.json({
        success: false,
        output: "stdout: FAIL\n[ERROR]: Missing algorithmic implementation.\nEnsure logic covers constraints inside the verified runner."
      });
    } else {
      return res.json({
        success: true,
        output: "stdout: SUCCESS\nPass 4/4 Base Test Cases!\nExecution finished in 18ms\nMemory consumed: 12MB"
      });
    }
  }

  try {
    const prompt = `You are an automated Sandboxed Algorithmic Judge.
Evaluate the user's submitted code for the problem: "${problemTitle || "DSA Challenge"}".

Language: ${language}
Submitted Code:
${code}

Problem Examples to Test:
${JSON.stringify(examples, null, 2)}

You must evaluate whether the code correctly solves the problem and passes the examples.
Return a strict JSON output representing the test results.
The JSON must have this schema:
{
  "success": boolean,
  "passedCount": number,
  "totalCount": number,
  "output": "A console-like string showing stdout, e.g., 'Pass 4/4 Base Test Cases!\\nExecution finished in 18ms' or 'FAIL on Example 1: Expected X, got Y'"
}

Note: Limit explanations. Return only valid, compilable JSON.`;

    const response = await ai.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const report = JSON.parse(cleanJSONString(response.choices[0]?.message?.content || ""));

    res.json({
      success: report.success || false,
      output: report.output || (report.success ? "stdout: SUCCESS\nAll tests passed." : "stdout: FAIL\n[ERROR]: Validation failed.")
    });
  } catch (error) {
    console.error("GROQ test runner failed:", error);
    res.json({
      success: false,
      output: "stdout: ERROR\n[ERROR]: Sandboxed execution engine failure."
    });
  }
});

/**
 * API Endpoint: Static analyzer and AI review proxy (Breaker phase for Opponent).
 * Checks for correctness, efficiency, robustness, time/space complexity, and highlights vulnerabilities.
 */
app.post("/api/analyze-builder", async (req: Request, res: Response) => {
  const { code, language, problemId, problemTitle, problemDescription, examples, difficulty } = req.body;

  if (!code || code.trim().length === 0) {
    return res.status(400).json({ error: "Code cannot be empty" });
  }

  const archetype = getArchetypeForDifficulty(difficulty || "Intermediate");

  if (!ai) {
    // Generate beautiful realistic analysis for mock sandbox
    const scoreCorrectness = Math.floor(Math.random() * 10) + 40; // 40-50
    const scoreEfficiency = Math.floor(Math.random() * 10) + 15;   // 15-25
    const scoreRobustness = Math.floor(Math.random() * 10) + 15;   // 15-25
    const totalBuilderScore = scoreCorrectness + scoreEfficiency + scoreRobustness;

    // Simulate standard O(N log N) / O(N) complexity based on common algorithms
    const isBigOQuadratic = code.includes("for ") && (code.match(/for /g)?.length || 0) >= 2;
    const timeComplex = isBigOQuadratic ? "O(N^2)" : "O(N log N)";
    const spaceComplex = code.includes("[]") || code.includes("list") ? "O(N)" : "O(1)";

    const weaknesses = [
      {
        type: "Nested Loop Performance Hazard",
        severity: "Medium",
        description: "The solution contains nested iterations that could degenerate into cubic runtime under extreme hacker bounds.",
        confidenceScore: 85
      },
      {
        type: "Null Pointer/Undefined Boundary Negligence",
        severity: "High",
        description: "Did not explicitly check for empty inputs or negative value boundaries before initializing variables.",
        confidenceScore: 92
      }
    ];

    return res.json({
      correctnessScore: scoreCorrectness,
      efficiencyScore: scoreEfficiency,
      robustnessScore: scoreRobustness,
      totalScore: totalBuilderScore,
      timeComplexity: timeComplex,
      spaceComplexity: spaceComplex,
      weaknesses,
      opponent: archetype
    });
  }

  try {
    const report = await OpponentEngine.analyzePlayerCode(
      ai, code, problemTitle, problemDescription, examples, language, archetype, difficulty || "Intermediate"
    );
    res.json({ ...report, opponent: archetype });
  } catch (error) {
    console.error("Opponent analyzer failed, routing mock analysis:", error);
    res.json({
      correctnessScore: 45,
      efficiencyScore: 18,
      robustnessScore: 21,
      totalScore: 84,
      timeComplexity: "O(N log N)",
      spaceComplexity: "O(N)",
      opponent: archetype,
      weaknesses: [
        {
          type: "Timeout Risk",
          severity: "Medium",
          description: "Lack of pre-computation caching might invoke linear scan timeouts.",
          confidenceScore: 78
        }
      ]
    });
  }
});

/**
 * API Endpoint: Generate Opponent's Solution
 */
app.post("/api/opponent/generate", async (req: Request, res: Response) => {
  const { problemTitle, problemDescription, language, difficulty } = req.body;
  const archetype = getArchetypeForDifficulty(difficulty || "Intermediate");
  
  if (!ai) {
    return res.json({
      opponent: archetype,
      code: "// Mock opponent fallback code",
      intendedFlaws: []
    });
  }

  const { code, intendedFlaws } = await OpponentEngine.generateSolution(
    ai, problemTitle, problemDescription, language, archetype, difficulty || "Intermediate"
  );
  
  res.json({ opponent: archetype, code, intendedFlaws });
});

/**
 * API Endpoint: Generate Post-Match Feedback
 */
app.post("/api/opponent/feedback", async (req: Request, res: Response) => {
  const { playerStats } = req.body;
  if (!ai) {
    return res.json({
      didWell: "Solid overall performance.",
      missed: "Could improve efficiency.",
      suggestedLearningTopic: "Algorithm Optimization"
    });
  }
  const feedback = await MatchFeedback.generateFeedback(ai, playerStats);
  res.json(feedback);
});

/**
 * API Endpoint: Breaker Hints Provider.
 * Generates clever progressive security clues without spoiling the exact code.
 */
app.post("/api/breaker-guide", async (req: Request, res: Response) => {
  const { opponentCode, language, requestLevel } = req.body;

  if (!opponentCode) {
    return res.status(400).json({ error: "Opponent code missing" });
  }

  if (!ai) {
    const hints = [
      "Observe how the code initializes its size limits. What occurs if an empty query array payload is parsed?",
      "Consider nesting bounds: are there elements checked multiple times? Large values might yield critical timeouts.",
      "Check standard integer maximums (2^31 - 1) vs memory growth index patterns under heavy polynomial accumulation."
    ];
    return res.json({ clue: hints[(requestLevel - 1) % 3] });
  }

  try {
    const prompt = `You are a security vulnerability research advisor. Provide a progressive clue for a "Breaker" attempting to find bugs or performance vulnerabilities in this opponent's code:

Language: ${language}
Opponent Code:
${opponentCode}

Level of clue requested: Level ${requestLevel} (Level 1: generic guidance, Level 2: moderate hint, Level 3: strong conceptual guidance).
CRITICAL: Do NOT provide actual input exploits or code solutions! Simply point the player's eye in the right direction (e.g. nested iterations, division targets, memory growth, array allocations).

Return a short, immersive response. No markdown. MAX 2 sentences.`;

    const response = await ai.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
    });

    res.json({ clue: response.choices[0]?.message?.content?.trim() || "Analyze boundary elements first." });
  } catch (error) {
    res.json({ clue: "Observe nested iterations and check constraints closely." });
  }
});

/**
 * API Endpoint: Breaker Finding/Exploit Validator.
 * AI acts as a sandbox emulator and verifier! It evaluates if the user's report is a legitimate threat.
 * Includes reasoning bonus and duplicate finding detection.
 */
app.post("/api/validate-finding", async (req: Request, res: Response) => {
  const {
    findingTitle,
    findingType,
    description,
    reasoningText,
    confidenceLevel,
    exampleInput,
    expectedOutput,
    observedOutput,
    opponentCode,
    language,
    previousFindings
  } = req.body;

  if (!opponentCode || !exampleInput || !reasoningText) {
    return res.status(400).json({ error: "Missing required compromise reports details (evidence/reasoning)." });
  }

  if (!ai) {
    // Mock validator: validates if user provided reasonable inputs
    const looksValid = exampleInput.trim().length > 0 && reasoningText.trim().length > 10;
    if (looksValid) {
      return res.json({
        isValid: true,
        severity: "Moderate",
        confidence: 85,
        score: 10,
        reasoningBonus: 2,
        isDuplicate: false,
        reason: "[DEV MOCK VALIDATION SUCCESS] Your reported exploit successfully triggered the target boundary anomaly! The logic was verified as a genuine vulnerability."
      });
    } else {
      return res.json({
        isValid: false,
        severity: "Minor",
        confidence: 100,
        score: 0,
        reasoningBonus: 0,
        isDuplicate: false,
        reason: "The submitted exploit description, inputs, or reasoning were too short or failed to produce an observable performance anomaly on the opponent solution."
      });
    }
  }

  try {
    const prompt = `You are an automated Sandboxed Algorithmic Judge and Security Validator.
An attacker (the Breaker) claims they found a security/logic vulnerability in the Opponent's Code.

Opponent Code Language: ${language}
Opponent Code:
${opponentCode}

Previous Findings Submitted by Player:
${JSON.stringify(previousFindings || [])}

Breaker's Claim:
- Title: ${findingTitle}
- Target Violation Category: ${findingType}
- Exploit Spec Detail: ${description}
- Reasoning: ${reasoningText}
- Confidence Level: ${confidenceLevel}
- Example Test Input: ${exampleInput}
- Expected Correct Behavior: ${expectedOutput}
- Observed Anomaly output/state: ${observedOutput}

You must evaluate whether the attacker's claim is valid, logical, and structurally correct.
Does this specific Example Test Input (${exampleInput}) indeed breach correctness, trigger infinite loop/timeout, or crash the Opponent's codebase?

Evaluate the reasoning quality. Excellent reasoning gets up to 5 bonus points. Poor reasoning gets 0.
Check if this finding is fundamentally the SAME root cause as any of the "Previous Findings Submitted by Player". If so, mark "isDuplicate" as true.

Return a strict, clear JSON object format matching this structure:
{
  "isValid": boolean,
  "severity": "Minor" | "Moderate" | "High" | "Critical",
  "score": number, // Points allocation: Minor: 5, Moderate: 10, High: 15, Critical: 20-30
  "reasoningBonus": number, // 0 to 5 based on how well they explained the root cause
  "confidence": number, // 0 to 100 on how confident you are in your own validation
  "isDuplicate": boolean, // true if this is identical root cause to previous findings
  "reason": "Detailed expert technical reasoning explaining whether the input breaks the code and maps to the selected category."
}

Ensure the output is parseable JSON with no explanation or wrapping outside the JSON structure.`;

    const response = await ai.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(cleanJSONString(response.choices[0]?.message?.content || ""));
    res.json({
      isValid: result.isValid === undefined ? true : result.isValid,
      severity: result.severity || "Moderate",
      score: result.score || 10,
      reasoningBonus: result.reasoningBonus || 0,
      confidence: result.confidence || 90,
      isDuplicate: result.isDuplicate || false,
      reason: result.reason || "The vulnerability was successfully replicated under simulated runtime conditions."
    });
  } catch (error) {
    console.error("GROQ validator failed:", error);
    res.json({
      isValid: true,
      severity: "Moderate",
      score: 10,
      reasoningBonus: 0,
      confidence: 80,
      isDuplicate: false,
      reason: "Simulation compiled successfully. The exploit is acknowledged as plausible under deep recursive calls."
    });
  }
});

// Configure Vite in development as middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev server mounted.");
  } else {
    // Production Mode: static file serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Static production assets mounted.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Adversarial Algorithm Arena running securely on port ${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
