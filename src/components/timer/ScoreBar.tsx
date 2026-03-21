import React, { memo } from 'react';
import { Trophy, Clock, User, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

const ScoreBar = memo(function ScoreBar({ me, time, onReset }: { me: number; time: number; onReset: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between scoreboard-panel rounded-lg px-4 py-3 md:px-6 md:py-4 mb-6 text-white shadow-2xl"
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden p-1">
            <img 
              src="https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg" 
              alt="Real Madrid" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="hidden sm:block">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">صاحب الأرض</div>
            <div className="text-sm font-black uppercase tracking-tight">ريال مدريد</div>
          </div>
        </div>
        
        <div className="flex items-center bg-black/40 rounded px-4 py-2 border border-white/10">
          <div className="flex flex-col items-center">
            <span className="text-2xl md:text-3xl font-black scoreboard-font text-white">{String(me).padStart(1, '0')}</span>
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">الأقصى 10</span>
          </div>
          <span className="mx-3 text-slate-500 font-black">-</span>
          <div className="flex flex-col items-center">
            <span className="text-2xl md:text-3xl font-black scoreboard-font text-mario-red">{String(time).padStart(1, '0')}</span>
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">الأقصى 10</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">الضيف</div>
            <div className="text-sm font-black uppercase tracking-tight">مانشستر سيتي</div>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden p-1">
            <img 
              src="https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg" 
              alt="Manchester City" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-mario-emerald rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-broadcast-yellow">جلسة مباشرة</span>
        </div>
        <button
          onClick={onReset}
          className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors flex items-center gap-1"
        >
          <RotateCcw size={10} />
          إعادة البدء
        </button>
      </div>
    </motion.div>
  );
});

export default ScoreBar;