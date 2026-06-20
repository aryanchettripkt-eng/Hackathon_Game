import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";
import Battlefield from "./components/Battlefield";
import LoadingScreen from "./components/LoadingScreen";
import { UserStats } from "./types";
import { INITIAL_USER_STATS } from "./data";
import { Layout, Award } from "lucide-react";

export default function App() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [view, setView] = useState<"landing" | "dashboard" | "battle">("landing");
  const [userStats, setUserStats] = useState<UserStats>(INITIAL_USER_STATS);

  // Handle live rating synchronization once pvp duels finish
  const handleMatchComplete = (builderMMR: number, breakerMMR: number, outcome: "VICTORY" | "DEFEAT" | "DRAW") => {
    setUserStats(prev => {
      const overallRating = Math.round((builderMMR + breakerMMR) / 2);
      
      // Determine next competitive tier badging
      let tier = prev.tier;
      let badge = prev.rankBadge;
      if (overallRating >= 2200) {
        tier = "Grandmaster";
        badge = "👑 GRANDMASTER I";
      } else if (overallRating >= 1800) {
        tier = "Master";
        badge = "💠 MASTER III";
      } else if (overallRating >= 1500) {
        tier = "Expert";
        badge = "⚡ EXPERT II";
      } else if (overallRating >= 1200) {
        tier = "Advanced";
        badge = "🔥 ADVANCED I";
      } else {
        tier = "Intermediate";
        badge = "🟢 INTERMEDIATE I";
      }

      return {
        ...prev,
        builderRating: builderMMR,
        breakerRating: breakerMMR,
        overallRating,
        problemsSolved: prev.problemsSolved + 1,
        vulnerabilitiesFound: prev.vulnerabilitiesFound + Math.floor(Math.random() * 2) + 2,
        matchesPlayed: prev.matchesPlayed + 1,
        winRate: outcome === "VICTORY" ? Math.min(100, Math.round(((prev.matchesPlayed * prev.winRate / 100) + 1) / (prev.matchesPlayed + 1) * 100)) : Math.round((prev.matchesPlayed * prev.winRate / 100) / (prev.matchesPlayed + 1) * 100),
        winStreak: outcome === "VICTORY" ? prev.winStreak + 1 : 0,
        tier,
        rankBadge: badge
      };
    });

    setView("dashboard");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-200 antialiased relative selection:bg-purple-600 selection:text-white overflow-hidden">
      {/* Visual background lines and sparkles */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent pointer-events-none" />

      <AnimatePresence mode="wait">
        {!isAppReady ? (
          <LoadingScreen key="loading" onComplete={() => setIsAppReady(true)} />
        ) : (
          <motion.div
            key="app-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="w-full h-full min-h-screen"
          >
            <AnimatePresence mode="wait">
              {view === "landing" && (
                <motion.div
                  key="landing"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <LandingPage 
                    onEnterArena={() => setView("battle")}
                    onEnterDashboard={() => setView("dashboard")}
                  />
                </motion.div>
              )}

              {view === "dashboard" && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                >
                  <Dashboard 
                    userStats={userStats}
                    onEnterArena={() => setView("battle")}
                    onViewLanding={() => setView("landing")}
                  />
                </motion.div>
              )}

              {view === "battle" && (
                <motion.div
                  key="battle"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <Battlefield 
                    userStats={userStats}
                    onMatchComplete={handleMatchComplete}
                    onExit={() => setView("dashboard")}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
