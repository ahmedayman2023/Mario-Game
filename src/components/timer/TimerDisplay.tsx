import React, { memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TimerDisplayProps {
  minutes: number;
  seconds: number;
  isActive: boolean;
  currentInterval: string | number;
  onTimeEdit: (time: number) => void;
  isBreakTime: boolean;
}

const TimerDisplay = memo(function TimerDisplay({ 
  minutes, 
  seconds, 
  isActive, 
  currentInterval, 
  onTimeEdit, 
  isBreakTime 
}: TimerDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 md:py-12">
      <AnimatePresence mode="wait">
        <motion.div
          key={isBreakTime ? 'break' : 'study'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-slate-500 mb-2"
        >
          {isBreakTime ? 'Break Session' : `Level Interval ${currentInterval}`}
        </motion.div>
      </AnimatePresence>

      <motion.div 
        className={`text-[10rem] md:text-[14rem] font-mono font-black tracking-tighter leading-none select-none cursor-pointer transition-colors ${isBreakTime ? 'text-emerald-400' : 'text-white'}`}
        onClick={() => !isActive && onTimeEdit(minutes * 60 + seconds)}
        animate={isActive && !isBreakTime ? {
          scale: [1, 1.02, 1],
          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        } : {}}
      >
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </motion.div>

      {isBreakTime && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-emerald-500 font-black uppercase tracking-[0.3em] mt-4 flex items-center gap-2"
        >
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
          Recharging Energy
        </motion.div>
      )}
    </div>
  );
});

export default TimerDisplay;
