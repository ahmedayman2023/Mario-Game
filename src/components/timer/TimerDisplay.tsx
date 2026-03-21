import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FEYNMAN_STEPS } from '../../constants';

interface TimerDisplayProps {
  minutes: number;
  seconds: number;
  isActive: boolean;
  currentInterval: string | number;
  progress: number; // النسبة المئوية من 0 إلى 100
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
  progress,
  onTimeEdit, 
  isBreakTime,
  isWarmup,
  warmupIntervalIndex
}: TimerDisplayProps) {

  // حساب محيط الدائرة (القطر 120 * ط)
  const radius = 170;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const getWarmupLabel = () => {
    const labels = ['قناة اليوتيوب', 'تمارين التنفس', 'تسخين ذهني', 'تمارين الاستطالة'];
    return labels[warmupIntervalIndex] || 'تسخين';
  };

  return (
    <div className="flex flex-col items-center justify-center w-full py-12 text-white">
      
      {/* العنوان الفرعي والحالة */}
      <div className="flex flex-col items-center mb-8">
        <div className="px-6 py-1 border border-white/10 rounded-full bg-white/5 text-[12px] font-bold text-slate-300 mb-3 tracking-wide">
          {isWarmup ? getWarmupLabel() : isBreakTime ? 'استراحة' : 'جلسة تركيز'}
        </div>
        <div className="text-slate-500 text-sm font-light">
          {isWarmup ? 'تجهيز الأجواء' : isBreakTime ? 'إعادة شحن' : (FEYNMAN_STEPS[Number(currentInterval) - 1]?.title || 'تعلم')}
        </div>
      </div>

      {/* المؤقت مع الدائرة */}
      <div className="relative flex items-center justify-center w-[400px] h-[400px]">
        {/* الدائرة الخلفية الرمادية */}
        <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 400 400">
          <circle
            cx="200"
            cy="200"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-white/5"
          />
          {/* دائرة التقدم الملونة */}
          <motion.circle
            cx="200"
            cy="200"
            r={radius}
            stroke="#D9F13F" // اللون الفسفوري من الصورة
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeInOut" }}
            strokeLinecap="round"
          />
        </svg>

        {/* أرقام المؤقت */}
        <div 
          className="z-10 text-[8rem] md:text-[9rem] font-bold tracking-tighter cursor-pointer select-none"
          onClick={() => !isActive && onTimeEdit(minutes * 60 + seconds)}
        >
          <span className="tabular-nums">{String(minutes).padStart(2, '0')}</span>
          <span className={`transition-opacity duration-500 ${isActive ? 'animate-pulse' : 'opacity-20'}`}>:</span>
          <span className="tabular-nums">{String(seconds).padStart(2, '0')}</span>
        </div>
      </div>

      {/* شريط المعلومات السفلي */}
      <div className="grid grid-cols-2 gap-12 w-full max-w-sm mt-12 pt-8 border-t border-white/5">
        <div className="flex flex-col items-center border-r border-white/10 pr-12">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 mb-3">الحالة</span>
          <div className="bg-white text-black px-4 py-1.5 rounded-full text-[11px] font-black flex items-center gap-2">
             <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
             {isActive ? 'جاري العمل' : 'متوقف مؤقتاً'}
          </div>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 mb-3">التركيز</span>
          <div className="border border-white/20 px-4 py-1.5 rounded-full text-[11px] font-black tracking-tighter">
             مرتفع جداً
          </div>
        </div>
      </div>
    </div>
  );
});

export default TimerDisplay;