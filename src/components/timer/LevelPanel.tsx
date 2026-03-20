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
      className="bg-white border ink-border rounded-lg p-8 text-ink relative overflow-hidden group paper-shadow"
    >
      <div className="flex items-center gap-10">
        <div className="relative">
          <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center text-primary border ink-border">
            <Trophy size={24} />
          </div>
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full border ink-border flex items-center justify-center text-[10px] font-bold text-primary shadow-sm"
          >
            {level + 1}
          </motion.div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-[10px] font-bold uppercase text-accent tracking-[0.2em]">
              المستوى {level + 1}
            </span>
            <div className="h-[1px] flex-1 bg-slate-100" />
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex gap-2">
              {balls.map((active, i) => (
                <motion.div 
                  key={i} 
                  initial={active ? { scale: 0 } : {}}
                  animate={active ? { scale: 1 } : {}}
                  className={`w-4 h-4 rounded-sm border ${active ? 'bg-primary border-primary' : 'bg-paper border-slate-200'}`}
                >
                  {active && <div className="w-full h-full flex items-center justify-center text-[8px] text-white font-bold">✓</div>}
                </motion.div>
              ))}
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {balls.filter(b => b).length} / {balls.length}
            </div>
          </div>
        </div>

        <div className="hidden md:flex flex-col items-end gap-2 pr-8 border-r ink-border">
          <div className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">الحالة</div>
          <div className="text-[10px] font-bold text-success uppercase tracking-widest">
            نشط
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default LevelPanel;
