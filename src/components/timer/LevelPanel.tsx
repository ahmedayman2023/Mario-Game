import React, { memo } from 'react';
import { Trophy, Star, Zap, Target } from 'lucide-react';
import { motion } from 'motion/react';

interface LevelPanelProps {
  level: number;
  cycles: number;
}

const LevelPanel = memo(function LevelPanel({ level, cycles }: LevelPanelProps) {
  return (
    <div className="bg-stadium-blue/80 border border-white/10 rounded-lg p-6 shadow-xl relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-broadcast-yellow/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-broadcast-yellow/20 transition-colors" />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <Trophy size={14} className="text-broadcast-yellow" fill="currentColor" />
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] scoreboard-font">المستوى</h3>
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} size={10} className={s <= (level % 5 || 5) ? "text-broadcast-yellow" : "text-slate-700"} fill="currentColor" />
          ))}
        </div>
      </div>

      <div className="flex items-end justify-between mb-6 relative z-10">
        <div>
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">الرتبة</div>
          <div className="text-3xl font-black text-white scoreboard-font tracking-tighter">
            Lvl {level + 1}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">الجلسات</div>
          <div className="text-xl font-black text-broadcast-yellow scoreboard-font tracking-tighter">
            {cycles}
          </div>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
          <span>التقدم للمستوى التالي</span>
          <span>{((cycles % 4) / 4) * 100}%</span>
        </div>
        <div className="h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${((cycles % 4) / 4) * 100}%` }}
            className="h-full bg-gradient-to-r from-broadcast-yellow to-amber-500"
          />
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-2 gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-mario-emerald/10 text-mario-emerald">
            <Zap size={14} fill="currentColor" />
          </div>
          <div>
            <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">السلسلة</div>
            <div className="text-xs font-black text-white">3 أيام</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-mario-red/10 text-mario-red">
            <Target size={14} fill="currentColor" />
          </div>
          <div>
            <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">الدقة</div>
            <div className="text-xs font-black text-white">94%</div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default LevelPanel;
