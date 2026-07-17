import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wind } from 'lucide-react';

const PHASES = [
  { name: 'استنشاق', duration: 4, color: 'bg-sky-400', scale: 1.4 },
  { name: 'حبس', duration: 4, color: 'bg-broadcast-yellow', scale: 1.4 },
  { name: 'زفير', duration: 4, color: 'bg-mario-emerald', scale: 1.0 },
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
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 glass rounded-2xl border-white/10">
      <div className="flex items-center gap-3 mb-12">
        <Wind className="text-broadcast-yellow animate-pulse" size={16} />
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white scoreboard-font">
          تقنية صندوق التنفس
        </h3>
      </div>

      <div className="relative w-56 h-56 flex items-center justify-center">
        {/* Outer Ring */}
        <div className="absolute inset-0 border border-white/10 rounded-full" />

        {/* Breathing Circle */}
        <motion.div
          animate={{
            scale: currentPhase.scale,
            backgroundColor: phaseIndex === 0 ? '#38bdf8' : phaseIndex === 1 ? '#eaff00' : phaseIndex === 2 ? '#00ff88' : '#64748b'
          }}
          transition={{ duration: 4, ease: "easeInOut" }}
          className="w-28 h-28 rounded-full opacity-20 blur-2xl"
        />

        <motion.div
          animate={{
            scale: currentPhase.scale,
          }}
          transition={{ duration: 4, ease: "easeInOut" }}
          className={`w-28 h-28 rounded-full ${currentPhase.color} shadow-lg flex items-center justify-center relative z-10 border-2 border-white/20`}
        >
          <span className="text-4xl font-black text-black scoreboard-font">
            {secondsLeft}
          </span>
        </motion.div>

        {/* Phase Indicators */}
        <div className="absolute -inset-6">
          {PHASES.map((_, i) => (
            <div
              key={i}
              className={`absolute w-2.5 h-2.5 rounded-full transition-all duration-500 border border-white/20 ${
                i === phaseIndex ? 'bg-broadcast-yellow scale-150' : 'bg-white/10'
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
          className="mt-16 text-center"
        >
          <span className="text-3xl font-black text-white scoreboard-font">
            {currentPhase.name}
          </span>
          <p className="text-[10px] text-slate-400 mt-4 font-bold uppercase tracking-[0.2em]">
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
