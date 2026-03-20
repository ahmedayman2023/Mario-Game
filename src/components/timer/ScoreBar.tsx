import React, { memo } from 'react';
import { Trophy, Clock, User, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

const ScoreBar = memo(function ScoreBar({ me, time, onReset }: { me: number; time: number; onReset: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between bg-white border ink-border shadow-sm px-8 py-6 mb-12 text-ink rounded-lg paper-shadow"
    >
      <div className="flex items-center gap-12">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center border ink-border">
            <User size={16} className="text-primary" />
          </div>
          <div className="hidden sm:block">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">المستخدم</div>
            <div className="text-xs font-bold uppercase tracking-widest">أنا</div>
          </div>
        </div>
        
        <div className="flex items-center bg-paper border ink-border px-8 py-3 rounded-lg">
          <div className="flex flex-col items-center">
            <span className="text-4xl font-serif text-ink">{String(me).padStart(1, '0')}</span>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">التركيز</span>
          </div>
          <span className="mx-8 text-slate-100 font-serif text-2xl">/</span>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-serif text-accent">{String(time).padStart(1, '0')}</span>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">الوقت</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">الهدف</div>
            <div className="text-xs font-bold uppercase tracking-widest">الإنجاز</div>
          </div>
          <div className="w-10 h-10 bg-success/5 rounded-full flex items-center justify-center border ink-border">
            <Trophy size={16} className="text-success" />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-3">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
          <span className="text-[10px] font-bold uppercase text-success tracking-[0.2em]">جلسة نشطة</span>
        </div>
        <button
          onClick={onReset}
          className="text-[10px] font-bold uppercase text-slate-300 hover:text-danger transition-colors flex items-center gap-2 tracking-widest"
        >
          <RotateCcw size={12} />
          إعادة تعيين
        </button>
      </div>
    </motion.div>
  );
});

export default ScoreBar;
