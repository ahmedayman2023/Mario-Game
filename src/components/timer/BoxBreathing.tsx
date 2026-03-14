import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wind, Circle } from 'lucide-react';

const PHASES = [
  { name: 'استنشاق', duration: 4, color: '#10b981', glow: 'rgba(16, 185, 129, 0.3)', scale: 1.4, description: 'خذ نفساً عميقاً من الأنف' },
  { name: 'حبس', duration: 4, color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.3)', scale: 1.4, description: 'احتفظ بالهواء في رئتيك' },
  { name: 'زفير', duration: 4, color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.3)', scale: 1.0, description: 'أخرج الهواء ببطء من الفم' },
  { name: 'انتظار', duration: 4, color: '#64748b', glow: 'rgba(100, 116, 139, 0.3)', scale: 1.0, description: 'استرخِ قبل الدورة التالية' },
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
  const progress = ((currentPhase.duration - secondsLeft + 1) / currentPhase.duration) * 100;

  return (
    <div className="relative overflow-hidden flex flex-col items-center justify-center p-10 rounded-[2.5rem] border border-white/10 shadow-2xl bg-[#0a0a0a]">
      {/* Atmospheric Background Glow */}
      <motion.div 
        animate={{
          background: `radial-gradient(circle at 50% 50%, ${currentPhase.glow} 0%, transparent 70%)`,
        }}
        transition={{ duration: 2 }}
        className="absolute inset-0 opacity-40 pointer-events-none"
      />

      <div className="relative z-10 flex flex-col items-center">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
            <Wind className="text-emerald-400" size={16} />
          </div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
            Mindfulness Protocol
          </h3>
        </div>

        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Progress Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="2"
            />
            <motion.circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              stroke={currentPhase.color}
              strokeWidth="2"
              strokeDasharray="753.6"
              animate={{ strokeDashoffset: 753.6 - (753.6 * progress) / 100 }}
              transition={{ duration: 1, ease: "linear" }}
              strokeLinecap="round"
              className="opacity-50"
            />
          </svg>

          {/* Breathing Orb */}
          <div className="relative">
            <motion.div
              animate={{
                scale: currentPhase.scale,
                backgroundColor: currentPhase.color,
                boxShadow: `0 0 60px ${currentPhase.glow}`,
              }}
              transition={{ duration: 4, ease: "easeInOut" }}
              className="w-32 h-32 rounded-full opacity-20 blur-2xl absolute inset-0"
            />
            
            <motion.div
              animate={{
                scale: currentPhase.scale,
                borderColor: currentPhase.color,
              }}
              transition={{ duration: 4, ease: "easeInOut" }}
              className="w-32 h-32 rounded-full border-2 border-white/10 flex items-center justify-center relative z-10 bg-black/20 backdrop-blur-sm"
            >
              <AnimatePresence mode="wait">
                <motion.span 
                  key={secondsLeft}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  className="text-5xl font-black text-white scoreboard-font"
                >
                  {secondsLeft}
                </motion.span>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Corner Markers */}
          <div className="absolute inset-0 pointer-events-none">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`absolute w-1.5 h-1.5 rounded-full transition-all duration-700 ${
                  i === phaseIndex ? 'bg-white scale-150 shadow-[0_0_15px_white]' : 'bg-white/5'
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

        <div className="mt-12 h-24 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPhase.name}
              initial={{ opacity: 0, filter: 'blur(10px)', y: 10 }}
              animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
              exit={{ opacity: 0, filter: 'blur(10px)', y: -10 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h4 className="text-3xl font-black text-white uppercase tracking-[0.2em] scoreboard-font mb-3">
                {currentPhase.name}
              </h4>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.15em] max-w-[200px] leading-relaxed">
                {currentPhase.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Phase Progress Dots */}
        <div className="flex gap-3 mt-4">
          {PHASES.map((_, i) => (
            <div 
              key={i}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === phaseIndex ? 'w-8 bg-white' : 'w-2 bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BoxBreathing;
