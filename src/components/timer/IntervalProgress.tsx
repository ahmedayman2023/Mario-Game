import React, { useRef, useEffect, memo } from 'react';
import { Star, Zap, ChevronRight, Trophy, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { WARMUP_INTERVALS, FEYNMAN_STEPS } from '../../constants';

interface IntervalProgressProps {
  currentIntervalIndex: number;
  intervals: number[];
  progress: number;
  isBreakTime: boolean;
  isWarmup: boolean;
  warmupIntervalIndex: number;
}

const IntervalProgress = memo(function IntervalProgress({ 
  currentIntervalIndex, 
  intervals, 
  progress, 
  isBreakTime,
  isWarmup,
  warmupIntervalIndex
}: IntervalProgressProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const activeElement = scrollRef.current.querySelector('[data-active="true"]');
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [currentIntervalIndex]);

  const renderIntervals = (list: number[], startIndex: number, title: string) => {
    const phaseProgress = Math.min(Math.max(currentIntervalIndex - startIndex, 0), list.length);
    const isPhaseActive = currentIntervalIndex >= startIndex && currentIntervalIndex < startIndex + list.length;
    const isPhaseCompleted = currentIntervalIndex >= startIndex + list.length;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex flex-col">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{title}</div>
            <div className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">
              الخطوة {isPhaseCompleted ? list.length : isPhaseActive ? (currentIntervalIndex - startIndex + 1) : 0} من {list.length}
            </div>
          </div>
          {isPhaseActive && (
            <div className="flex items-center gap-1 text-[10px] font-black text-mario-emerald uppercase tracking-widest animate-pulse">
              <span>المرحلة النشطة</span>
              <ChevronRight size={10} />
            </div>
          )}
          {isPhaseCompleted && (
            <div className="flex items-center gap-1 text-[10px] font-black text-amber-400 uppercase tracking-widest">
              <span>مكتمل</span>
              <Star size={10} fill="currentColor" />
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 gap-3 p-2">
          {list.map((duration, idx) => {
            const absoluteIdx = startIndex + idx;
            const isActive = absoluteIdx === currentIntervalIndex;
            const isCompleted = absoluteIdx < currentIntervalIndex;
            const step = FEYNMAN_STEPS[idx];
            
            return (
              <motion.div 
                key={idx} 
                data-active={isActive}
                initial={false}
                animate={isActive ? { scale: 1.02, zIndex: 10 } : { scale: 1, zIndex: 1 }}
                className={`
                  flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-500
                  ${isActive ? 'bg-mario-emerald border-white text-black shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 
                    isCompleted ? 'bg-mario-emerald/20 border-mario-emerald/40 text-mario-emerald' : 
                    'glass border-white/5 text-slate-400'}
                `}
              >
                <div className={`
                  w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-black border
                  ${isActive ? 'bg-white text-black border-black/10' : 
                    isCompleted ? 'bg-mario-emerald text-white border-none' : 
                    'bg-white/5 border-white/10'}
                `}>
                  {idx + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className={`text-[11px] font-black uppercase tracking-tight truncate ${isActive ? 'text-black' : 'text-white'}`}>
                    {step?.title}
                  </div>
                  <div className={`text-[9px] font-bold leading-relaxed mt-1 line-clamp-2 ${isActive ? 'text-black/70' : 'text-slate-500'}`}>
                    {step?.description}
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <div className={`text-[8px] font-black uppercase tracking-widest ${isActive ? 'text-black/60' : 'text-slate-500'}`}>
                    {duration} د
                  </div>
                  {isCompleted && (
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10 mt-12 glass rounded-3xl p-6 border-white/5">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-mario-emerald/20 flex items-center justify-center text-mario-emerald">
            <Zap size={16} fill="currentColor" />
          </div>
          <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">خطوات تقنية فاينمان</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">التقدم الإجمالي</div>
            <div className="text-[10px] font-black text-white uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10">
              {currentIntervalIndex} / {intervals.length}
            </div>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="space-y-10">
        {isWarmup && (
          <div className="flex items-center gap-4 p-4 glass border-amber-500/30 rounded-2xl animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-black">
              <Zap size={20} fill="currentColor" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-amber-500">
                {warmupIntervalIndex === 0 ? 'قناة اليوتيوب' : 
                 warmupIntervalIndex === 1 ? 'تمارين التنفس' : 'تسخين ذهني'}
              </div>
              <div className="text-xs font-bold text-white mt-0.5">
                المرحلة {warmupIntervalIndex + 1} من {WARMUP_INTERVALS.length}
              </div>
            </div>
          </div>
        )}
        {renderIntervals(intervals, 0, "الخطوات")}
      </div>
    </div>
  );
});

export default IntervalProgress;