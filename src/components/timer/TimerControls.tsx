import React, { memo } from 'react';
import { Play, Pause, Square, SkipForward } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TimerControlsProps {
  isActive: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onSkip: () => void;
  isBreakTime: boolean;
}

const TimerControls = memo(function TimerControls({ 
  isActive, 
  isPaused, 
  onStart, 
  onPause, 
  onStop, 
  onSkip, 
  isBreakTime 
}: TimerControlsProps) {
  const buttonBase = "flex items-center justify-center gap-2 px-4 py-2.5 md:px-6 md:py-3 rounded-2xl font-black uppercase tracking-widest text-[9px] md:text-[10px] transition-all duration-300 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed";

  return (
    <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 mb-8 md:mb-12">
      <AnimatePresence mode="wait">
        {isActive ? (
          <motion.button 
            key="pause"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onPause}
            className={`${buttonBase} glass text-white hover:bg-white/10`}
          >
            <Pause size={14} fill="currentColor" />
            <span>Pause</span>
          </motion.button>
        ) : (
          <motion.button 
            key="play"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            className={`${buttonBase} bg-mario-emerald text-black shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)]`}
          >
            <Play size={14} fill="currentColor" />
            <span>{isPaused ? 'Resume Mission' : 'Start Mission'}</span>
          </motion.button>
        )}
      </AnimatePresence>

      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onSkip}
        className={`${buttonBase} glass text-slate-400 hover:text-white`}
      >
        <SkipForward size={14} fill="currentColor" />
        <span>Skip Phase</span>
      </motion.button>

      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onStop}
        disabled={!isActive && !isPaused}
        className={`${buttonBase} bg-mario-red/20 text-mario-red border border-mario-red/30 hover:bg-mario-red hover:text-white`}
      >
        <Square size={14} fill="currentColor" />
        <span>Restart Mission</span>
      </motion.button>
    </div>
  );
});

export default TimerControls;
