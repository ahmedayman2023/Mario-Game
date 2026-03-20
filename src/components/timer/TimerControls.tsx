import React, { memo } from 'react';
import { Play, Pause, Square, SkipForward, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

interface TimerControlsProps {
  isActive: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onSkip: () => void;
  onBack: () => void;
  isBreakTime: boolean;
  isWarmup: boolean;
}

const TimerControls = memo(function TimerControls({ 
  isActive, 
  isPaused, 
  onStart, 
  onPause, 
  onStop, 
  onSkip, 
  onBack,
  isBreakTime,
  isWarmup
}: TimerControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mt-4">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onBack}
        className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        title="العودة للمرحلة السابقة"
      >
        <RotateCcw size={20} />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={isActive && !isPaused ? onPause : onStart}
        className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all ${
          isActive && !isPaused 
            ? 'bg-mario-red text-white shadow-mario-red/20' 
            : 'bg-mario-emerald text-black shadow-mario-emerald/20'
        }`}
      >
        {isActive && !isPaused ? <Pause size={32} fill="currentColor" /> : <Play size={32} className="ml-1" fill="currentColor" />}
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onSkip}
        className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        title={isWarmup ? "تخطي التسخين" : "تخطي المرحلة"}
      >
        <SkipForward size={20} />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onStop}
        className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-mario-red hover:bg-mario-red/10 transition-all"
        title="إعادة ضبط"
      >
        <Square size={20} fill="currentColor" />
      </motion.button>
    </div>
  );
});

export default TimerControls;
