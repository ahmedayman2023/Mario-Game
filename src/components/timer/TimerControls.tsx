import React from 'react';
import { Play, Pause, Square, SkipForward } from 'lucide-react';

export default function TimerControls({ isActive, isPaused, onStart, onPause, onStop, onSkip, isBreakTime }: any) {
  return (
    <div className="flex justify-center items-center gap-4 mb-8">
      <button 
        onClick={onStop}
        className="p-4 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-colors text-slate-400"
        title="Stop Session"
      >
        <Square size={24} />
      </button>

      {isActive ? (
        <button 
          onClick={onPause}
          className="p-6 bg-amber-600 rounded-3xl hover:bg-amber-500 transition-all transform hover:scale-105 shadow-lg shadow-amber-900/20"
        >
          <Pause size={32} fill="currentColor" />
        </button>
      ) : (
        <button 
          onClick={onStart}
          className="p-6 bg-emerald-600 rounded-3xl hover:bg-emerald-500 transition-all transform hover:scale-105 shadow-lg shadow-emerald-900/20"
        >
          <Play size={32} fill="currentColor" className="ml-1" />
        </button>
      )}

      <button 
        onClick={onSkip}
        className="p-4 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-colors text-slate-400"
        title="Skip Interval"
      >
        <SkipForward size={24} />
      </button>
    </div>
  );
}
