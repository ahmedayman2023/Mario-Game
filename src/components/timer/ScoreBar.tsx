import React, { memo } from 'react';
import { Trophy, Clock, User, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

const ScoreBar = memo(function ScoreBar({ me, time, onReset }: { me: number; time: number; onReset: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col md:flex-row justify-between items-center gap-4 glass rounded-2xl px-4 py-4 md:px-8 md:py-6 mb-4 text-white shadow-2xl border border-white/10"
    >
      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
            <Clock size={12} className="text-mario-red" />
            <span>Time Penalty</span>
          </div>
          <div className="text-3xl md:text-4xl font-mono font-black text-mario-red drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
            {String(time).padStart(2, '0')}
          </div>
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-1 md:gap-2">
        <div className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Match Status</div>
        <div className="flex items-center gap-4">
          <div className="px-3 py-0.5 md:px-4 md:py-1 bg-white/5 rounded-lg border border-white/10 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">
            {me > time ? "Winning" : me < time ? "Losing" : "Draw"}
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05, rotate: 180 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReset}
          className="flex items-center gap-2 mt-1 md:mt-2 px-2 py-1 md:px-3 md:py-1.5 rounded-full bg-white/5 border border-white/10 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Reset Match Score"
        >
          <RotateCcw size={10} />
          <span>Reset Match</span>
        </motion.button>
      </div>
      
      <div className="flex items-center gap-4 text-right w-full md:w-auto justify-between md:justify-end">
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
            <span>My Score</span>
            <User size={12} className="text-mario-emerald" />
          </div>
          <div className="text-3xl md:text-4xl font-mono font-black text-mario-emerald drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
            {String(me).padStart(2, '0')}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default ScoreBar;
