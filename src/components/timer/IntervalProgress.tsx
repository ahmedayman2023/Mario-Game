import React from 'react';

export default function IntervalProgress({ currentIntervalIndex, intervals, progress, isBreakTime }: any) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between text-xs font-medium text-slate-500 uppercase tracking-widest">
        <span>Progress</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${isBreakTime ? 'bg-green-500' : 'bg-emerald-500'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex flex-wrap gap-1 justify-center mt-4">
        {intervals.map((_: any, idx: number) => (
          <div 
            key={idx}
            className={`w-2 h-2 rounded-full ${
              idx < currentIntervalIndex ? 'bg-emerald-500' : 
              idx === currentIntervalIndex ? 'bg-white animate-pulse' : 
              'bg-slate-800'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
