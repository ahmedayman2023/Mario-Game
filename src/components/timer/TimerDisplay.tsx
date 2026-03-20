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
    <div className="flex flex-col items-center justify-center py-12">
      <AnimatePresence mode="wait">
        <motion.div
          key={isWarmup ? `warmup-${warmupIntervalIndex}` : isBreakTime ? 'break' : 'study'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex flex-col items-center gap-4 mb-12"
        >
          <div className={`px-6 py-2 text-[10px] font-bold uppercase rounded-full tracking-[0.2em] ${isWarmup ? 'bg-warning/5 text-warning border ink-border' : isBreakTime ? 'bg-success/5 text-success border ink-border' : 'bg-primary/5 text-primary border ink-border'}`}>
            {isWarmup ? getWarmupLabel() : isBreakTime ? 'استراحة' : (FEYNMAN_STEPS[Number(currentInterval) - 1]?.title || `المرحلة ${currentInterval}`)}
          </div>
          <div className="text-xs font-serif italic text-slate-400 tracking-wide max-w-[300px] text-center leading-relaxed">
            {isWarmup ? getWarmupSubLabel() : isBreakTime ? 'إعادة شحن' : (FEYNMAN_STEPS[Number(currentInterval) - 1]?.description || 'الجلسة جارية')}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-12 md:gap-20">
        <motion.div 
          className={`text-[8rem] sm:text-[10rem] md:text-[12rem] font-mono font-medium tracking-tight leading-none select-none cursor-pointer transition-colors ${isWarmup ? 'text-warning' : isBreakTime ? 'text-success' : 'text-ink'}`}
          onClick={() => !isActive && onTimeEdit(minutes * 60 + seconds)}
          animate={isActive && !isBreakTime && !isWarmup ? {
            scale: [1, 1.01, 1],
            transition: { duration: 1, repeat: Infinity }
          } : {}}
        >
          {String(minutes).padStart(2, '0')}<span className="opacity-20">:</span>{String(seconds).padStart(2, '0')}
        </motion.div>

        {!isWarmup && Number(currentInterval) > 0 && (
          <motion.div 
            initial={{ scale: 0, opacity: 0, x: 20 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            className="flex-shrink-0"
          >
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 bg-white border ink-border rounded-lg paper-shadow flex flex-col items-center justify-center overflow-hidden">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">الإنجاز</div>
              <div className="text-4xl font-serif text-ink">
                {isBreakTime 
                  ? (FEYNMAN_STEPS[Number(currentInterval) - 1]?.completionPercentage || 0)
                  : (FEYNMAN_STEPS[Number(currentInterval) - 2]?.completionPercentage || 0)}%
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1.5 bg-paper">
                <div 
                  className="h-full bg-accent transition-all duration-1000" 
                  style={{ width: `${isBreakTime ? (FEYNMAN_STEPS[Number(currentInterval) - 1]?.completionPercentage || 0) : (FEYNMAN_STEPS[Number(currentInterval) - 2]?.completionPercentage || 0)}%` }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="mt-16 flex items-center gap-16">
        <div className="flex flex-col items-center">
          <div className="text-[10px] font-bold uppercase text-slate-400 mb-4 tracking-widest">الحالة</div>
          <div className={`text-[10px] font-bold uppercase px-6 py-2 rounded-full tracking-widest border ${isActive ? 'bg-success/5 text-success border-success/20' : 'bg-danger/5 text-danger border-danger/20'}`}>
            {isActive ? 'جاري' : 'متوقف'}
          </div>
        </div>
        <div className="w-[1px] h-12 bg-slate-100" />
        <div className="flex flex-col items-center">
          <div className="text-[10px] font-bold uppercase text-slate-400 mb-4 tracking-widest">التركيز</div>
          <div className="text-[10px] font-bold uppercase px-6 py-2 bg-paper text-slate-600 rounded-full border ink-border tracking-widest">
            مرتفع
          </div>
        </div>
      </div>
    </div>
  );
});

export default TimerDisplay;
