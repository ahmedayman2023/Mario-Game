import React from 'react';
import { Trophy } from 'lucide-react';

export default function ScoreBar({ me, time }: any) {
  return (
    <div className="flex justify-between items-center bg-black/40 backdrop-blur-md border border-white/5 rounded-2xl px-6 py-3 mb-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-500">
          <Trophy size={16} />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Player</div>
          <div className="text-xl font-black text-white leading-none">{me}</div>
        </div>
      </div>
      
      <div className="h-8 w-[1px] bg-white/10" />
      
      <div className="flex items-center gap-3 text-right">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Time</div>
          <div className="text-xl font-black text-white leading-none">{time}</div>
        </div>
        <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center text-amber-500">
          <Trophy size={16} />
        </div>
      </div>
    </div>
  );
}
