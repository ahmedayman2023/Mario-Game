import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wind } from 'lucide-react';

const PHASES = [
  { name: 'استنشاق', duration: 4, color: 'bg-primary', scale: 1.4 },
  { name: 'حبس', duration: 4, color: 'bg-accent', scale: 1.4 },
  { name: 'زفير', duration: 4, color: 'bg-success', scale: 1.0 },
  { name: 'انتظار', duration: 4, color: 'bg-slate-300', scale: 1.0 },
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
    <div className="flex flex-col items-center justify-center p-12 bg-white border ink-border rounded-lg paper-shadow">
      <div className="flex items-center gap-3 mb-12">
        <Wind className="text-primary animate-pulse" size={16} />
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink">
          تقنية صندوق التنفس
        </h3>
      </div>

      <div className="relative w-56 h-56 flex items-center justify-center">
        {/* Outer Ring */}
        <div className="absolute inset-0 border ink-border rounded-full opacity-10" />
        
        {/* Breathing Circle */}
        <motion.div
          animate={{
            scale: currentPhase.scale,
            backgroundColor: phaseIndex === 0 ? '#1A1A1A' : phaseIndex === 1 ? '#F27D26' : phaseIndex === 2 ? '#10b981' : '#94a3b8'
          }}
          transition={{ duration: 4, ease: "easeInOut" }}
          className="w-28 h-28 rounded-full opacity-5 blur-2xl"
        />
        
        <motion.div
          animate={{
            scale: currentPhase.scale,
          }}
          transition={{ duration: 4, ease: "easeInOut" }}
          className={`w-28 h-28 rounded-full ${currentPhase.color} shadow-lg flex items-center justify-center relative z-10 border ink-border`}
        >
          <span className="text-4xl font-serif text-white">
            {secondsLeft}
          </span>
        </motion.div>

        {/* Phase Indicators */}
        <div className="absolute -inset-6">
          {PHASES.map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 rounded-full transition-all duration-500 border ink-border ${
                i === phaseIndex ? 'bg-accent scale-150' : 'bg-paper'
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
          <span className="text-3xl font-serif text-ink italic">
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
