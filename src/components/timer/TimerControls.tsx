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
  isStopwatch: boolean;
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
  isWarmup,
  isStopwatch
}: TimerControlsProps) {
  const buttonBase = "mario-btn flex items-center justify-center gap-3 px-8 py-4 font-black text-[10px] uppercase tracking-[0.15em] scoreboard-font";

  return (
    <div className="flex flex-wrap justify-center items-center gap-4 mb-16">
      <AnimatePresence mode="wait">
        {isActive ? (
          <motion.button
            key="pause"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={onPause}
            className={`${buttonBase} bg-mario-yellow text-black`}
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
            className={`${buttonBase} bg-mario-emerald text-white`}
          >
            <Play size={14} strokeWidth={3} />
            <span>{isPaused ? 'استئناف' : isWarmup ? 'بدء' : 'ابدأ الآن'}</span>
          </motion.button>
        )}
      </AnimatePresence>

      <button
        onClick={onSkip}
        className={`${buttonBase} bg-white text-black`}
      >
        <SkipForward size={14} strokeWidth={3} />
        <span>{isStopwatch ? 'التالي' : 'تخطي'}</span>
      </button>

      <button
        onClick={onBack}
        className={`${buttonBase} bg-white text-black`}
      >
        <SkipBack size={14} strokeWidth={3} />
        <span>رجوع</span>
      </button>

      <button
        onClick={onStop}
        disabled={!isActive && !isPaused}
        className={`${buttonBase} bg-mario-red text-white`}
      >
        <Square size={14} strokeWidth={3} />
        <span>إلغاء</span>
      </button>
    </div>
  );
});

export default TimerControls;
