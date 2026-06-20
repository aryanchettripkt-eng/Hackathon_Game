import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap } from "lucide-react";

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const loadingTexts = [
    "INITIALIZING ARENA...",
    "PREPARING AI OPPONENT...",
    "GENERATING BATTLEFIELD..."
  ];

  useEffect(() => {
    // Progress through text every 800ms
    const interval = setInterval(() => {
      setLoadingTextIndex(prev => {
        if (prev < loadingTexts.length - 1) return prev + 1;
        return prev;
      });
    }, 800);
    
    // Complete after exactly 2800ms
    const timeout = setTimeout(() => {
      onComplete();
    }, 2800);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505] overflow-hidden"
    >
      {/* Background radial gradient for premium look */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-[#050505] to-[#050505] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-10 flex flex-col items-center w-full max-w-md px-6"
      >
        <div className="mb-8 w-16 h-16 rounded-full bg-gradient-to-br from-purple-600/30 to-cyan-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.3)] relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, ease: "linear", repeat: Infinity }}
            className="absolute inset-0 rounded-full border-t-2 border-r-2 border-purple-500"
          />
          <Zap className="w-8 h-8 text-white animate-pulse" />
        </div>

        <div className="h-6 mb-4 w-full text-center relative overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={loadingTextIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-sm md:text-base font-display font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-cyan-300 uppercase absolute inset-0 flex items-center justify-center"
            >
              {loadingTexts[loadingTextIndex]}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="w-full h-1 bg-[#161616] rounded-full overflow-hidden relative">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.4, ease: "easeInOut" }}
            className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-500 rounded-full shadow-[0_0_10px_rgba(124,58,237,0.8)]"
          />
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-6 text-[10px] text-zinc-600 font-mono uppercase tracking-widest"
        >
          Connecting to secure server matrix...
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
