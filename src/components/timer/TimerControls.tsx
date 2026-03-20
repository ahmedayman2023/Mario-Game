import React, { memo } from 'react';
import { Play, Pause, Square, SkipForward, SkipBack, Wind } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
  const buttonBase = "flex items-center justify-center gap-2 px-5 py-3 md:px-8 md:py-4 rounded font-black uppercase tracking-widest text-[10px] md:text-[11px] transition-all duration-300 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed scoreboard-font";

  return (
    <div className="flex flex-wrap justify-center items-center gap-3 md:gap-6 mb-8 md:mb-12">
      <AnimatePresence mode="wait">
        {isActive ? (
          <motion.button 
            key="pause"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            whileHover={{ scale: 1.02 }}
            onClick={onPause}
            className={`${buttonBase} bg-white text-black hover:bg-slate-200 shadow-xl`}
          >
            <Pause size={16} fill="currentColor" />
            <span>وقت مستقطع</span>
          </motion.button>
        ) : (
          <motion.button 
            key="play"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            whileHover={{ scale: 1.02 }}
            onClick={onStart}
            className={`${buttonBase} bg-mario-emerald text-black shadow-[0_0_30px_rgba(0,255,136,0.3)] hover:shadow-[0_0_40px_rgba(0,255,136,0.5)]`}
          >
            <Play size={16} fill="currentColor" />
            <span>{isPaused ? 'استئناف الجلسة' : isWarmup ? 'بدء التسخين' : 'بدء التقنية'}</span>
          </motion.button>
        )}
      </AnimatePresence>

      <motion.button 
        whileHover={{ scale: 1.02 }}
        onClick={onSkip}
        className={`${buttonBase} ${isWarmup ? 'bg-amber-500 text-black border-none' : 'bg-stadium-blue border border-white/20 text-white'} hover:bg-white/10`}
      >
        {isWarmup ? <Wind size={16} fill="currentColor" /> : <SkipForward size={16} fill="currentColor" />}
        <span>{isWarmup ? 'صفارة الحكم (بدء التقنية)' : isBreakTime ? 'تخطي الاستراحة' : 'تخطي الخطوة'}</span>
      </motion.button>

      <motion.button 
        whileHover={{ scale: 1.02 }}
        onClick={onBack}
        className={`${buttonBase} bg-stadium-blue border border-white/20 text-white hover:bg-white/10`}
      >
        <SkipBack size={16} fill="currentColor" />
        <span>رجوع</span>
      </motion.button>

      <motion.button 
        whileHover={{ scale: 1.02 }}
        onClick={onStop}
        disabled={!isActive && !isPaused}
        className={`${buttonBase} bg-mario-red/10 text-mario-red border border-mario-red/30 hover:bg-mario-red hover:text-white`}
      >
        <Square size={16} fill="currentColor" />
        <span>إلغاء الجلسة</span>
      </motion.button>
    </div>
  );
});

export default TimerControls;
