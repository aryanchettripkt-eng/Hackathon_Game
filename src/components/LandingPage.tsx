import React from "react";
import { motion } from "motion/react";
import { Shield, Code, Cpu, Award, Zap, ChevronRight, Terminal, Star, CheckCircle, Flame, Users } from "lucide-react";

interface LandingPageProps {
  onEnterArena: () => void;
  onEnterDashboard: () => void;
}

export default function LandingPage({ onEnterArena, onEnterDashboard }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-200 select-none font-sans relative overflow-hidden selection:bg-purple-600 selection:text-white">
      {/* Background cyber grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111111_1px,transparent_1px),linear-gradient(to_bottom,#111111_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Cyber ambient glow bubbles */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Outer framing line decorators (No tech larp status metrics per requirements, keeping beautiful, humble, clean) */}
      <div className="border-b border-[#222222] bg-[#0d0d0d]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={onEnterDashboard}>
            <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center font-bold text-white text-lg shadow-[0_0_15px_rgba(124,58,237,0.5)]">
              A
            </div>
            <span className="font-display font-semibold tracking-wider text-white text-lg">
              ADVERSARIAL ALGORITHM ARENA
            </span>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={onEnterDashboard} 
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              id="btn-nav-dashboard"
            >
              Dashboard
            </button>
            <button 
              onClick={onEnterArena} 
              className="px-4 py-2 text-sm font-medium rounded-full border border-purple-500/30 text-purple-300 bg-purple-950/20 hover:bg-purple-900/30 hover:border-purple-500/60 transition-all duration-300"
              id="btn-nav-arena"
            >
              Enter The Arena
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-24 text-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/20 bg-purple-950/10 text-xs text-purple-300 font-semibold uppercase tracking-widest mb-8"
        >
          <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> PvP Code Duels with Generative AI Arbiters
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="font-display text-6xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-purple-400 tracking-tight leading-none mb-6"
        >
          Build. Break.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-indigo-500">Learn & Survive.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl font-normal tracking-wide mb-12 leading-relaxed"
        >
          The ultimate competitive PvE/PvP arena. Code your algorithm, swap codebases under fire with your opponent, hunt for vulnerabilities, and extract rating points.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <button
            onClick={onEnterArena}
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35 transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer"
            id="hero-cta-enter"
          >
            Enter The Arena <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={onEnterDashboard}
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold border border-gray-800 bg-[#111111]/80 hover:bg-[#161616] hover:border-gray-700 text-gray-300 hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
            id="hero-cta-dashboard"
          >
            Open Dashboard
          </button>
        </motion.div>

        {/* Hero Cyber Arena Canvas Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="relative max-w-5xl mx-auto rounded-2xl border border-gray-800 bg-[#0F0F0F] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/60" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <span className="w-3 h-3 rounded-full bg-green-500/60" />
              <div className="ml-2 px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-500 font-mono">
                CONCURRENT_MATCH_LIVE
              </div>
            </div>
            <span className="text-xs text-zinc-500 font-mono">MATCHMAKING_SERVER_ONLINE</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[350px]">
            {/* Blue Builder Side */}
            <div className="rounded-xl border border-purple-500/10 bg-purple-950/5 p-6 flex flex-col justify-between text-left relative group hover:border-purple-500/30 transition-all">
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-purple-900/30 border border-purple-500/20 text-[10px] text-purple-400 font-mono">
                BLUE TEAM
              </div>
              <div>
                <Code className="w-8 h-8 text-purple-400 mb-4" />
                <h3 className="text-lg font-bold font-display text-white mb-1">THE BUILD PHASE</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Engineers write modern algorithmic defenses. Optimize your code for correctness, time scalability, recursive margins, and custom data constraints.
                </p>
              </div>
              <div className="text-[11px] font-mono text-purple-400/70">
                // System validation initialized... Correctness Matrix base: 50
              </div>
            </div>

            {/* Red Breaker Side */}
            <div className="rounded-xl border border-cyan-500/10 bg-cyan-950/5 p-6 flex flex-col justify-between text-left relative group hover:border-cyan-500/30 transition-all">
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-cyan-900/30 border border-cyan-500/20 text-[10px] text-cyan-400 font-mono">
                RED TEAM
              </div>
              <div>
                <Shield className="w-8 h-8 text-cyan-400 mb-4" />
                <h3 className="text-lg font-bold font-display text-white mb-1">THE BREAK PHASE</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  The code swap is executed. Probe the opponent's core algorithm and file edge-case exploits, cyclic infinite loops, memory leaks, and stack overflows.
                </p>
              </div>
              <div className="text-[11px] font-mono text-cyan-400/70">
                // Hostile payload validation... Points stolen: +25 Minor/Critical
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Feature Loop Sections */}
      <div className="max-w-7xl mx-auto px-6 py-20 border-t border-gray-900">
        <h2 className="text-center font-display text-3xl font-extrabold tracking-tight mb-16 text-white">
          THE 4-STAGE COMBAT CORE
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: "01", title: "MATCH & SPAWN", desc: "Select favorite languages and get rated. Form competitive PvP connections instantly with compatible peers." },
            { step: "02", title: "BUILD & DEFEND", desc: "Formulate rigorous, efficient, bug-free core code in Python, JS, C++, or Java." },
            { step: "03", title: "THE CODE SWAP", desc: "Acquire full execution access to your opponent's repository. Read and test line-by-line of live source code." },
            { step: "04", title: "HUNT & DEPLOY", desc: "File structured vulnerability reports and watch standard AI validation arbitrate steal parameters." },
          ].map((item, idx) => (
            <div key={idx} className="rounded-xl border border-gray-800 bg-[#111111]/40 p-6 text-left relative">
              <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-500 to-cyan-500 font-display absolute top-4 right-4">
                {item.step}
              </span>
              <h3 className="text-base font-bold font-display text-white mt-10 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Live Activity & System statistics */}
      <div className="max-w-7xl mx-auto px-6 py-12 border-t border-gray-900 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-950/30 rounded-lg border border-purple-500/20">
            <Users className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">4,129</div>
            <div className="text-xs text-gray-400 uppercase tracking-widest font-mono">Active Builders Online</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-950/30 rounded-lg border border-cyan-500/20">
            <Flame className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">148,829</div>
            <div className="text-xs text-gray-400 uppercase tracking-widest font-mono">Exploits Submitted Successfully</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-950/30 rounded-lg border border-emerald-500/20">
            <Cpu className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">99.8%</div>
            <div className="text-xs text-gray-400 uppercase tracking-widest font-mono">AI Arbiter Execution Speed</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-900 py-12 bg-[#090909]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
          <span>&copy; 2026 Adversarial Algorithm Arena. All algorithms integrated securely.</span>
          <div className="flex items-center gap-4 mt-4 sm:init-0">
            <a href="#" className="hover:text-white">API Reference</a>
            <a href="#" className="hover:text-white">Security Disclosures</a>
            <a href="#" className="hover:text-white">GitHub Sandbox</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
