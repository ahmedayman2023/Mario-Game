import React, { memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FEYNMAN_STEPS } from '../../constants';

interface TimerDisplayProps {
  minutes: number;
  seconds: number;
  isActive: boolean;
  currentInterval: string | number;
  progress: number;
  onTimeEdit: (time: number) => void;
  isBreakTime: boolean;
  isWarmup: boolean;
  warmupIntervalIndex: number;
  isStopwatch: boolean;
  onToggleMode: () => void;
}

const TimerDisplay = memo(function TimerDisplay({
  minutes,
  seconds,
  isActive,
  currentInterval,
  progress,
  onTimeEdit,
  isBreakTime,
  isWarmup,
  warmupIntervalIndex,
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

  const digitColorClass = isWarmup ? 'text-amber-400' : isBreakTime ? 'text-mario-emerald' : 'text-white';
  const badgeClass = isWarmup
    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    : isBreakTime
      ? 'bg-mario-emerald/10 text-mario-emerald border-mario-emerald/30'
      : 'bg-sky-500/10 text-sky-300 border-sky-500/30';

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={isWarmup ? `warmup-${warmupIntervalIndex}` : isBreakTime ? 'break' : 'study'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex flex-col items-center gap-3 mb-6 text-center"
        >
          <div className={`px-6 py-2 text-[10px] font-black uppercase rounded-full tracking-[0.2em] border scoreboard-font ${badgeClass}`}>
            {isWarmup ? getWarmupLabel() : isBreakTime ? 'استراحة' : (currentStep?.title || `المرحلة ${currentInterval}`)}
          </div>
          <div className="text-xs font-bold text-slate-400 tracking-wide max-w-[320px] leading-relaxed">
            {isWarmup ? getWarmupSubLabel() : isBreakTime ? 'إعادة شحن الطاقة' : `الخطوة ${currentInterval} من ${FEYNMAN_STEPS.length}`}
          </div>
        </motion.div>
      </AnimatePresence>

      {!isWarmup && (
        <button
          onClick={onToggleMode}
          className={`mb-8 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all scoreboard-font ${
            isStopwatch
              ? 'bg-broadcast-yellow text-black border-broadcast-yellow'
              : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
          }`}
        >
          {isStopwatch ? 'ساعة إيقاف' : 'مؤقت تنازلي'}
        </button>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-10 md:gap-16">
        <motion.div
          className={`text-[6rem] sm:text-[8rem] md:text-[10rem] font-mono font-medium tracking-tight leading-none select-none cursor-pointer transition-colors scoreboard-font ${digitColorClass}`}
          onClick={() => !isActive && onTimeEdit(minutes * 60 + seconds)}
          animate={isActive && !isBreakTime && !isWarmup ? {
            scale: [1, 1.01, 1],
            transition: { duration: 1, repeat: Infinity }
          } : {}}
        >
          {String(minutes).padStart(2, '0')}<span className="opacity-20">:</span>{String(seconds).padStart(2, '0')}
        </motion.div>

        <div className="flex items-center gap-6">
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 scoreboard-font">التقدم</span>
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/10 shadow-2xl">
              <motion.span
                className="text-xl sm:text-2xl font-black text-white scoreboard-font"
                key={Math.round(progress)}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {Math.round(progress)}%
              </motion.span>
            </div>
          </motion.div>

          {!isWarmup && Number(currentInterval) > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex-shrink-0"
            >
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
                <div className="absolute inset-2 rounded-full glass border-2 border-mario-emerald/40 flex flex-col items-center justify-center">
                  <div className="text-[8px] font-black text-mario-emerald uppercase tracking-widest mb-1 scoreboard-font">إنجاز</div>
                  <div className="text-lg sm:text-xl font-black text-white scoreboard-font">
                    {displayPercentage}%
                  </div>
                </div>
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
      </div>

      <div className="mt-14 flex items-center gap-10 sm:gap-16">
        <div className="flex flex-col items-center">
          <div className="text-[9px] font-black uppercase text-slate-500 mb-3 tracking-widest scoreboard-font">الحالة</div>
          <div className={`text-[9px] font-black uppercase px-5 py-2 rounded-full tracking-widest border scoreboard-font ${isActive ? 'bg-mario-emerald/10 text-mario-emerald border-mario-emerald/30' : 'bg-mario-red/10 text-mario-red border-mario-red/30'}`}>
            {isActive ? 'جاري' : 'متوقف'}
          </div>
        </div>
        <div className="w-[1px] h-10 bg-white/10" />
        <div className="flex flex-col items-center">
          <div className="text-[9px] font-black uppercase text-slate-500 mb-3 tracking-widest scoreboard-font">التركيز</div>
          <div className="text-[9px] font-black uppercase px-5 py-2 bg-white/5 text-broadcast-yellow rounded-full border border-white/10 tracking-widest scoreboard-font">
            مرتفع
          </div>
        </div>
      </div>
    </div>
  );
});

export default TimerDisplay;
