import React, { useState } from "react";
import { motion } from "motion/react";
import { UserStats, LeaderboardRow, MatchHistory } from "../types";
import { MOCK_LEADERBOARD_OVERALL, MOCK_LEADERBOARD_BUILDERS, MOCK_LEADERBOARD_BREAKERS, MOCK_RECENT_MATCHES } from "../data";
import { Award, Code, Shield, Flame, Activity, ListOrdered, ChevronRight, RefreshCw, Trophy, Target, TrendingUp } from "lucide-react";

interface DashboardProps {
  userStats: UserStats;
  onEnterArena: () => void;
  onViewLanding: () => void;
}

export default function Dashboard({ userStats, onEnterArena, onViewLanding }: DashboardProps) {
  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState<"overall" | "builders" | "breakers">("overall");
  const [searchLeaderboard, setSearchLeaderboard] = useState("");

  const leaderboardData: LeaderboardRow[] = 
    activeLeaderboardTab === "overall" ? MOCK_LEADERBOARD_OVERALL :
    activeLeaderboardTab === "builders" ? MOCK_LEADERBOARD_BUILDERS : MOCK_LEADERBOARD_BREAKERS;

  const filteredLeaderboard = leaderboardData.filter(row => 
    row.username.toLowerCase().includes(searchLeaderboard.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-200 font-sans selection:bg-purple-600 selection:text-white">
      {/* Premium Cyber Header banner */}
      <div className="border-b border-[#222222] bg-[#0d0d0d]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={onViewLanding}>
            <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center font-bold text-white text-lg tracking-wider">
              A
            </div>
            <span className="font-display font-bold tracking-wider text-white text-lg">AAA</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-xs text-zinc-500 font-mono hidden md:inline-block">
              PLATFORM_STATUS: <span className="text-emerald-400">OPTIMAL</span>
            </span>
            <button
              onClick={onEnterArena}
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-lg shadow-purple-500/20 transition-all cursor-pointer flex items-center gap-2"
              id="dash-enter-arena"
            >
              Enter The Arena <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Profile Snapshot Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Main User Stat details */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="bg-[#111111] border border-[#222222] rounded-2xl p-6 relative overflow-hidden group hover:border-purple-500/30 transition-all flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-center font-bold text-white font-display text-xl">
                  {userStats.username[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                    {userStats.username}
                  </h2>
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-400 font-mono font-semibold">
                    {userStats.rankBadge}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Arena Rating</span>
                <div className="text-3xl font-black text-white font-mono tracking-tight glow-primary">
                  {userStats.overallRating}
                </div>
              </div>
            </div>

            <div className="border-t border-[#222222] pt-4 mt-4 grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-[10px] text-zinc-500 font-mono uppercase block">Win Rate</span>
                <span className="text-base font-bold text-emerald-400 font-mono">{userStats.winRate}%</span>
              </div>
              <div className="border-x border-[#222222]">
                <span className="text-[10px] text-zinc-500 font-mono uppercase block">Matches</span>
                <span className="text-base font-bold text-white font-mono">{userStats.matchesPlayed}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 font-mono uppercase block">Streak</span>
                <span className="text-base font-bold text-purple-400 font-mono">+{userStats.winStreak} 🔥</span>
              </div>
            </div>
          </motion.div>

          {/* Builder Rating Progression Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-[#111111] border border-[#222222] rounded-2xl p-6 relative overflow-hidden group hover:border-[#7C3AED]/30 transition-all"
          >
            <div className="absolute top-3 right-3 p-2 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A]">
              <Code className="w-5 h-5 text-purple-400 animate-pulse" />
            </div>
            
            <span className="text-[10px] text-purple-400 uppercase tracking-widest font-mono font-semibold">ROLE: BUILDER</span>
            <h3 className="text-sm font-semibold text-gray-400 mt-1 mb-2">Algorithm & Structural Defenses</h3>
            
            <div className="flex items-baseline gap-3 my-4">
              <span className="text-4xl font-extrabold text-white font-mono">{userStats.builderRating}</span>
              <span className="text-xs text-emerald-400 font-mono flex items-center"><TrendingUp className="w-3.5 h-3.5 mr-0.5" /> High Precision</span>
            </div>

            <div className="text-xs text-gray-500 flex flex-col gap-2 border-t border-[#222222] pt-4 font-mono">
              <div className="flex justify-between">
                <span>SOLVED PROBLEMS:</span>
                <span className="text-white font-bold">{userStats.problemsSolved}</span>
              </div>
              <div className="flex justify-between">
                <span>ESTIMATED TIME COMPLEXITY:</span>
                <span className="text-white font-bold">O(N log N) Average</span>
              </div>
            </div>
          </motion.div>

          {/* Breaker Rating Progression Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-[#111111] border border-[#222222] rounded-2xl p-6 relative overflow-hidden group hover:border-cyan-500/30 transition-all"
          >
            <div className="absolute top-3 right-3 p-2 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A]">
              <Shield className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            
            <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-mono font-semibold">ROLE: BREAKER</span>
            <h3 className="text-sm font-semibold text-gray-400 mt-1 mb-2">Algorithm Intruder & Exploits</h3>
            
            <div className="flex items-baseline gap-3 my-4">
              <span className="text-4xl font-extrabold text-white font-mono">{userStats.breakerRating}</span>
              <span className="text-xs text-cyan-400 font-mono flex items-center"><TrendingUp className="w-3.5 h-3.5 mr-0.5" /> Dominant breaking</span>
            </div>

            <div className="text-xs text-gray-500 flex flex-col gap-2 border-t border-[#222222] pt-4 font-mono">
              <div className="flex justify-between">
                <span>EXPLOITS VERIFIED:</span>
                <span className="text-white font-bold">{userStats.vulnerabilitiesFound}</span>
              </div>
              <div className="flex justify-between">
                <span>FAVORITE VECTOR:</span>
                <span className="text-white font-bold">Timeout / Edge Case</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Dynamic Interactive Leaderboard and Recent Combat logs panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Leaderboard Table (Left side) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="lg:col-span-7 bg-[#111111] border border-[#222222] rounded-2xl p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold font-display text-white">ARENA LEADERBOARDS</h3>
              </div>
              
              <div className="flex rounded-lg bg-[#1A1A1A] p-1 border border-[#2A2A2A]">
                {(["overall", "builders", "breakers"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveLeaderboardTab(tab)}
                    className={`px-3 py-1 text-xs font-mono rounded capitalize transition-all cursor-pointer ${
                      activeLeaderboardTab === tab
                        ? "bg-purple-600 text-white font-semibold"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Leaderboard Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search competitors..."
                value={searchLeaderboard}
                onChange={(e) => setSearchLeaderboard(e.target.value)}
                className="w-full px-4 py-2 text-xs bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 transition-all font-mono"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#222222] text-zinc-500 uppercase text-[10px]">
                    <th className="py-3 px-2">RANK</th>
                    <th className="py-3 px-2">COMPETITOR</th>
                    <th className="py-3 px-2 text-right">RATING</th>
                    <th className="py-3 px-2 text-right">BUILDER</th>
                    <th className="py-3 px-2 text-right">BREAKER</th>
                    <th className="py-3 px-2 text-right hidden sm:table-cell">WIN RATE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222222]/40">
                  {filteredLeaderboard.map((row) => (
                    <tr
                      key={row.username}
                      className={`hover:bg-[#1A1A1A]/30 transition-colors ${
                        row.username === userStats.username ? "bg-[#7C3AED]/5 border-y border-[#7C3AED]/20" : ""
                      }`}
                    >
                      <td className="py-3.5 px-2 font-bold text-zinc-400">
                        {row.rank === 1 ? "🥇 1" : row.rank === 2 ? "🥈 2" : row.rank === 3 ? "🥉 3" : row.rank}
                      </td>
                      <td className="py-3.5 px-2">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${row.username === userStats.username ? "text-purple-400 font-bold" : "text-zinc-200"}`}>
                            {row.username}
                          </span>
                          {row.username === userStats.username && (
                            <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-[9px] text-purple-400 border border-purple-500/20 font-bold">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-500">{row.tier}</span>
                      </td>
                      <td className="py-3.5 px-2 text-right font-bold text-white glow-secondary">
                        {row.overallRating}
                      </td>
                      <td className="py-3.5 px-2 text-right text-purple-300">
                        {row.builderRating}
                      </td>
                      <td className="py-3.5 px-2 text-right text-cyan-300">
                        {row.breakerRating}
                      </td>
                      <td className="py-3.5 px-2 text-right hidden sm:table-cell text-emerald-400">
                        {row.winRate}%
                      </td>
                    </tr>
                  ))}
                  {filteredLeaderboard.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-zinc-500">
                        No competitors matched search filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Recent Combat Records Log (Right side) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="lg:col-span-5 bg-[#111111] border border-[#222222] rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold font-display text-white">COMBAT HISTORY</h3>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">3 RECENT BATTLES</span>
            </div>

            <div className="space-y-4">
              {MOCK_RECENT_MATCHES.map((match) => (
                <div
                  key={match.id}
                  className="rounded-xl border border-[#222222] bg-[#161616]/40 p-4 hover:border-purple-500/20 transition-all"
                >
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#222222]/40">
                    <span className="text-[10px] text-zinc-500 font-mono">{match.date}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                        match.result === "VICTORY"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-500 border border-red-500/20"
                      }`}
                    >
                      {match.result}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-xs text-zinc-400 uppercase tracking-widest font-semibold flex items-center gap-1.5">
                        VS <span className="text-white font-black">{match.opponentName}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono">Opponent MMR: {match.opponentRating}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black font-mono text-emerald-400">
                        {match.pointsExchanged > 0 ? `+${match.pointsExchanged}` : match.pointsExchanged} LP
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 mb-2 font-mono truncate">
                    Challenge: {match.problemTitle}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-mono bg-[#111111] p-2 rounded">
                    <div>
                      <span className="text-zinc-500 block uppercase font-mono text-[9px]">Builder Score</span>
                      <span className="text-purple-400 font-bold">{match.builderScore} / 100</span>
                    </div>
                    <div className="border-l border-[#222222]">
                      <span className="text-zinc-500 block uppercase font-mono text-[9px]">Flaws Detected</span>
                      <span className="text-cyan-400 font-bold">+{match.breakerScore} Points</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
