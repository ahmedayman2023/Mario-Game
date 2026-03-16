import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wind } from 'lucide-react';

const PHASES = [
  { name: 'استنشاق', duration: 4, color: 'bg-emerald-500', scale: 1.5 },
  { name: 'حبس', duration: 4, color: 'bg-blue-500', scale: 1.5 },
  { name: 'زفير', duration: 4, color: 'bg-amber-500', scale: 1.0 },
  { name: 'انتظار', duration: 4, color: 'bg-slate-500', scale: 1.0 },
];

const BoxBreathing = () => {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(PHASES[0].duration);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          const nextIndex = (phaseIndex + 1) % PHASES.length;
          setPhaseIndex(nextIndex);
          return PHASES[nextIndex].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phaseIndex]);

  const currentPhase = PHASES[phaseIndex];

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl">
      <div className="flex items-center gap-2 mb-8">
        <Wind className="text-emerald-400 animate-pulse" size={20} />
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-400 scoreboard-font">
          تقنية صندوق التنفس
        </h3>
      </div>

      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Outer Ring */}
        <div className="absolute inset-0 border-2 border-white/5 rounded-full" />
        
        {/* Breathing Circle */}
        <motion.div
          animate={{
            scale: currentPhase.scale,
            backgroundColor: phaseIndex === 0 ? '#10b981' : phaseIndex === 1 ? '#3b82f6' : phaseIndex === 2 ? '#f59e0b' : '#64748b'
          }}
          transition={{ duration: 4, ease: "easeInOut" }}
          className="w-24 h-24 rounded-full opacity-20 blur-xl"
        />
        
        <motion.div
          animate={{
            scale: currentPhase.scale,
          }}
          transition={{ duration: 4, ease: "easeInOut" }}
          className={`w-24 h-24 rounded-full ${currentPhase.color} shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center justify-center relative z-10`}
        >
          <span className="text-4xl font-black text-white scoreboard-font">
            {secondsLeft}
          </span>
        </motion.div>

        {/* Phase Indicators */}
        <div className="absolute -inset-4">
          {PHASES.map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 rounded-full transition-all duration-500 ${
                i === phaseIndex ? 'bg-white scale-150 shadow-[0_0_10px_white]' : 'bg-white/10'
              }`}
              style={{
                top: i === 0 || i === 1 ? '0' : 'auto',
                bottom: i === 2 || i === 3 ? '0' : 'auto',
                left: i === 0 || i === 3 ? '0' : 'auto',
                right: i === 1 || i === 2 ? '0' : 'auto',
              }}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentPhase.name}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mt-12 text-center"
        >
          <span className="text-2xl font-black text-white uppercase tracking-widest scoreboard-font">
            {currentPhase.name}
          </span>
          <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">
            {phaseIndex === 0 ? 'خذ نفساً عميقاً' : 
             phaseIndex === 1 ? 'احبس أنفاسك' : 
             phaseIndex === 2 ? 'أخرج الهواء ببطء' : 'استعد للمرة القادمة'}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default BoxBreathing;
