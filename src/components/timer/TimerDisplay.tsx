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
    <div className="flex flex-col items-center justify-center py-6 md:py-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={isBreakTime ? 'break' : 'study'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center gap-2 mb-4"
        >
          <div className="px-3 py-1 bg-broadcast-yellow text-black text-[10px] font-black uppercase tracking-widest rounded-sm">
            {isBreakTime ? 'Half Time' : `Period ${currentInterval}`}
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
            {isBreakTime ? 'Recharging' : 'Match in Progress'}
          </div>
        </motion.div>
      </AnimatePresence>

      <motion.div 
        className={`text-[8rem] sm:text-[12rem] md:text-[16rem] font-black scoreboard-font tracking-tighter leading-none select-none cursor-pointer transition-colors ${isBreakTime ? 'text-broadcast-yellow' : 'text-white'}`}
        onClick={() => !isActive && onTimeEdit(minutes * 60 + seconds)}
        animate={isActive && !isBreakTime ? {
          opacity: [1, 0.8, 1],
          transition: { duration: 1, repeat: Infinity, ease: "linear" }
        } : {}}
      >
        {String(minutes).padStart(2, '0')}<span className="animate-pulse">:</span>{String(seconds).padStart(2, '0')}
      </motion.div>

      <div className="mt-6 flex items-center gap-8">
        <div className="flex flex-col items-center">
          <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Status</div>
          <div className={`text-xs font-black uppercase tracking-widest ${isActive ? 'text-mario-emerald' : 'text-mario-red'}`}>
            {isActive ? 'Playing' : 'Paused'}
          </div>
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div className="flex flex-col items-center">
          <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Intensity</div>
          <div className="text-xs font-black uppercase tracking-widest text-white">High</div>
        </div>
      </div>
    </div>
  );
});

export default TimerDisplay;
