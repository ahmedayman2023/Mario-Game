import React from 'react';

export default function TimerDisplay({ minutes, seconds, isActive, currentInterval, onTimeEdit, isBreakTime }: any) {
  return (
    <div className={`p-8 rounded-3xl text-center ${isBreakTime ? 'bg-green-900/20' : 'bg-slate-800/50'}`}>
      <div className="text-sm font-medium text-slate-400 mb-2 uppercase tracking-widest">
        {isBreakTime ? 'Break Time' : `Interval ${currentInterval}`}
      </div>
      <div className="text-7xl font-bold font-mono tracking-tighter mb-4">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      {!isActive && (
        <button 
          onClick={() => onTimeEdit(minutes * 60 + seconds)}
          className="text-xs text-slate-500 hover:text-white transition-colors"
        >
          Edit Time
        </button>
      )}
    </div>
  );
}
