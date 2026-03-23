import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Check, X, RefreshCcw, Trophy, Star } from 'lucide-react';

const MentalWarmup = ({ onComplete }: { onComplete?: () => void }) => {
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [isActive, setIsActive] = useState(false);
  const [score, setScore] = useState(0);
  const [problem, setProblem] = useState({ a: 0, b: 0, op: '+', answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const generateProblem = useCallback(() => {
    const ops = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b, answer;

    if (op === '+') {
      a = Math.floor(Math.random() * 50) + 1;
      b = Math.floor(Math.random() * 50) + 1;
      answer = a + b;
    } else if (op === '-') {
      a = Math.floor(Math.random() * 50) + 20;
      b = Math.floor(Math.random() * a) + 1;
      answer = a - b;
    } else {
      a = Math.floor(Math.random() * 12) + 2;
      b = Math.floor(Math.random() * 12) + 2;
      answer = a * b;
    }

    setProblem({ a, b, op, answer });
    setUserAnswer('');
    setFeedback(null);
  }, []);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (onComplete) onComplete();
    }
  }, [isActive, timeLeft, onComplete]);

  const startWarmup = () => {
    setIsActive(true);
    setScore(0);
    setTimeLeft(120);
    generateProblem();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isActive) return;

    if (parseInt(userAnswer) === problem.answer) {
      setScore((prev) => prev + 1);
      setFeedback('correct');
      setTimeout(generateProblem, 500);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 500);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-[#5C94FC] rounded-[3rem] border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] min-h-[500px] relative overflow-hidden font-pixel">
      {/* Background elements */}
      <div className="absolute top-10 left-10 opacity-20"><Star size={48} className="text-white fill-white" /></div>
      <div className="absolute bottom-10 right-10 opacity-20"><Brain size={64} className="text-white" /></div>

      {!isActive && timeLeft === 120 ? (
        <div className="text-center space-y-8">
          <div className="bg-[#FBD000] p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] inline-block animate-bounce">
            <Brain size={64} className="text-black" />
          </div>
          <h2 className="text-3xl text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] uppercase">تسخين ذهني</h2>
          <p className="text-black/70 text-xs max-w-xs mx-auto leading-relaxed">
            استعد لتنشيط عقلك! لديك دقيقتان لحل أكبر عدد ممكن من المسائل الرياضية البسيطة.
          </p>
          <button
            onClick={startWarmup}
            className="bg-[#E52521] hover:bg-[#ff3e3e] text-white px-10 py-4 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all text-sm uppercase"
          >
            ابدأ التسخين
          </button>
        </div>
      ) : timeLeft > 0 ? (
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="flex justify-between items-center mb-12">
            <div className="bg-black/40 px-4 py-2 border-2 border-white/20 text-white text-xs">
              TIME: {formatTime(timeLeft)}
            </div>
            <div className="bg-[#FBD000] px-4 py-2 border-2 border-black text-black text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              SCORE: {score}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={problem.a + problem.op + problem.b}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white p-10 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative"
            >
              <div className="text-4xl font-black text-black mb-8">
                {problem.a} {problem.op === '*' ? '×' : problem.op} {problem.b} = ?
              </div>

              <form onSubmit={handleSubmit} className="relative">
                <input
                  type="number"
                  autoFocus
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="w-full bg-slate-100 border-4 border-black p-4 text-2xl text-center font-black focus:ring-0 outline-none text-[#e80000]"
                  placeholder="..."
                />
                
                <AnimatePresence>
                  {feedback === 'correct' && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1.5, opacity: 1 }}
                      exit={{ scale: 2, opacity: 0 }}
                      className="absolute -top-10 -right-10 text-[#43B047]"
                    >
                      <Check size={48} strokeWidth={4} />
                    </motion.div>
                  )}
                  {feedback === 'wrong' && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1.5, opacity: 1 }}
                      exit={{ scale: 2, opacity: 0 }}
                      className="absolute -top-10 -right-10 text-[#E52521]"
                    >
                      <X size={48} strokeWidth={4} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </motion.div>
          </AnimatePresence>

          <p className="text-white/60 text-[8px] uppercase tracking-widest">اضغط ENTER للإرسال</p>
        </div>
      ) : (
        <div className="text-center space-y-8">
          <div className="bg-[#43B047] p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] inline-block">
            <Trophy size={64} className="text-white" />
          </div>
          <h2 className="text-3xl text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] uppercase">انتهى الوقت!</h2>
          <div className="bg-white p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-[10px] text-black/40 uppercase mb-2">النتيجة النهائية</div>
            <div className="text-4xl font-black text-black">{score}</div>
          </div>
          <button
            onClick={startWarmup}
            className="bg-[#FBD000] hover:bg-[#ffe04d] text-black px-10 py-4 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all text-sm uppercase flex items-center gap-3 mx-auto"
          >
            <RefreshCcw size={20} />
            إعادة المحاولة
          </button>
        </div>
      )}
    </div>
  );
};

export default MentalWarmup;
