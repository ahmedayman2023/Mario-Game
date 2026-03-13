import React from 'react';
import { Zap } from 'lucide-react';

export default function LevelPanel({ level, cycles }: any) {
  return (
    <div className="flex items-center gap-4 bg-emerald-600/10 border border-emerald-500/20 rounded-2xl p-4 mb-8">
      <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-900/40">
        <Zap size={24} fill="currentColor" />
      </div>
      <div>
        <div className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Level {level}</div>
        <div className="text-sm text-slate-300 font-medium">
          {cycles} full cycles completed
        </div>
      </div>
      <div className="ml-auto">
        <div className="h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 w-2/3" />
        </div>
      </div>
    </div>
  );
}
