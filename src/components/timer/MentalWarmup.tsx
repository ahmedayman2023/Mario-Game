import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Check, X, RefreshCcw, Trophy } from 'lucide-react';

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
    <div className="flex flex-col items-center justify-center p-4 min-h-[380px] relative overflow-hidden">
      {!isActive && timeLeft === 120 ? (
        <div className="text-center space-y-6 relative z-10">
          <div className="w-16 h-16 rounded-full bg-mario-yellow mario-block-sm flex items-center justify-center mx-auto">
            <Brain size={30} className="text-black" />
          </div>
          <h2 className="text-lg font-black text-black uppercase tracking-widest scoreboard-font">تسخين ذهني</h2>
          <p className="text-black/60 text-xs max-w-xs mx-auto leading-relaxed font-bold">
            استعد لتنشيط عقلك! لديك دقيقتان لحل أكبر عدد ممكن من المسائل الرياضية البسيطة.
          </p>
          <button
            onClick={startWarmup}
            className="mario-btn bg-mario-emerald text-white px-10 py-3 font-black scoreboard-font text-xs uppercase tracking-widest"
          >
            ابدأ التسخين
          </button>
        </div>
      ) : timeLeft > 0 ? (
        <div className="w-full max-w-md space-y-6 text-center relative z-10">
          <div className="flex justify-between items-center">
            <div className="mario-block-sm bg-black px-4 py-2 text-white text-[10px] font-black scoreboard-font">
              الوقت: {formatTime(timeLeft)}
            </div>
            <div className="mario-block-sm bg-mario-yellow px-4 py-2 text-black text-[10px] font-black scoreboard-font">
              النتيجة: {score}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={problem.a + problem.op + problem.b}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white mario-block p-8 relative"
            >
              <div className="text-4xl font-black text-black mb-8 scoreboard-font">
                {problem.a} {problem.op === '*' ? '×' : problem.op} {problem.b} = ?
              </div>

              <form onSubmit={handleSubmit} className="relative">
                <input
                  type="number"
                  autoFocus
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="w-full bg-white border-2 border-black rounded-none p-4 text-2xl text-center font-black text-black focus:outline-none focus:border-mario-sky transition-all"
                  placeholder="..."
                />

                <AnimatePresence>
                  {feedback === 'correct' && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1.5, opacity: 1 }}
                      exit={{ scale: 2, opacity: 0 }}
                      className="absolute -top-10 -right-6 text-mario-emerald"
                    >
                      <Check size={40} strokeWidth={4} />
                    </motion.div>
                  )}
                  {feedback === 'wrong' && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1.5, opacity: 1 }}
                      exit={{ scale: 2, opacity: 0 }}
                      className="absolute -top-10 -right-6 text-mario-red"
                    >
                      <X size={40} strokeWidth={4} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </motion.div>
          </AnimatePresence>

          <p className="text-black/50 text-[9px] uppercase tracking-widest font-black">اضغط Enter للإرسال</p>
        </div>
      ) : (
        <div className="text-center space-y-6 relative z-10">
          <div className="w-16 h-16 rounded-full bg-mario-emerald mario-block-sm flex items-center justify-center mx-auto">
            <Trophy size={30} className="text-white" />
          </div>
          <h2 className="text-lg font-black text-black uppercase tracking-widest scoreboard-font">انتهى الوقت!</h2>
          <div className="bg-white mario-block-sm p-6">
            <div className="text-[10px] text-black/50 uppercase tracking-widest font-black mb-2">النتيجة النهائية</div>
            <div className="text-4xl font-pixel text-black">{score}</div>
          </div>
          <button
            onClick={startWarmup}
            className="mario-btn bg-mario-yellow text-black px-10 py-3 font-black scoreboard-font text-xs uppercase tracking-widest flex items-center gap-2 mx-auto"
          >
            <RefreshCcw size={16} />
            إعادة المحاولة
          </button>
        </div>
      )}
    </div>
  );
};

export default MentalWarmup;
