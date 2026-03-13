import React, { memo } from 'react';
import { GraduationCap, Info } from 'lucide-react';
import { motion } from 'motion/react';

const LevelPanel = memo(function LevelPanel({ level, cycles }: { level: number; cycles: number }) {
  // Mocking the balls for visual match
  const balls = [true, true, true, false, false, false];

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass rounded-2xl p-5 mb-6 text-white relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
        <Info size={14} className="cursor-help" />
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center text-slate-400 border border-white/20 shadow-inner">
            <GraduationCap size={32} />
          </div>
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -bottom-2 -right-2 w-6 h-6 bg-mario-emerald rounded-lg flex items-center justify-center text-[10px] font-black text-black shadow-lg"
          >
            {level + 1}
          </motion.div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-mario-emerald/20 text-mario-emerald text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-widest border border-mario-emerald/30">
              Apprentice
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">
              Level Progression
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              {balls.map((active, i) => (
                <motion.div 
                  key={i} 
                  initial={active ? { scale: 0 } : {}}
                  animate={active ? { scale: 1 } : {}}
                  className={`w-3.5 h-3.5 rounded-full border border-white/10 ${active ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]' : 'bg-slate-800/50'}`}
                />
              ))}
            </div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
              {balls.filter(b => b).length} / {balls.length} Orbs
            </div>
          </div>
        </div>

        <div className="hidden md:flex flex-col items-end gap-3 pl-6 border-l border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Auto-Finish</span>
            <div className="w-8 h-4 bg-slate-800 rounded-full relative cursor-pointer">
              <div className="absolute left-1 top-1 w-2 h-2 bg-slate-600 rounded-full" />
            </div>
          </div>
          <div className="text-[10px] font-mono font-black text-mario-red tracking-widest">
            INTERVAL_53
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default LevelPanel;
