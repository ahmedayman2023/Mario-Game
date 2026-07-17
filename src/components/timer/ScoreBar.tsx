import React, { memo } from 'react';
import { Star, Clock, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

const ScoreBar = memo(function ScoreBar({ me, time, onReset }: { me: number; time: number; onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between bg-black mario-block px-4 py-3 md:px-6 md:py-4 mb-6"
    >
      <div className="flex items-center gap-3 md:gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-mario-yellow border-2 border-black rounded-full flex items-center justify-center">
            <Star size={18} className="text-black fill-black" />
          </div>
          <div className="hidden sm:block">
            <div className="text-[9px] font-black uppercase tracking-widest text-white/50 scoreboard-font">اللاعب</div>
            <div className="text-sm font-black text-white scoreboard-font">أنا</div>
          </div>
        </div>

        <div className="flex items-center bg-white/5 rounded px-4 py-2 border-2 border-white/10">
          <div className="flex flex-col items-center">
            <span className="text-2xl md:text-3xl font-pixel text-mario-emerald">{String(me).padStart(1, '0')}</span>
            <span className="text-[8px] font-black text-white/40 uppercase tracking-tighter mt-1">الأقصى 20</span>
          </div>
          <span className="mx-3 text-white/30 font-black">-</span>
          <div className="flex flex-col items-center">
            <span className="text-2xl md:text-3xl font-pixel text-mario-red">{String(time).padStart(1, '0')}</span>
            <span className="text-[8px] font-black text-white/40 uppercase tracking-tighter mt-1">الأقصى 20</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block text-right">
            <div className="text-[9px] font-black uppercase tracking-widest text-white/50 scoreboard-font">الخصم</div>
            <div className="text-sm font-black text-white scoreboard-font">الوقت</div>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 bg-mario-red border-2 border-black rounded-full flex items-center justify-center">
            <Clock size={18} className="text-white" />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-mario-emerald rounded-full animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-mario-yellow scoreboard-font">جلسة نشطة</span>
        </div>
        <button
          onClick={onReset}
          className="text-[9px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors flex items-center gap-1"
        >
          <RotateCcw size={10} />
          إعادة البدء
        </button>
      </div>
    </motion.div>
  );
});

export default ScoreBar;
