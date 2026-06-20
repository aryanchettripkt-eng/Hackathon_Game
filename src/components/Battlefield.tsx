import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { UserStats, Problem, LanguageCode, LiveMatchState, Finding, BuilderAnalysisReport } from "../types";
import { SAMPLE_OPPONENT_CODES } from "../data";
import { 
  Zap, Code, Shield, HelpCircle, Trophy, Sparkles, Play, Check, AlertCircle, 
  ChevronRight, RefreshCw, Layers, ArrowLeft, ArrowRight, UserCheck, Eye, Terminal, Maximize2
} from "lucide-react";

interface BattlefieldProps {
  userStats: UserStats;
  onMatchComplete: (builderMMR: number, breakerMMR: number, result: "VICTORY" | "DEFEAT" | "DRAW") => void;
  onExit: () => void;
}

export default function Battlefield({ userStats, onMatchComplete, onExit }: BattlefieldProps) {
  // Combat match state
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>("");

  // Step 1 Matchmaking fields
  const [preferredLang, setPreferredLang] = useState<LanguageCode>("python");
  const [reviewLangs, setReviewLangs] = useState<LanguageCode[]>(["python", "javascript"]);
  const [builderRating, setBuilderRating] = useState<number>(userStats.builderRating);
  const [breakerRating, setBreakerRating] = useState<number>(userStats.breakerRating);
  const [difficultyTier, setDifficultyTier] = useState<"Beginner" | "Intermediate" | "Advanced" | "Expert">("Intermediate");
  const [matchLog, setMatchLog] = useState<string[]>([]);

  // Current problem
  const [problem, setProblem] = useState<Problem | null>(null);

  // Step 3 Builder states
  const [userCode, setUserCode] = useState<string>("");
  const [liveLog, setLiveLog] = useState<string>("Click 'Run Test Cases' to verify code state locally.");
  const [hintsUnlockedCount, setHintsUnlockedCount] = useState<number>(0);
  const [hints, setHints] = useState<{ level: number; text: string; penalty: number }[]>([]);
  const [requestingHint, setRequestingHint] = useState<boolean>(false);

  // Step 4 Builder scores
  const [builderAnalysis, setBuilderAnalysis] = useState<BuilderAnalysisReport | null>(null);

  // Step 5 Code Swap states
  const [opponentCode, setOpponentCode] = useState<string>("");
  const [opponentAnalysis, setOpponentAnalysis] = useState<{
    correctnessScore: number;
    efficiencyScore: number;
    robustnessScore: number;
    totalScore: number;
    timeComplexity: string;
    spaceComplexity: string;
  } | null>(null);

  // Step 6 Breaker states
  const [findingTitle, setFindingTitle] = useState("");
  const [findingCategory, setFindingCategory] = useState<"logic_bug" | "timeout" | "memory_issue" | "security_concern" | "critical_failure" | "minor_edge_case">("logic_bug");
  const [findingDesc, setFindingDesc] = useState("");
  const [exampleInput, setExampleInput] = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");
  const [observedOutput, setObservedOutput] = useState("");
  const [findingsHistory, setFindingsHistory] = useState<Finding[]>([]);
  const [breakerHints, setBreakerHints] = useState<string[]>([]);
  const [breakerHintLevel, setBreakerHintLevel] = useState<number>(0);
  const [breakerHintText, setBreakerHintText] = useState<string>("");

  // Step 8 Score breakdowns
  const [pointsBreakdown, setPointsBreakdown] = useState<{
    baseBuilder: number;
    flagsStolen: number;
    defenceBonus: number;
    precisionBonus: number;
    spamPenalty: number;
    finalBuilder: number;
    finalBreaker: number;
  } | null>(null);

  // Helper for matchmaking execution animation
  const handleStartMatchmaking = async () => {
    setLoading(true);
    setMatchLog([
      "🔄 Initializing secure AAA socket connection...",
      `⚡ Prefer: ${preferredLang.toUpperCase()} | Review: ${reviewLangs.map(l => l.toUpperCase()).join(", ")}`,
      "🌐 Scanning concurrent queue for compatible peer ratings matching bounds...",
    ]);

    // Simulate match connection delays with diagnostic logging
    setTimeout(() => {
      setMatchLog(prev => [
        ...prev,
        "✔ Found Player: 'null_pointer_jockey' (1450 Overall MMR)",
        "✔ Languages Check: Opponent is coding in Python and understands Python & Javascript",
        "🟢 MATCH ALLOWED. Synchronizing secure sandboxed seed...",
      ]);
    }, 1200);

    setTimeout(async () => {
      try {
        // Fetch AI Challenge from Gemini
        const response = await fetch("/api/generate-challenge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            difficulty: difficultyTier,
            builderRating: builderRating,
            breakerRating: breakerRating,
            preferredLang: preferredLang
          })
        });

        const data = await response.json();
        if (data.problem) {
          setProblem(data.problem);
          // Set initial user Code template
          const selectedTemplate = data.problem.templates?.[preferredLang] || "// Write secure code";
          setUserCode(selectedTemplate);
          setStep(2);
        } else {
          throw new Error("Could not construct algorithmic seed.");
        }
      } catch (err) {
        console.error("Matchmaking problem seed failed:", err);
        setErrorText("Server seed verification error. Reloading local fallback.");
      } finally {
        setLoading(false);
      }
    }, 2800);
  };

  // Lock target challenge and enter solve mode
  const handleProceedToBuild = () => {
    setStep(3);
    setLiveLog("Running environment: AAA Dynamic Container [v3.1.2]\nSandbox initial state: Operational.");
  };

  // Run code execution via AI judge endpoint
  const handleRunTestCases = async () => {
    setLiveLog("Executing code check against core verification tests...");
    setLoading(true);
    try {
      const resp = await fetch("/api/run-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: userCode,
          language: preferredLang,
          problemTitle: problem?.title,
          examples: problem?.examples
        })
      });
      const data = await resp.json();
      setLiveLog(data.output || "stdout: Execution completed.");
    } catch (err) {
      console.error(err);
      setLiveLog("stdout: ERROR\n[ERROR]: Network or execution failure.");
    } finally {
      setLoading(false);
    }
  };

  // Request Level Hints
  const handleRequestHint = async () => {
    if (hintsUnlockedCount >= 3) return;
    setRequestingHint(true);
    const nextLevel = hintsUnlockedCount + 1;
    const penalty = nextLevel === 1 ? 2 : nextLevel === 2 ? 5 : 10;

    try {
      const resp = await fetch("/api/breaker-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opponentCode: userCode, // using current code to scan
          language: preferredLang,
          requestLevel: nextLevel
        })
      });
      const data = await resp.json();
      const text = data.clue || "Analyze maximum input sizes and ensure you check boundary cases first.";
      
      setHints(prev => [...prev, { level: nextLevel, text, penalty }]);
      setHintsUnlockedCount(nextLevel);
    } catch (err) {
      setHints(prev => [...prev, { level: nextLevel, text: "Explore optimal O(N log N) divide & conquer pattern.", penalty }]);
      setHintsUnlockedCount(nextLevel);
    } finally {
      setRequestingHint(false);
    }
  };

  // Submit secure builder defense code
  const handleSubmitBuilderCode = async () => {
    setLoading(true);
    try {
      const resp = await fetch("/api/analyze-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: userCode,
          language: preferredLang,
          problemId: problem?.id,
          problemTitle: problem?.title
        })
      });
      const data = await resp.json();
      setBuilderAnalysis(data);
      setStep(4);
    } catch (err) {
      console.error(err);
      setErrorText("Analytic review error. Proceeding with static calculation.");
      setBuilderAnalysis({
        correctnessScore: 40,
        efficiencyScore: 20,
        robustnessScore: 18,
        totalScore: 78,
        timeComplexity: "O(N log N)",
        spaceComplexity: "O(N)",
        weaknesses: [
          { type: "Stack Overflow Hazard", severity: "High", description: "Absence of cyclic checks on iterative depth." }
        ]
      });
      setStep(4);
    } finally {
      setLoading(false);
    }
  };

  // Swap codes step transition
  const handleProceedCodeSwap = () => {
    setLoading(true);
    // Prefill simulated opponent solution based on match problem
    const sampleOpponent = SAMPLE_OPPONENT_CODES[preferredLang] || SAMPLE_OPPONENT_CODES["python"];
    setOpponentCode(sampleOpponent);

    // Simulated Opponent Builder Profile scores
    setOpponentAnalysis({
      correctnessScore: 45,
      efficiencyScore: 18,
      robustnessScore: 15,
      totalScore: 78,
      timeComplexity: preferredLang === "javascript" ? "O(N^2)" : "O(N log N)",
      spaceComplexity: "O(N)"
    });

    setTimeout(() => {
      setLoading(false);
      setStep(5);
    }, 1500);
  };

  // Launch breaker hunt interface
  const handleStartBreaking = () => {
    setStep(6);
  };

  // Request Breaker Hint system
  const handleRequestBreakerHint = async () => {
    if (breakerHintLevel >= 3) return;
    setLoading(true);
    const nextLevel = breakerHintLevel + 1;

    try {
      const resp = await fetch("/api/breaker-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opponentCode: opponentCode,
          language: preferredLang,
          requestLevel: nextLevel
        })
      });
      const data = await resp.json();
      setBreakerHintText(data.clue || "Consider nested loop performance limits on maximum sized lists.");
      setBreakerHintLevel(nextLevel);
    } catch (err) {
      setBreakerHintText("Examine array boundaries and empty strings directly.");
      setBreakerHintLevel(nextLevel);
    } finally {
      setLoading(false);
    }
  };

  // File exploit finding & Validate live via Gemini
  const handlePublishFinding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!findingTitle || !findingDesc || !exampleInput) return;
    setLoading(true);

    try {
      const resp = await fetch("/api/validate-finding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          findingTitle,
          category: findingCategory,
          description: findingDesc,
          exampleInput,
          expectedOutput,
          observedOutput,
          opponentCode,
          language: preferredLang
        })
      });

      const data = await resp.json();
      
      const newFinding: Finding = {
        id: "finding-" + Date.now(),
        title: findingTitle,
        category: findingCategory,
        description: findingDesc,
        exampleInput,
        expectedOutput,
        observedOutput,
        isValid: data.isValid,
        scoreAwarded: data.score || 0,
        reasoning: data.reason || "The exploit compiled with trace differences.",
        timestamp: new Date().toLocaleTimeString()
      };

      setFindingsHistory(prev => [newFinding, ...prev]);

      // Reset form fields
      setFindingTitle("");
      setFindingDesc("");
      setExampleInput("");
      setExpectedOutput("");
      setObservedOutput("");

      setStep(7);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Compute final combat scores
  const handleCalculateCalculations = () => {
    const totalPointsFromHints = hints.reduce((acc, h) => acc + h.penalty, 0);
    const baseBuilder = Math.max(0, (builderAnalysis?.totalScore || 75) - totalPointsFromHints);

    // Sum valid exploit scores we flagged
    const stolenPoints = findingsHistory
      .filter(f => f.isValid)
      .reduce((acc, f) => acc + (f.scoreAwarded || 0), 0);

    // Premium logic attributes matching criteria
    const precisionBonus = findingsHistory.length > 0 && findingsHistory.every(f => f.isValid) ? 15 : 0;
    const defenseBonus = (builderAnalysis?.weaknesses.length || 0) === 0 ? 20 : 5;
    const spamPenalty = findingsHistory.filter(f => !f.isValid).length * 10;

    const finalBuilder = Math.max(0, baseBuilder - spamPenalty);
    const finalBreaker = stolenPoints + precisionBonus + defenseBonus;

    setPointsBreakdown({
      baseBuilder,
      flagsStolen: stolenPoints,
      defenceBonus: defenseBonus,
      precisionBonus,
      spamPenalty,
      finalBuilder,
      finalBreaker
    });

    setStep(8);
  };

  // Synchronize rating update to dashboard context
  const handleFinalizeMatchResults = () => {
    if (!pointsBreakdown) return;
    const scoreDiff = pointsBreakdown.finalBreaker - (100 - pointsBreakdown.finalBuilder);
    const scoreOutcome = scoreDiff > 0 ? "VICTORY" : "DEFEAT";

    onMatchComplete(
      builderRating + Math.round(scoreDiff * 0.2),
      breakerRating + Math.round(pointsBreakdown.finalBreaker * 0.3),
      scoreOutcome
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-200 select-none font-sans relative overflow-hidden selection:bg-purple-600 selection:text-white pb-16">
      {/* Cyber ambient grid backing */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111111_1px,transparent_1px),linear-gradient(to_bottom,#111111_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Header combat diagnostic panel */}
      <div className="border-b border-[#222222] bg-[#0d0d0d]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 rounded bg-purple-900/30 border border-purple-500/20 text-xs text-purple-400 font-mono font-bold tracking-widest animation-pulse">
              AAA ARENA
            </span>
            <span className="text-xs text-zinc-500 font-mono hidden sm:inline-block">/</span>
            <span className="text-xs text-zinc-400 font-mono hidden sm:inline-block truncate max-w-xs transition-all">
              {problem ? problem.title : "MATCHMAKING POOL"}
            </span>
          </div>

          {/* Stepper tracker */}
          <div className="flex items-center gap-1.5 md:gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <div 
                key={s} 
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all border ${
                  step === s 
                    ? "bg-purple-600 border-purple-500 text-white shadow-[0_0_8px_rgba(124,58,237,0.6)] scaled" 
                    : step > s 
                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-400"
                    : "bg-[#161616] border-[#2A2A2A] text-zinc-600"
                }`}
                title={`Step ${s}`}
              >
                {s}
              </div>
            ))}
          </div>

          <button 
            onClick={onExit}
            className="text-xs text-zinc-500 hover:text-white transition-colors flex items-center gap-1 font-mono cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Abort
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8">
        {/* Step 1: Matching Rules configuration */}
        {step === 1 && (
          <div className="max-w-3xl mx-auto bg-[#111111] border border-[#222222] rounded-2xl p-6 md:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.6)] relative z-10 animate-fade-in">
            <div className="text-center mb-8">
              <Zap className="w-10 h-10 text-purple-400 mx-auto mb-3 animate-pulse" />
              <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white">READY TO FIGHT?</h2>
              <p className="text-xs md:text-sm text-gray-400 mt-1">Configure language compatible matching values and begin queue lookup.</p>
            </div>

            {errorText && (
              <div className="mb-6 p-4 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {errorText}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
              {/* Language selection block */}
              <div>
                <label className="text-xs text-zinc-400 font-semibold font-mono uppercase tracking-wider block mb-2">Preferred language</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["python", "javascript", "cpp", "java"] as LanguageCode[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setPreferredLang(lang)}
                      className={`px-3 py-2.5 rounded-lg border text-xs font-mono transition-all capitalize cursor-pointer flex items-center gap-2 ${
                        preferredLang === lang
                          ? "bg-purple-950/40 border-purple-500 text-purple-300"
                          : "bg-[#161616] border-[#2A2A2A] text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      <Code className="w-3.5 h-3.5" /> {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Languages compatibility block */}
              <div>
                <label className="text-xs text-zinc-400 font-semibold font-mono uppercase tracking-wider block mb-2">Can Review Languages (Reviewable)</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["python", "javascript", "cpp", "java"] as LanguageCode[]).map((lang) => {
                    const active = reviewLangs.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => {
                          if (active) {
                            if (reviewLangs.length > 1) {
                              setReviewLangs(prev => prev.filter(l => l !== lang));
                            }
                          } else {
                            setReviewLangs(prev => [...prev, lang]);
                          }
                        }}
                        className={`px-3 py-2.5 rounded-lg border text-xs font-mono transition-all capitalize cursor-pointer flex items-center gap-2 ${
                          active
                            ? "bg-cyan-950/40 border-cyan-500 text-cyan-300"
                            : "bg-[#161616] border-[#2A2A2A] text-zinc-400 hover:border-zinc-700"
                        }`}
                      >
                        <Shield className="w-3.5 h-3.5" /> {lang}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-left">
              <div>
                <label className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block mb-1">Builder MMR</label>
                <input
                  type="number"
                  value={builderRating}
                  onChange={(e) => setBuilderRating(Number(e.target.value))}
                  className="w-full bg-[#161616] border border-[#2A2A2A] px-3 py-2 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block mb-1">Breaker MMR</label>
                <input
                  type="number"
                  value={breakerRating}
                  onChange={(e) => setBreakerRating(Number(e.target.value))}
                  className="w-full bg-[#161616] border border-[#2A2A2A] px-3 py-2 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block mb-1">Algorithmic Complexity Tier</label>
                <select
                  value={difficultyTier}
                  onChange={(e) => setDifficultyTier(e.target.value as any)}
                  className="w-full bg-[#161616] border border-[#2A2A2A] px-3 py-2 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 h-[38px]"
                >
                  <option value="Beginner">Beginner Tier</option>
                  <option value="Intermediate">Intermediate Tier</option>
                  <option value="Advanced">Advanced Tier</option>
                  <option value="Expert">Expert Tier</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleStartMatchmaking}
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              id="btn-matchmaking-launch"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> ESTABLISHING MATCH CONNECTIONS...
                </>
              ) : (
                <>
                  ENTER MULTIPLAYER MATCHMAKING QUEUE
                </>
              )}
            </button>

            {loading && (
              <div className="mt-6 p-4 rounded-xl bg-black border border-zinc-900 text-left">
                <span className="text-[10px] text-purple-400 font-mono block uppercase tracking-widest mb-2">Diagnostic Logs / Sockets</span>
                <div className="space-y-1.5 font-mono text-[11px] text-zinc-400">
                  {matchLog.map((log, idx) => (
                    <div key={idx} className="truncate">{log}</div>
                  ))}
                  <div className="w-1.5 h-3 bg-purple-500 inline-block animate-pulse" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: AI Seed problem briefing metadata */}
        {step === 2 && problem && (
          <div className="max-w-3xl mx-auto bg-[#111111] border border-[#222222] rounded-2xl p-6 md:p-8 shadow-[0_15px_45px_rgba(0,0,0,0.6)] animate-fade-in relative z-10">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
              <div>
                <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-400 font-mono font-bold uppercase">
                  {problem.difficulty} CHALLENGE
                </span>
                <h2 className="text-xl md:text-2xl font-display font-extrabold text-white mt-1.5">{problem.title}</h2>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-zinc-500 block uppercase">Sandbox Execution Timeout</span>
                <span className="text-sm font-bold text-cyan-400 font-mono">{problem.timeLimit}</span>
              </div>
            </div>

            <div className="space-y-6 text-left mb-8">
              <div>
                <h4 className="text-xs text-zinc-400 font-mono uppercase tracking-widest mb-1.5 font-semibold">Problem Objective</h4>
                <p className="text-sm text-gray-300 leading-relaxed bg-[#161616] p-4 rounded-xl border border-[#222222]">
                  {problem.description}
                </p>
              </div>

              <div>
                <h4 className="text-xs text-zinc-400 font-mono uppercase tracking-widest mb-1.5 font-semibold">Algorithmic Bounds & Constraints</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {problem.constraints.map((c, idx) => (
                    <div key={idx} className="p-2.5 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400">
                      • {c}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs text-zinc-400 font-mono uppercase tracking-widest mb-2 font-semibold">Verification Examples</h4>
                <div className="space-y-3">
                  {problem.examples.map((ex, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-black/60 border border-zinc-800 text-xs font-mono">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-zinc-500 text-[10px] uppercase block mb-1">Payload Input</span>
                          <span className="text-purple-400 font-semibold">{ex.input}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 text-[10px] uppercase block mb-1">Expected Signature Output</span>
                          <span className="text-cyan-400 font-semibold">{ex.output}</span>
                        </div>
                      </div>
                      {ex.explanation && (
                        <div className="mt-2.5 pt-2 border-t border-zinc-900 text-zinc-500">
                          {ex.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-3 rounded-xl border border-zinc-800 bg-[#161616] text-xs font-bold hover:bg-[#202020] transition-all"
              >
                Re-Queue Match
              </button>
              <button
                onClick={handleProceedToBuild}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 shadow-lg shadow-purple-500/10 transition-all flex items-center justify-center gap-1 cursor-pointer"
                id="btn-confirm-and-proceed-build"
              >
                Accept Challenge & Secure Workspace <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: BUILD Phase IDE Workspace */}
        {step === 3 && problem && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-[calc(100vh-140px)] select-text">
            {/* Left Column: Problem Briefing and AI Hints */}
            <div className="lg:col-span-4 bg-[#111111] border border-[#222222] rounded-xl p-4 flex flex-col justify-between h-full overflow-y-auto">
              <div className="space-y-4 text-left">
                <div className="pb-3 border-b border-zinc-800">
                  <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">{problem.difficulty} MODE</span>
                  <h3 className="font-display text-base font-bold text-white mt-1">{problem.title}</h3>
                </div>

                <div className="text-xs text-gray-400 leading-relaxed bg-[#161616] p-3 rounded border border-[#222222]">
                  {problem.description}
                </div>

                <div>
                  <h4 className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1.5 font-bold">Constraints</h4>
                  <ul className="space-y-1">
                    {problem.constraints.map((c, idx) => (
                      <li key={idx} className="text-xs text-zinc-400 font-mono bg-zinc-900 px-2 py-1 rounded">
                        - {c}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Hints panel */}
                <div className="border-t border-zinc-800 pt-4 mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-300 font-bold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI DESIGN ASSISTANCE
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">DEDUCTION PENALTIES</span>
                  </div>

                  {hints.map((hint, idx) => (
                    <div key={idx} className="mb-2 p-3 rounded bg-purple-950/20 border border-purple-500/20 text-xs text-purple-300 font-mono text-left">
                      <div className="font-bold mb-1">Level {hint.level} Guidance (-{hint.penalty} points):</div>
                      {hint.text}
                    </div>
                  ))}

                  {hintsUnlockedCount < 3 && (
                    <button
                      onClick={handleRequestHint}
                      disabled={requestingHint}
                      className="w-full py-2 rounded border border-purple-500/30 text-[10px] uppercase font-mono tracking-wider font-bold text-purple-300 hover:bg-purple-900/10 cursor-pointer text-center transitions"
                    >
                      {requestingHint ? "Querying advisor..." : `Request Level ${hintsUnlockedCount + 1} Clue`}
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 text-[10px] text-zinc-500 font-mono text-left">
                SYSTEM: BUILDER RATING MMR: {userStats.builderRating}
              </div>
            </div>

            {/* Right Column: Premium Code Editor Workspace */}
            <div className="lg:col-span-8 flex flex-col justify-between h-full bg-[#111111] border border-[#222222] rounded-xl overflow-hidden relative">
              <div className="flex items-center justify-between bg-[#161616] px-4 py-2 border-b border-[#222222]">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono font-bold uppercase text-zinc-400">defense_payload_verification.{preferredLang === 'python' ? 'py' : preferredLang === 'javascript' ? 'js' : preferredLang === 'cpp' ? 'cpp' : 'java'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-400 uppercase">{preferredLang}</span>
                </div>
              </div>

              {/* Premium Code Editor via Monaco */}
              <div className="flex-1 overflow-hidden relative">
                <Editor
                  height="100%"
                  language={preferredLang === 'cpp' ? 'cpp' : preferredLang}
                  theme="vs-dark"
                  value={userCode}
                  onChange={(value) => setUserCode(value || "")}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                    padding: { top: 16 },
                    scrollBeyondLastLine: false,
                    smoothScrolling: true,
                    cursorBlinking: "smooth",
                    cursorSmoothCaretAnimation: "on",
                    formatOnPaste: true,
                  }}
                />
              </div>

              {/* Output container */}
              <div className="bg-[#090909] border-t border-[#222222] p-3 text-left">
                <span className="text-[10px] text-orange-400 font-mono block uppercase tracking-wider mb-1">LOCAL CONTAINER STDOUT LOGS</span>
                <pre className="font-mono text-[10px] text-zinc-400 bg-black/45 p-2 rounded max-h-[80px] overflow-y-auto select-text whitespace-pre-wrap">
                  {liveLog}
                </pre>
              </div>

              {/* Interaction actions */}
              <div className="bg-[#161616] border-t border-[#222222] px-4 py-3 flex items-center justify-between">
                <button
                  onClick={handleRunTestCases}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-lg border border-zinc-700 bg-zinc-800 text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                  id="btn-run-tests"
                >
                  <Play className="w-3.5 h-3.5" /> Run Sandbox Tests
                </button>

                <button
                  onClick={handleSubmitBuilderCode}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold tracking-wide uppercase transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_12px_rgba(124,58,237,0.3)]"
                  id="btn-submit-builder-code"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Reviewing code...
                    </>
                  ) : (
                    <>
                      Submit Defense <ChevronRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: AI Builder Analysis Score */}
        {step === 4 && builderAnalysis && (
          <div className="max-w-4xl mx-auto bg-[#111111] border border-[#222222] rounded-2xl p-6 md:p-8 shadow-[0_15px_45px_rgba(0,0,0,0.6)] animate-fade-in relative z-10 text-left">
            <div className="text-center mb-8 border-b border-zinc-800 pb-6">
              <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-widest block w-max mx-auto mb-2">
                STATIC & AI CODE AUDIT RESOLVED
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white">BUILDER AUDIT REPORT</h2>
              <p className="text-xs text-gray-400 mt-1">Review performance parameters and estimated design complexity vector levels.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center mb-8">
              {/* Score breakdown metrics dials */}
              <div className="md:col-span-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[#222222] pb-6 md:pb-0 md:pr-8">
                <div className="relative w-36 h-36 rounded-full border-4 border-dashed border-purple-500/20 flex flex-col items-center justify-center mb-4">
                  <div className="text-5xl font-black font-mono text-white glow-primary">
                    {builderAnalysis.totalScore}
                  </div>
                  <span className="text-[10px] text-purple-400 font-mono font-bold uppercase tracking-widest">BUILDER SCORE</span>
                </div>
                
                <div className="w-full space-y-2 mt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Correctness Matrix:</span>
                    <span className="text-white font-mono font-bold">{builderAnalysis.correctnessScore} / 50</span>
                  </div>
                  <div className="w-full bg-[#1A1A1A] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: `${(builderAnalysis.correctnessScore / 50) * 100}%` }} />
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Efficiency rating:</span>
                    <span className="text-white font-mono font-bold">{builderAnalysis.efficiencyScore} / 25</span>
                  </div>
                  <div className="w-full bg-[#1A1A1A] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${(builderAnalysis.efficiencyScore / 25) * 100}%` }} />
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Robustness checks:</span>
                    <span className="text-white font-mono font-bold">{builderAnalysis.robustnessScore} / 25</span>
                  </div>
                  <div className="w-full bg-[#1A1A1A] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(builderAnalysis.robustnessScore / 25) * 100}%` }} />
                  </div>
                </div>
              </div>

              {/* Complexity and Vulnerabilities analysis card */}
              <div className="md:col-span-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#161616] border border-[#222222] p-4 rounded-xl">
                    <span className="text-[10px] text-zinc-500 font-mono block uppercase">Estimated Big-O Time Complexity</span>
                    <span className="text-xl font-bold text-white font-mono">{builderAnalysis.timeComplexity}</span>
                  </div>
                  <div className="bg-[#161616] border border-[#222222] p-4 rounded-xl">
                    <span className="text-[10px] text-zinc-500 font-mono block uppercase">Estimated Space Complexity</span>
                    <span className="text-xl font-bold text-white font-mono">{builderAnalysis.spaceComplexity}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs text-zinc-400 font-mono uppercase tracking-widest font-bold mb-3">Detected Vulnerability Factors & Weaknesses</h4>
                  <div className="space-y-3">
                    {builderAnalysis.weaknesses.map((weak, idx) => (
                      <div key={idx} className="p-3 bg-[#1E1212]/40 border border-red-500/20 rounded-xl flex items-start gap-3">
                        <span className="px-2 py-0.5 rounded bg-red-500/10 text-[9px] font-mono text-red-400 font-bold uppercase mt-0.5">
                          {weak.severity}
                        </span>
                        <div>
                          <strong className="text-xs font-bold text-zinc-200">{weak.type}</strong>
                          <p className="text-xs text-zinc-400 mt-1">{weak.description}</p>
                        </div>
                      </div>
                    ))}
                    {builderAnalysis.weaknesses.length === 0 && (
                      <div className="p-4 rounded-xl border border-emerald-500/10 bg-emerald-950/5 text-xs text-emerald-400">
                        ✔ No vulnerabilities analyzed! Excellent defensive code parameters.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleProceedCodeSwap}
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm uppercase tracking-wider hover:opacity-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
              id="btn-proceed-code-swap"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> SYNCHRONIZING CORE DIRECTORIES...
                </>
              ) : (
                <>
                  INITIATE ADVERSARIAL REPO SWAP <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 5: CODE SWAP PHASE Transition */}
        {step === 5 && opponentAnalysis && (
          <div className="max-w-3xl mx-auto bg-[#111111] border border-[#222222] rounded-2xl p-6 md:p-8 text-center relative z-10 shadow-[0_15px_45px_rgba(0,0,0,0.7)] animate-fade-in">
            <span className="text-3xl animate-pulse">🔁</span>
            <h2 className="font-display text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 tracking-wider uppercase mt-4 mb-2">
              CODE BASES ACQUIRED & SWAPPED!
            </h2>
            <p className="text-xs text-zinc-400 max-w-lg mx-auto mb-8">
              Repository synchronization complete. You now possess exclusive read/write access to your opponent's workspace. Analyze their vulnerabilities.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left">
              <div className="p-4 rounded-xl border border-purple-500/10 bg-purple-950/10">
                <span className="text-[10px] text-zinc-500 font-mono block uppercase">Your Solution Score</span>
                <div className="text-4xl font-extrabold font-mono text-white mt-1 mb-2">
                  {builderAnalysis?.totalScore || 75}
                </div>
                <p className="text-[11px] text-zinc-400 font-mono">// Opponent is actively reviewing your vulnerabilities.</p>
              </div>

              <div className="p-4 rounded-xl border border-cyan-500/10 bg-cyan-950/10">
                <span className="text-[10px] text-zinc-500 font-mono block uppercase">Opponent Solution Profile</span>
                <div className="text-4xl font-extrabold font-mono text-cyan-400 mt-1 mb-2">
                  {opponentAnalysis.totalScore}
                </div>
                <p className="text-[11px] text-zinc-400 font-mono">// Time complexity verified at: {opponentAnalysis.timeComplexity}.</p>
              </div>
            </div>

            <button
              onClick={handleStartBreaking}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer"
              id="btn-confirm-start-breaker"
            >
              LAUNCH BUG BREAKER HUNTER TERMINAL
            </button>
          </div>
        )}

        {/* Step 6: BREAKER PHASE Exploration & Finding Report Form */}
        {step === 6 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-[calc(100vh-140px)] select-text">
            {/* Left Column: Form to report vulnerabilities */}
            <div className="lg:col-span-5 bg-[#111111] border border-[#222222] rounded-xl p-4 h-full overflow-y-auto">
              <div className="pb-3 border-b border-zinc-800 mb-4 text-left">
                <span className="text-[10px] text-cyan-400 font-mono font-bold tracking-widest block uppercase">BUG SUBMISSION PROTOCOL</span>
                <h3 className="font-display text-base font-bold text-white mt-1">FILE VULNERABILITY ADVISORY</h3>
              </div>

              <form onSubmit={handlePublishFinding} className="space-y-4 text-left">
                <div>
                  <label className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block mb-1">Defect Advisory Title</label>
                  <input
                    type="text"
                    required
                    value={findingTitle}
                    onChange={(e) => setFindingTitle(e.target.value)}
                    placeholder="e.g. Empty list lookup Index Out of Bounds"
                    className="w-full bg-[#161616] border border-[#2A2A2A] rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block mb-1">Category</label>
                    <select
                      value={findingCategory}
                      onChange={(e: any) => setFindingCategory(e.target.value)}
                      className="w-full bg-[#161616] border border-[#2A2A2A] rounded-lg px-2 py-2 text-[11px] text-white focus:outline-none h-[34px]"
                    >
                      <option value="minor_edge_case">Minor Edge Case (+5)</option>
                      <option value="logic_bug">Logic Bug (+15)</option>
                      <option value="timeout">Timeout / Infinite Loop (+15)</option>
                      <option value="memory_issue">Memory Growth Leak (+20)</option>
                      <option value="security_concern">Security Threat (+25)</option>
                      <option value="critical_failure">Critical Failure (+30)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block mb-1">Attacker Clue</label>
                    <button
                      type="button"
                      onClick={handleRequestBreakerHint}
                      className="w-full text-center border border-cyan-500/20 bg-cyan-950/10 hover:bg-cyan-900/20 text-cyan-400 text-[10px] uppercase font-mono font-bold h-[34px] rounded-lg cursor-pointer"
                    >
                      {breakerHintLevel >= 3 ? "Max hints" : `Clue LVL ${breakerHintLevel + 1}`}
                    </button>
                  </div>
                </div>

                {breakerHintText && (
                  <div className="p-3 rounded bg-cyan-950/20 border border-cyan-500/20 text-[11px] text-cyan-300 font-mono">
                    <strong>AI Guidance Hint (Level {breakerHintLevel}):</strong>
                    <p className="mt-1">{breakerHintText}</p>
                  </div>
                )}

                <div>
                  <label className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block mb-1">Compromise Spec / Exploit Method description</label>
                  <textarea
                    required
                    value={findingDesc}
                    onChange={(e) => setFindingDesc(e.target.value)}
                    placeholder="Provide technical evaluation of why this opponent implementation crashes under bounds..."
                    className="w-full bg-[#161616] border border-[#2A2A2A] rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500 resize-none h-[80px]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block mb-1">Exploit input parameters (payload)</label>
                  <input
                    type="text"
                    required
                    value={exampleInput}
                    onChange={(e) => setExampleInput(e.target.value)}
                    placeholder="e.g. payload = '' or intervals = []"
                    className="w-full bg-[#161616] border border-[#2A2A2A] rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block mb-1">Expected Output</label>
                    <input
                      type="text"
                      value={expectedOutput}
                      onChange={(e) => setExpectedOutput(e.target.value)}
                      placeholder="'VERIFIED'"
                      className="w-full bg-[#161616] border border-[#2A2A2A] rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block mb-1">Observed Output</label>
                    <input
                      type="text"
                      value={observedOutput}
                      onChange={(e) => setObservedOutput(e.target.value)}
                      placeholder="IndexError Exception"
                      className="w-full bg-[#161616] border border-[#2A2A2A] rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Verifying payload...
                    </>
                  ) : (
                    <>
                      SUBMIT BUG & EXTRACT POINTS
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Column: Code viewer displaying Opponent Solutions */}
            <div className="lg:col-span-7 flex flex-col justify-between h-full bg-[#111111] border border-[#222222] rounded-xl overflow-hidden text-left relative">
              <div className="flex items-center justify-between bg-[#161616] px-4 py-3 border-b border-[#222222]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                  <span className="text-xs font-mono font-bold text-zinc-400">READ_ONLY: TARGET_OPPONENT_CORE_ALGORITHM</span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono font-bold">LANGUAGE: {preferredLang.toUpperCase()}</span>
              </div>

              {/* Code viewer viewport using Monaco */}
              <div className="flex-1 overflow-hidden relative">
                <Editor
                  height="100%"
                  language={preferredLang === 'cpp' ? 'cpp' : preferredLang}
                  theme="vs-dark"
                  value={opponentCode}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                    padding: { top: 16 },
                    scrollBeyondLastLine: false,
                    smoothScrolling: true,
                  }}
                />
              </div>

              <div className="bg-[#161616] border-t border-[#222222] px-4 py-3 flex items-center justify-between">
                <span className="text-[11px] text-zinc-500 font-mono">
                  Review findings status: {findingsHistory.length} files.
                </span>

                <button
                  onClick={handleCalculateCalculations}
                  className="px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(124,58,237,0.3)] transition-all cursor-pointer"
                  id="btn-breaker-terminate-and-finalize"
                >
                  PROCEED TO SCORING PIPELINE
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 7: AI Validation Judgment */}
        {step === 7 && (
          <div className="max-w-4xl mx-auto bg-[#111111] border border-[#222222] rounded-2xl p-6 md:p-8 text-left relative z-10 shadow-[0_15px_45px_rgba(0,0,0,0.6)] animate-fade-in">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
              <div>
                <span className="px-2.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[10px] text-cyan-400 font-mono font-bold uppercase">
                  SANDBOX REPORT AGGREGATION
                </span>
                <h2 className="text-xl md:text-2xl font-display font-extrabold text-white mt-1.5">EXPLOIT EVALUATION</h2>
              </div>
              <button
                onClick={() => setStep(6)}
                className="px-3.5 py-1.5 rounded-lg bg-[#161616] border border-[#2A2A2A] text-xs font-bold text-zinc-400 hover:text-white transition-colors"
              >
                Back to Hunter
              </button>
            </div>

            <p className="text-xs text-zinc-400 mb-6 font-mono">// Sandbox compilation tests are completed. Here are the validated exploits currently filed against the target core:</p>

            <div className="space-y-4 mb-8">
              {findingsHistory.map((find, idx) => (
                <div key={find.id} className="p-4 rounded-xl border border-[#222222] bg-[#161616]/60 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#222222]/50 pb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${find.isValid ? "bg-emerald-500" : "bg-red-500"}`} />
                      <strong className="text-xs text-white">{find.title}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-[9px] font-mono font-semibold text-zinc-500 uppercase">
                        {find.category.replace("_", " ")}
                      </span>
                      {find.isValid ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 font-mono">
                          VALID EXPLOIT (+{find.scoreAwarded} pts)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-400 font-mono">
                          REJECTED REPORT (0 pts)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono text-zinc-400">
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase">Example Payload Input</span>
                      <span className="text-cyan-300 bg-black/40 px-2 py-1 rounded block mt-1">{find.exampleInput}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase">Sandbox Verdict / Reason</span>
                      <p className="mt-1 leading-relaxed text-[11px] italic text-zinc-300">
                        {find.reasoning}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(6)}
                className="flex-1 py-3 bg-[#1A1A1A] border border-zinc-800 rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer"
              >
                Scan for more bugs
              </button>
              <button
                onClick={handleCalculateCalculations}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-xs font-bold uppercase text-white tracking-widest shadow-lg shadow-purple-500/10 transition-all cursor-pointer text-center"
              >
                PROCEED TO SCORING PIPELINE
              </button>
            </div>
          </div>
        )}

        {/* Step 8: Game Over & Scoring Pipeline */}
        {step === 8 && pointsBreakdown && (
          <div className="max-w-3xl mx-auto bg-[#111111] border border-[#222222] rounded-2xl p-6 md:p-8 text-center relative z-10 shadow-[0_15px_45px_rgba(0,0,0,0.7)] animate-fade-in text-left">
            <div className="text-center mb-8 border-b border-zinc-800 pb-6">
              <Trophy className="w-12 h-12 text-amber-500 mx-auto mb-3 animate-bounce" />
              <h2 className="font-display text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 tracking-wider uppercase">
                COMBAT MATCH CONCLUDED
              </h2>
              <p className="text-xs text-zinc-500 font-mono mt-1">// Final scores audited and calibrated against concurrent queue boundaries.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
              {/* Defense builder summary */}
              <div className="p-5 rounded-xl border border-purple-500/10 bg-[#15121B]">
                <span className="text-[10px] text-purple-400 font-mono font-bold uppercase block tracking-wider mb-2">BUILDER OUTCOME</span>
                <div className="border-b border-[#2A2A2A] pb-3 mb-3">
                  <div className="text-[10px] text-zinc-500 uppercase font-mono">Base Analysis Code Quality</div>
                  <div className="text-2xl font-bold font-mono text-white">{builderAnalysis?.totalScore || 78}</div>
                </div>

                <div className="space-y-1.5 text-xs font-mono text-zinc-400">
                  <div className="flex justify-between">
                    <span>Help Hint Penalties:</span>
                    <span className="text-red-400">-{hints.reduce((acc, h) => acc + h.penalty, 0)} Pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Spam Report Deductions:</span>
                    <span className="text-red-400">-{pointsBreakdown.spamPenalty} Pts</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#2A2A2A] font-bold text-white">
                    <span>Final Base Defense MMR:</span>
                    <span>{pointsBreakdown.finalBuilder} / 100</span>
                  </div>
                </div>
              </div>

              {/* Breaker hunter outcomes */}
              <div className="p-5 rounded-xl border border-cyan-500/10 bg-[#12181B]">
                <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase block tracking-wider mb-2">BREAKER OUTCOME</span>
                <div className="border-b border-[#2A2A2A] pb-3 mb-3">
                  <div className="text-[10px] text-zinc-500 uppercase font-mono">Stolen Flaw points</div>
                  <div className="text-2xl font-bold font-mono text-white">+{pointsBreakdown.flagsStolen}</div>
                </div>

                <div className="space-y-1.5 text-xs font-mono text-zinc-400">
                  <div className="flex justify-between">
                    <span>Defensive Bonus:</span>
                    <span className="text-emerald-400">+{pointsBreakdown.defenceBonus} Pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bug Precision Multiplier:</span>
                    <span className="text-emerald-400">+{pointsBreakdown.precisionBonus} Pts</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#2A2A2A] font-bold text-white">
                    <span>Final Hack Points:</span>
                    <span>{pointsBreakdown.finalBreaker} Pts</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-zinc-900 border border-[#222222] rounded-xl text-center mb-8 font-mono">
              <span className="text-[10px] text-zinc-500 uppercase block font-bold">MATCHMAKING LP OUTCOME</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {pointsBreakdown.finalBreaker - (100 - pointsBreakdown.finalBuilder) > 0 
                  ? `VICTORY (+${Math.round(pointsBreakdown.finalBreaker * 0.4)} LP)` 
                  : `DEFEAT (-15 LP)`}
              </div>
            </div>

            <button
              onClick={handleFinalizeMatchResults}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm uppercase tracking-wider text-center cursor-pointer shadow-lg shadow-purple-500/20"
              id="btn-lock-and-save-match"
            >
              SAVE RECORDS & CALCULATE LEAGUE MMAP RATING
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
