import React, { memo } from 'react';
import { Trophy, Timer, User, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

interface ScoreBarProps {
  me: number;
  time: number;
  onReset: () => void;
}

const ScoreBar = memo(function ScoreBar({ me, time, onReset }: ScoreBarProps) {
  return (
    <div className="scoreboard-panel p-4 md:p-6 mb-6 flex items-center justify-between overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      </div>

      <div className="flex items-center gap-4 md:gap-12 relative z-10">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-1">
            <User size={14} className="text-mario-emerald" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">أنا</span>
          </div>
          <motion.div 
            key={me}
            initial={{ scale: 1.2, color: '#10b981' }}
            animate={{ scale: 1, color: '#fff' }}
            className="text-3xl md:text-5xl font-black scoreboard-font tracking-tighter"
          >
            {me}
          </motion.div>
        </div>

        <div className="flex flex-col items-center">
          <div className="text-xl md:text-3xl font-black text-white/20 scoreboard-font">ضد</div>
        </div>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-1">
            <Timer size={14} className="text-mario-red" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">الوقت</span>
          </div>
          <motion.div 
            key={time}
            initial={{ scale: 1.2, color: '#ef4444' }}
            animate={{ scale: 1, color: '#fff' }}
            className="text-3xl md:text-5xl font-black scoreboard-font tracking-tighter"
          >
            {time}
          </motion.div>
        </div>
      </div>

      <div className="flex items-center gap-4 relative z-10">
        <motion.button
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.5 }}
          onClick={onReset}
          className="p-3 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          title="إعادة تصفير النتيجة"
        >
          <RotateCcw size={20} />
        </motion.button>
        
        <div className="hidden md:flex flex-col items-end">
          <div className="flex items-center gap-2 text-mario-emerald">
            <Trophy size={16} fill="currentColor" />
            <span className="text-xs font-black uppercase tracking-widest">المتصدر</span>
          </div>
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">أسبوع 12</div>
        </div>
      </div>
    </div>
  );
});

export default ScoreBar;
