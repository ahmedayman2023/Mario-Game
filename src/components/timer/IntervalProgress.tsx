import React, { useRef, useEffect, memo } from 'react';
import { Star, Zap, ChevronRight, Trophy } from 'lucide-react';
import { motion } from 'motion/react';

interface IntervalProgressProps {
  currentIntervalIndex: number;
  intervals: number[];
  progress: number;
  isBreakTime: boolean;
}

const IntervalProgress = memo(function IntervalProgress({ 
  currentIntervalIndex, 
  intervals, 
  progress, 
  isBreakTime 
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
              Step {isPhaseCompleted ? list.length : isPhaseActive ? (currentIntervalIndex - startIndex + 1) : 0} of {list.length}
            </div>
          </div>
          {isPhaseActive && (
            <div className="flex items-center gap-1 text-[10px] font-black text-mario-emerald uppercase tracking-widest animate-pulse">
              <span>Active Phase</span>
              <ChevronRight size={10} />
            </div>
          )}
          {isPhaseCompleted && (
            <div className="flex items-center gap-1 text-[10px] font-black text-amber-400 uppercase tracking-widest">
              <span>Completed</span>
              <Star size={10} fill="currentColor" />
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-6 sm:grid-cols-9 gap-2 p-2">
          {list.map((duration, idx) => {
            const absoluteIdx = startIndex + idx;
            const isActive = absoluteIdx === currentIntervalIndex;
            const isCompleted = absoluteIdx < currentIntervalIndex;
            
            return (
              <motion.div 
                key={idx} 
                data-active={isActive}
                initial={false}
                animate={isActive ? { scale: 1.1, zIndex: 10 } : { scale: 1, zIndex: 1 }}
                className="flex flex-col items-center gap-1"
              >
                <div className="relative group">
                  <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black border-2 transition-all duration-500
                    ${isActive ? 'bg-mario-emerald border-white text-black shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 
                      isCompleted ? 'bg-mario-emerald/20 border-mario-emerald/40 text-mario-emerald' : 
                      'glass border-white/5 text-slate-600'}
                  `}>
                    {duration}
                  </div>
                  {isCompleted && (
                    <div className="absolute -top-1 -right-1">
                      <Star size={10} className="text-amber-400 fill-amber-400" />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
          
          {/* The 19th Step: Phase Goal */}
          <div className="flex flex-col items-center gap-1">
            <div className={`
              w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all duration-500
              ${isPhaseCompleted ? 'bg-amber-400 border-white text-black shadow-[0_0_20px_rgba(251,191,36,0.5)]' : 
                'glass border-white/5 text-slate-700'}
            `}>
              <Trophy size={16} fill={isPhaseCompleted ? "currentColor" : "none"} />
            </div>
          </div>
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
          <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Mission Timeline</h3>
        </div>
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
          Progress: {currentIntervalIndex} / {intervals.length}
        </div>
      </div>

      <div ref={scrollRef} className="space-y-10">
        {renderIntervals(intervals.slice(0, 12), 0, "الشوط الأول (First Half)")}
        {renderIntervals(intervals.slice(12, 24), 12, "الشوط الثاني (Second Half)")}
      </div>
    </div>
  );
});

export default IntervalProgress;
