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
}

const TimerDisplay = memo(function TimerDisplay({ 
  minutes, 
  seconds, 
  isActive, 
  currentInterval, 
  onTimeEdit, 
  isBreakTime,
  isWarmup,
  warmupIntervalIndex
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
            {isWarmup ? getWarmupLabel() : isBreakTime ? 'استراحة' : (FEYNMAN_STEPS[Number(currentInterval) - 1]?.title || `المرحلة ${currentInterval}`)}
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 max-w-[200px] truncate">
            {isWarmup ? getWarmupSubLabel() : isBreakTime ? 'إعادة شحن' : (FEYNMAN_STEPS[Number(currentInterval) - 1]?.description || 'الجلسة جارية')}
          </div>
        </motion.div>
      </AnimatePresence>

      <motion.div 
        className={`text-[8rem] sm:text-[12rem] md:text-[16rem] font-black scoreboard-font tracking-tighter leading-none select-none cursor-pointer transition-colors ${isWarmup ? 'text-amber-500' : isBreakTime ? 'text-broadcast-yellow' : 'text-white'}`}
        onClick={() => !isActive && onTimeEdit(minutes * 60 + seconds)}
        animate={isActive && !isBreakTime && !isWarmup ? {
          opacity: [1, 0.8, 1],
          transition: { duration: 1, repeat: Infinity, ease: "linear" }
        } : {}}
      >
        {String(minutes).padStart(2, '0')}<span className="animate-pulse">:</span>{String(seconds).padStart(2, '0')}
      </motion.div>

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
