import React, { memo, useState } from 'react';
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
  const [isEditing, setIsEditing] = useState(false);
  const [editMinutes, setEditMinutes] = useState('');
  const [editSeconds, setEditSeconds] = useState('');

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

  const digitColorClass = isWarmup ? 'text-mario-yellow' : isBreakTime ? 'text-mario-emerald' : 'text-white';
  const badgeClass = isWarmup
    ? 'bg-mario-yellow text-black'
    : isBreakTime
      ? 'bg-mario-emerald text-white'
      : 'bg-mario-sky text-white';

  const startEditing = () => {
    if (isActive) return;
    setEditMinutes(String(minutes).padStart(2, '0'));
    setEditSeconds(String(seconds).padStart(2, '0'));
    setIsEditing(true);
  };

  const commitEdit = () => {
    const m = Math.max(0, parseInt(editMinutes, 10) || 0);
    const s = Math.min(59, Math.max(0, parseInt(editSeconds, 10) || 0));
    onTimeEdit(m * 60 + s);
    setIsEditing(false);
  };

  const cancelEdit = () => setIsEditing(false);

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={isWarmup ? `warmup-${warmupIntervalIndex}` : isBreakTime ? 'break' : 'study'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex flex-col items-center gap-3 mb-6 text-center"
        >
          <div className={`mario-block-sm px-5 py-2 text-[10px] font-black uppercase tracking-[0.1em] scoreboard-font ${badgeClass}`}>
            {isWarmup ? getWarmupLabel() : isBreakTime ? 'استراحة' : (currentStep?.title || `المرحلة ${currentInterval}`)}
          </div>
          <div className="text-xs font-black text-white/70 tracking-wide max-w-[320px] leading-relaxed">
            {isWarmup ? getWarmupSubLabel() : isBreakTime ? 'إعادة شحن الطاقة' : `الخطوة ${currentInterval} من ${FEYNMAN_STEPS.length}`}
          </div>
        </motion.div>
      </AnimatePresence>

      {!isWarmup && (
        <button
          onClick={onToggleMode}
          className={`mario-btn mb-8 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest scoreboard-font ${
            isStopwatch ? 'bg-mario-yellow text-black' : 'bg-panel text-white'
          }`}
        >
          {isStopwatch ? 'ساعة إيقاف' : 'مؤقت تنازلي'}
        </button>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 md:gap-14">
        {isEditing ? (
          <div className="bg-black border-4 border-black rounded-lg px-6 py-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] flex items-center gap-2">
            <input
              type="number"
              autoFocus
              value={editMinutes}
              onChange={(e) => setEditMinutes(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitEdit();
                if (e.key === 'Escape') cancelEdit();
              }}
              className="w-20 sm:w-24 bg-transparent text-[3.2rem] sm:text-[4.5rem] md:text-[5.5rem] font-pixel leading-none text-white text-center focus:outline-none"
            />
            <span className="text-[3.2rem] sm:text-[4.5rem] md:text-[5.5rem] font-pixel leading-none text-white">:</span>
            <input
              type="number"
              value={editSeconds}
              onChange={(e) => setEditSeconds(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitEdit();
                if (e.key === 'Escape') cancelEdit();
              }}
              className="w-20 sm:w-24 bg-transparent text-[3.2rem] sm:text-[4.5rem] md:text-[5.5rem] font-pixel leading-none text-white text-center focus:outline-none"
            />
            <div className="flex flex-col gap-2 mr-2">
              <button onClick={commitEdit} className="mario-btn bg-mario-emerald text-white px-3 py-1 text-[10px] font-black">✓</button>
              <button onClick={cancelEdit} className="mario-btn bg-mario-red text-white px-3 py-1 text-[10px] font-black">✕</button>
            </div>
          </div>
        ) : (
          <motion.div
            onClick={startEditing}
            title={isActive ? undefined : 'اضغط لتعديل الوقت'}
            className={`bg-black border-4 border-black rounded-lg px-6 py-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] ${isActive ? '' : 'cursor-pointer hover:brightness-125'}`}
            animate={isActive && !isBreakTime && !isWarmup ? {
              scale: [1, 1.01, 1],
              transition: { duration: 1, repeat: Infinity }
            } : {}}
          >
            <div className={`text-[3.2rem] sm:text-[4.5rem] md:text-[5.5rem] font-pixel leading-none select-none transition-colors ${digitColorClass}`}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
          </motion.div>
        )}

        <div className="flex items-center gap-5">
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-[9px] font-black text-white/60 uppercase tracking-widest mb-2 scoreboard-font">التقدم</span>
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-mario-sky mario-block-sm rounded-full flex items-center justify-center">
              <motion.span
                className="text-base sm:text-lg font-black text-white font-pixel"
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
              className="flex-shrink-0 flex flex-col items-center"
            >
              <span className="text-[9px] font-black text-white/60 uppercase tracking-widest mb-2 scoreboard-font">إنجاز</span>
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                <div className="absolute inset-0 bg-mario-yellow mario-block-sm rounded-full flex items-center justify-center">
                  <span className="text-base sm:text-lg font-black text-black font-pixel">
                    {displayPercentage}%
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="mt-12 flex items-center gap-6 sm:gap-10">
        <div className={`mario-block-sm px-4 py-2 text-[9px] font-black uppercase tracking-widest scoreboard-font ${isActive ? 'bg-mario-emerald text-white' : 'bg-mario-red text-white'}`}>
          {isActive ? 'جاري' : 'متوقف'}
        </div>
        <div className="mario-block-sm px-4 py-2 text-[9px] font-black uppercase tracking-widest scoreboard-font bg-panel text-white">
          تركيز مرتفع
        </div>
      </div>
    </div>
  );
});

export default TimerDisplay;
