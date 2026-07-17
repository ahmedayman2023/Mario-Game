import React, { useRef, useEffect, memo } from 'react';
import { Star, Zap, ChevronRight, Wind } from 'lucide-react';
import { WARMUP_INTERVALS, FEYNMAN_STEPS } from '../../constants';

interface IntervalProgressProps {
  currentIntervalIndex: number;
  intervals: number[];
  progress: number;
  isBreakTime: boolean;
  isWarmup: boolean;
  warmupIntervalIndex: number;
  onJumpToInterval?: (index: number) => void;
}

const IntervalProgress = memo(function IntervalProgress({
  currentIntervalIndex,
  intervals,
  progress,
  isBreakTime,
  isWarmup,
  warmupIntervalIndex,
  onJumpToInterval
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

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-black/50 scoreboard-font">{title}</div>
          {isPhaseActive && (
            <div className="flex items-center gap-1 text-[10px] font-black text-mario-emerald uppercase tracking-widest animate-pulse">
              <span>الجلسة الحالية</span>
              <ChevronRight size={10} />
            </div>
          )}
        </div>

        <div className="overflow-hidden mario-block-sm bg-white">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-black text-white">
                <th className="p-2 text-[9px] font-black uppercase tracking-widest border-l-2 border-white/20 w-10 text-center">#</th>
                <th className="p-2 text-[9px] font-black uppercase tracking-widest border-l-2 border-white/20">النشاط الدراسي</th>
                <th className="p-2 text-[9px] font-black uppercase tracking-widest w-16 text-center">المدة</th>
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
                    onClick={() => onJumpToInterval?.(idx)}
                    className={`
                      border-b-2 border-black/10 transition-colors cursor-pointer
                      ${isActive ? 'bg-mario-yellow' :
                        isCompleted ? 'bg-mario-emerald/10' :
                        idx % 2 === 0 ? 'bg-black/[0.03]' : 'bg-transparent'}
                      hover:bg-mario-sky/10
                    `}
                  >
                    <td className={`p-2 text-[10px] font-pixel border-l-2 border-black/10 text-center ${isActive ? 'text-black' : 'text-black/50'}`}>
                      {idx + 1}
                    </td>
                    <td className="p-2 border-l-2 border-black/10">
                      <div className="flex items-center gap-2">
                        {isActive && <Zap size={10} className="text-black" fill="currentColor" />}
                        <span className={`text-[10px] font-bold leading-tight ${isActive ? 'text-black font-black' : 'text-black/70'}`}>
                          {step?.title || `جلسة ${idx + 1}`}
                        </span>
                        {isCompleted && <Star size={10} className="text-mario-emerald fill-mario-emerald ml-auto" />}
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <span className={`text-[10px] font-pixel ${isActive ? 'text-black' : 'text-black/60'}`}>
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
    <div className="space-y-8 mt-8 bg-white mario-block p-5">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-mario-emerald border-2 border-black rounded-full flex items-center justify-center text-white">
            <Zap size={16} fill="currentColor" />
          </div>
          <h3 className="text-xs font-black text-black uppercase tracking-[0.2em] scoreboard-font">خطوات تقنية فاينمان</h3>
        </div>
        <div className="mario-block-sm bg-black px-3 py-1.5 text-[10px] font-pixel text-white">
          {currentIntervalIndex} / {intervals.length}
        </div>
      </div>

      <div ref={scrollRef} className="space-y-8">
        {isWarmup && (
          <div className="flex items-center gap-4 p-4 mario-block-sm bg-mario-yellow">
            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-mario-yellow">
              <Zap size={20} fill="currentColor" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-black/70">
                {warmupIntervalIndex === 0 ? 'قناة اليوتيوب' :
                 warmupIntervalIndex === 1 ? 'تمارين التنفس' : 'تسخين ذهني'}
              </div>
              <div className="text-xs font-black text-black mt-0.5">
                المرحلة {warmupIntervalIndex + 1} من {WARMUP_INTERVALS.length}
              </div>
            </div>
          </div>
        )}
        {isBreakTime && (
          <div className="flex items-center gap-4 p-4 mario-block-sm bg-mario-emerald">
            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-mario-emerald">
              <Wind size={20} />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-white/80">وقت الراحة</div>
              <div className="text-xs font-black text-white mt-0.5">استرخِ قليلاً قبل الجلسة القادمة</div>
            </div>
          </div>
        )}
        {renderIntervals(intervals, 0, "الخطوات")}
      </div>
    </div>
  );
});

export default IntervalProgress;
