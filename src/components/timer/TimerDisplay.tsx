import React, { memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FEYNMAN_STEPS } from '../../constants';

interface TimerDisplayProps {
  minutes: number;
  seconds: number;
  isActive: boolean;
  currentInterval: string | number;
  onTimeEdit: (time: number) => void;
  isBreakTime: boolean;
  isWarmup: boolean;
  warmupIntervalIndex: number;
  progress: number;
  isStopwatch: boolean;
  onToggleMode: () => void;
}

const TimerDisplay = memo(function TimerDisplay({ 
  minutes, 
  seconds, 
  isActive, 
  currentInterval, 
  onTimeEdit, 
  isBreakTime,
  isWarmup,
  warmupIntervalIndex,
  progress,
  isStopwatch,
  onToggleMode
}: TimerDisplayProps) {
  const getWarmupLabel = () => {
    switch (warmupIntervalIndex) {
      case 0: return 'قناة اليوتيوب';
      case 1: return 'تمارين التنفس';
      case 2: return 'تسخين ذهني';
      case 3: return 'تمارين الاستطالة';
      default: return 'تسخين';
    }
  };

  const getWarmupSubLabel = () => {
    switch (warmupIntervalIndex) {
      case 0: return 'تجهيز الأجواء';
      case 1: return 'ركز على تنفسك';
      case 2: return 'نشط عقلك مع Lumosity';
      case 3: return 'جهز نفسك للتعلم';
      default: return 'استعد للتعلم';
    }
  };

  const currentStep = !isWarmup && !isBreakTime ? FEYNMAN_STEPS[Number(currentInterval) - 1] : null;
  const overallProgress = isWarmup ? 0 : 
    ((Number(currentInterval) - 1 + (isBreakTime ? 1 : progress / 100)) / FEYNMAN_STEPS.length) * 100;
  const displayPercentage = Math.min(100, Math.round(overallProgress));

  return (
    <div className="flex flex-col items-center justify-center py-6 md:py-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={isWarmup ? `warmup-${warmupIntervalIndex}` : isBreakTime ? 'break' : 'study'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center gap-2 mb-4"
        >
          <div className={`px-3 py-1 text-black text-[10px] font-black uppercase tracking-widest rounded-sm ${isWarmup ? 'bg-amber-500' : 'bg-broadcast-yellow'}`}>
            {isWarmup ? getWarmupLabel() : isBreakTime ? 'استراحة' : (currentStep?.title || `الجلسة ${currentInterval}`)}
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 max-w-[200px] truncate">
            {isWarmup ? getWarmupSubLabel() : isBreakTime ? 'إعادة شحن' : 'الجلسة جارية'}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex flex-row items-center justify-center gap-4 sm:gap-8 md:gap-12 relative">
        <motion.div 
          className={`text-[5rem] sm:text-[8rem] md:text-[10rem] font-black scoreboard-font tracking-tighter leading-none select-none cursor-pointer transition-colors ${isWarmup ? 'text-amber-500' : isBreakTime ? 'text-broadcast-yellow' : 'text-white'}`}
          onClick={() => !isActive && onTimeEdit(minutes * 60 + seconds)}
          animate={isActive && !isBreakTime && !isWarmup ? {
            opacity: [1, 0.8, 1],
            transition: { duration: 1, repeat: Infinity, ease: "linear" }
          } : {}}
        >
          {String(minutes).padStart(2, '0')}<span className="animate-pulse">:</span>{String(seconds).padStart(2, '0')}
        </motion.div>

        {/* Stopwatch Toggle Button */}
        <div className="absolute -top-8 right-0 sm:-right-12">
          <button
            onClick={onToggleMode}
            className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all ${
              isStopwatch 
                ? 'bg-broadcast-yellow text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
            }`}
          >
            {isStopwatch ? 'Stopwatch' : 'Timer'}
          </button>
        </div>

        {!isWarmup && Number(currentInterval) > 0 && (
          <motion.div 
            initial={{ scale: 0, opacity: 0, x: 20 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            className="flex-shrink-0"
          >
            <div className="relative w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 flex items-center justify-center">
              {/* Outer Glow Circle */}
              <div className="absolute inset-0 rounded-full border-4 border-mario-emerald/20 animate-pulse shadow-[0_0_30px_rgba(16,185,129,0.3)]" />
              
              {/* Main Circle */}
              <div className="absolute inset-2 rounded-full border-2 border-mario-emerald/40 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center">
                <div className="text-[7px] sm:text-[9px] font-black text-mario-emerald uppercase tracking-widest leading-none mb-1">إنجاز</div>
                <div className="text-lg sm:text-2xl md:text-3xl font-black text-white scoreboard-font leading-none">
                  {displayPercentage}%
                </div>
              </div>
              
              {/* Progress Ring (SVG) */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (283 * displayPercentage) / 100}
                  className="text-mario-emerald transition-all duration-1000 ease-out"
                />
              </svg>
            </div>
          </motion.div>
        )}
      </div>

      <div className="mt-6 flex items-center gap-8">
        <div className="flex flex-col items-center">
          <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">الحالة</div>
          <div className={`text-xs font-black uppercase tracking-widest ${isActive ? 'text-mario-emerald' : 'text-mario-red'}`}>
            {isActive ? 'لعب' : 'متوقف'}
          </div>
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div className="flex flex-col items-center">
          <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">الشدة</div>
          <div className="text-xs font-black uppercase tracking-widest text-white">عالية</div>
        </div>
      </div>
    </div>
  );
});

export default TimerDisplay;