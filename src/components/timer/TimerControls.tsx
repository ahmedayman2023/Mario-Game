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
  const buttonBase = "flex items-center justify-center gap-3 px-8 py-4 rounded-lg transition-all font-bold text-[10px] disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-[0.2em] border ink-border paper-shadow";

  return (
    <div className="flex flex-wrap justify-center items-center gap-6 mb-16">
      <AnimatePresence mode="wait">
        {isActive ? (
          <motion.button 
            key="pause"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={onPause}
            className={`${buttonBase} bg-warning text-white hover:bg-warning/90`}
          >
            <Pause size={14} strokeWidth={3} />
            <span>توقف مؤقت</span>
          </motion.button>
        ) : (
          <motion.button 
            key="play"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={onStart}
            className={`${buttonBase} bg-primary text-white hover:bg-primary/90`}
          >
            <Play size={14} strokeWidth={3} />
            <span>{isPaused ? 'استئناف' : isWarmup ? 'بدء' : 'ابدأ الآن'}</span>
          </motion.button>
        )}
      </AnimatePresence>

      <button 
        onClick={onSkip}
        className={`${buttonBase} bg-white text-ink hover:bg-paper`}
      >
        <SkipForward size={14} strokeWidth={3} />
        <span>تخطي</span>
      </button>

      <button 
        onClick={onBack}
        className={`${buttonBase} bg-white text-ink hover:bg-paper`}
      >
        <SkipBack size={14} strokeWidth={3} />
        <span>رجوع</span>
      </button>

      <button 
        onClick={onStop}
        disabled={!isActive && !isPaused}
        className={`${buttonBase} bg-danger/5 text-danger hover:bg-danger hover:text-white border-danger/20`}
      >
        <Square size={14} strokeWidth={3} />
        <span>إلغاء</span>
      </button>
    </div>
  );
});

export default TimerControls;
