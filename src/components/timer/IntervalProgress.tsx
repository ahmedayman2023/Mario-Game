import React, { useRef, useEffect, memo } from 'react';
import { Star, Zap, ChevronRight, Trophy, Info, Wind } from 'lucide-react';
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
    const isPhaseActive = currentIntervalIndex >= startIndex && currentIntervalIndex < startIndex + list.length;
    const isPhaseCompleted = currentIntervalIndex >= startIndex + list.length;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex flex-col">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{title}</div>
          </div>
          {isPhaseActive && (
            <div className="flex items-center gap-1 text-[10px] font-black text-mario-emerald uppercase tracking-widest animate-pulse">
              <span>الجلسة الحالية</span>
              <ChevronRight size={10} />
            </div>
          )}
        </div>
        
        <div className="overflow-hidden rounded-xl border border-slate-700 bg-black/40">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-700">
                <th className="p-2 text-[9px] font-black text-slate-400 uppercase tracking-widest border-l border-slate-700 w-10 text-center">#</th>
                <th className="p-2 text-[9px] font-black text-slate-400 uppercase tracking-widest border-l border-slate-700">النشاط الدراسي</th>
                <th className="p-2 text-[9px] font-black text-slate-400 uppercase tracking-widest w-16 text-center">المدة</th>
              </tr>
            </thead>
            <tbody>
              {list.map((duration, idx) => {
                const absoluteIdx = startIndex + idx;
                const isActive = absoluteIdx === currentIntervalIndex;
                const isCompleted = absoluteIdx < currentIntervalIndex;
                const step = FEYNMAN_STEPS[idx];
                
                return (
                  <tr 
                    key={idx}
                    data-active={isActive}
                    className={`
                      border-b border-slate-700/50 transition-colors duration-300
                      ${isActive ? 'bg-mario-emerald/30 text-white' : 
                        isCompleted ? 'bg-mario-emerald/5 text-mario-emerald/40' : 
                        idx % 2 === 0 ? 'bg-white/[0.02] text-slate-400' : 'bg-transparent text-slate-400'}
                      hover:bg-white/5
                    `}
                  >
                    <td className={`p-2 text-[10px] font-mono border-l border-slate-700/50 text-center ${isActive ? 'text-mario-emerald font-bold' : ''}`}>
                      {idx + 1}
                    </td>
                    <td className="p-2 border-l border-slate-700/50">
                      <div className="flex items-center gap-2">
                        {isActive && <Zap size={10} className="text-mario-emerald animate-pulse" fill="currentColor" />}
                        <span className={`text-[10px] font-medium leading-tight ${isActive ? 'text-white font-bold' : ''}`}>
                          {step?.title || `جلسة ${idx + 1}`}
                        </span>
                        {isCompleted && <Star size={10} className="text-amber-400 fill-amber-400 ml-auto" />}
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <span className={`text-[10px] font-mono ${isActive ? 'text-white font-bold' : ''}`}>
                        {duration}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
        {isBreakTime && (
          <div className="flex items-center gap-4 p-4 glass border-mario-emerald/30 rounded-2xl animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-mario-emerald flex items-center justify-center text-black">
              <Wind size={20} />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-mario-emerald">وقت الراحة</div>
              <div className="text-xs font-bold text-white mt-0.5">استرخِ قليلاً قبل الجلسة القادمة</div>
            </div>
          </div>
        )}
        {renderIntervals(intervals, 0, "الخطوات")}
      </div>
    </div>
  );
});

export default IntervalProgress;