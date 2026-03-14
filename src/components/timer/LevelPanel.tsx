import React, { memo } from 'react';
import { Trophy, Info } from 'lucide-react';
import { motion } from 'motion/react';

const LevelPanel = memo(function LevelPanel({ level, cycles }: { level: number; cycles: number }) {
  // Mocking the balls for visual match
  const balls = [true, true, true, false, false, false];

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-stadium-blue/80 border border-white/10 rounded-lg p-5 mb-6 text-white relative overflow-hidden group shadow-xl"
    >
      <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
        <Info size={14} className="cursor-help" />
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 bg-pitch-green rounded-lg flex items-center justify-center text-broadcast-yellow border border-white/10 shadow-inner">
            <Trophy size={32} />
          </div>
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -bottom-2 -right-2 w-7 h-7 bg-broadcast-yellow rounded flex items-center justify-center text-[11px] font-black text-black shadow-lg scoreboard-font"
          >
            L{level + 1}
          </motion.div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-broadcast-yellow text-black text-[9px] px-2 py-0.5 rounded-sm font-black uppercase tracking-widest">
              Pro League
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-slate-400 scoreboard-font">
              Season Progress
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              {balls.map((active, i) => (
                <motion.div 
                  key={i} 
                  initial={active ? { scale: 0 } : {}}
                  animate={active ? { scale: 1 } : {}}
                  className={`w-3 h-3 rounded-sm border border-white/10 ${active ? 'bg-mario-emerald shadow-[0_0_12px_rgba(0,255,136,0.4)]' : 'bg-slate-800'}`}
                />
              ))}
            </div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-tighter scoreboard-font">
              {balls.filter(b => b).length} / {balls.length} Wins
            </div>
          </div>
        </div>

        <div className="hidden md:flex flex-col items-end gap-1 pl-6 border-l border-white/10">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">VAR Status</div>
          <div className="text-[11px] font-black text-mario-emerald tracking-widest scoreboard-font">
            READY
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default LevelPanel;
