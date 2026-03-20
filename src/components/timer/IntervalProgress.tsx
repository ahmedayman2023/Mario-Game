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
      <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <div className="flex flex-col">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">{title}</div>
            <div className="text-xs font-serif italic text-slate-500">
              الخطوة {isPhaseCompleted ? list.length : isPhaseActive ? (currentIntervalIndex - startIndex + 1) : 0} من {list.length}
            </div>
          </div>
          {isPhaseActive && (
            <div className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest animate-pulse">
              <span>المرحلة النشطة</span>
              <ChevronRight size={12} />
            </div>
          )}
          {isPhaseCompleted && (
            <div className="flex items-center gap-2 text-[10px] font-bold text-success uppercase tracking-widest">
              <span>مكتمل</span>
              <Star size={12} fill="currentColor" />
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 gap-6 p-2">
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
                  flex items-center gap-8 p-6 rounded-lg border transition-all duration-500 paper-shadow
                  ${isActive ? 'bg-white border-accent text-ink' : 
                    isCompleted ? 'bg-success/5 border-success/20 text-success' : 
                    'bg-paper border-slate-100 text-slate-400'}
                `}
              >
                <div className={`
                  w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold border ink-border
                  ${isActive ? 'bg-accent text-white border-none' : 
                    isCompleted ? 'bg-success text-white border-none' : 
                    'bg-white text-slate-300'}
                `}>
                  {idx + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-serif font-bold tracking-tight truncate ${isActive ? 'text-ink' : 'text-slate-700'}`}>
                    {step?.title}
                  </div>
                  <div className={`text-[10px] font-medium leading-relaxed mt-2 line-clamp-2 ${isActive ? 'text-slate-500' : 'text-slate-400'}`}>
                    {step?.description}
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-accent' : 'text-slate-400'}`}>
                    {duration} د
                  </div>
                  {isCompleted && (
                    <Star size={12} className="text-accent fill-accent" />
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
    <div className="space-y-12 mt-16 bg-white rounded-lg p-10 border ink-border paper-shadow">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary border ink-border">
            <Zap size={16} fill="currentColor" />
          </div>
          <h3 className="text-sm font-serif font-bold text-ink italic">خطوات تقنية فاينمان</h3>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">التقدم الإجمالي</div>
            <div className="text-[10px] font-bold text-ink uppercase tracking-widest bg-paper px-6 py-2 rounded-full border ink-border">
              {currentIntervalIndex} / {intervals.length}
            </div>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="space-y-16">
        {isWarmup && (
          <div className="flex items-center gap-8 p-8 bg-warning/5 border border-warning/20 rounded-lg animate-pulse">
            <div className="w-12 h-12 rounded-lg bg-warning flex items-center justify-center text-white shadow-lg border ink-border">
              <Zap size={20} fill="currentColor" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-warning mb-1">
                {warmupIntervalIndex === 0 ? 'قناة اليوتيوب' : 
                 warmupIntervalIndex === 1 ? 'تمارين التنفس' : 'تسخين ذهني'}
              </div>
              <div className="text-xs font-serif italic text-ink">
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
