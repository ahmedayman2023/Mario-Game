import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Circle } from 'lucide-react';

const PHASES = [
  { name: 'شهيق', sub: 'استنشق بعمق من الأنف', duration: 4, color: '#2DD4BF', glow: 'rgba(45, 212, 191, 0.2)' },
  { name: 'كتم', sub: 'احبس الهواء في رئتيك', duration: 4, color: '#38BDF8', glow: 'rgba(56, 189, 248, 0.2)' },
  { name: 'زفير', sub: 'أخرج الهواء ببطء من الفم', duration: 4, color: '#818CF8', glow: 'rgba(129, 140, 248, 0.2)' },
  { name: 'سكون', sub: 'انتظر بهدوء قبل البدء', duration: 4, color: '#94A3B8', glow: 'rgba(148, 163, 184, 0.2)' },
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

  // حساب حركة المسار المربع (Stroke Dash Offset)
  const progress = (4 - secondsLeft) / 4;

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] p-8 bg-slate-50 rounded-[3rem] shadow-2xl border border-white/50 backdrop-blur-sm overflow-hidden relative">
      
      {/* Background Ambient Glow */}
      <motion.div 
        animate={{ backgroundColor: currentPhase.glow }}
        className="absolute inset-0 transition-colors duration-1000 -z-10"
      />

      <div className="flex flex-col items-center gap-2 mb-10">
        <div className="flex items-center gap-2 px-4 py-1.5 bg-white/80 rounded-full shadow-sm border border-slate-100">
          <Wind size={14} className="text-slate-500" />
          <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">Mindful Breathing</span>
        </div>
      </div>

      <div className="relative w-64 h-64 flex items-center justify-center">
        
        {/* The SVG Box Path */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <rect
            x="5" y="5" width="90" height="90"
            rx="20" fill="none"
            stroke="#E2E8F0" strokeWidth="2"
          />
          <motion.rect
            x="5" y="5" width="90" height="90"
            rx="20" fill="none"
            stroke={currentPhase.color}
            strokeWidth="3"
            strokeDasharray="360"
            initial={{ strokeDashoffset: 360 }}
            animate={{ strokeDashoffset: 360 - (90 * (phaseIndex + progress)) }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </svg>

        {/* Pulsing Breathing Core */}
        <motion.div
          animate={{
            scale: phaseIndex === 0 ? [1, 1.4] : phaseIndex === 2 ? [1.4, 1] : phaseIndex === 1 ? 1.4 : 1,
            boxShadow: `0 0 40px ${currentPhase.glow}`,
          }}
          transition={{ duration: 4, ease: "easeInOut" }}
          className="w-32 h-32 rounded-3xl bg-white shadow-xl flex items-center justify-center z-10 border border-slate-50"
        >
          <div className="flex flex-col items-center">
            <motion.span 
              key={secondsLeft}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-5xl font-light text-slate-700"
            >
              {secondsLeft}
            </motion.span>
          </div>
        </motion.div>

        {/* Corner Dots for Box Logic */}
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`absolute w-3 h-3 rounded-full border-2 border-white shadow-sm transition-all duration-700 ${
              i === phaseIndex ? 'scale-125' : 'bg-slate-200'
            }`}
            style={{
              backgroundColor: i === phaseIndex ? currentPhase.color : '',
              top: i === 0 || i === 1 ? '2%' : '92%',
              left: i === 0 || i === 3 ? '2%' : '92%',
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))}
      </div>

      {/* Texts Section */}
      <div className="mt-12 text-center h-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhase.name}
            initial={{ opacity: 0, y: 15, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -15, filter: 'blur(10px)' }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-slate-800 mb-2" style={{ fontFamily: 'serif' }}>
              {currentPhase.name}
            </h2>
            <p className="text-slate-400 text-sm font-medium max-w-[200px] mx-auto leading-relaxed">
              {currentPhase.sub}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Dots */}
      <div className="flex gap-2 mt-4">
        {PHASES.map((_, i) => (
          <div 
            key={i}
            className={`h-1 rounded-full transition-all duration-500 ${
              i === phaseIndex ? 'w-8 bg-slate-400' : 'w-2 bg-slate-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default BoxBreathing;