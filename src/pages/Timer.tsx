import React, { useState, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from 'motion/react';
import { StudySession } from "@/src/entities/StudySession";

import { User } from "@/src/entities/User";
import TimerDisplay from "../components/timer/TimerDisplay";
import TodoList from "../components/timer/TodoList";
import TimerControls from "../components/timer/TimerControls";
import IntervalProgress from "../components/timer/IntervalProgress";
import ScoreBar from "../components/timer/ScoreBar";
import StudyTopicInput from "../components/timer/StudyTopicInput";
import LevelPanel from "../components/timer/LevelPanel";
import BoxBreathing from "../components/timer/BoxBreathing";
import RecoveryVideos from "../components/timer/RecoveryVideos";
import Modal from "../components/ui/Modal";
import { Trophy, Sparkles, Volume2, VolumeX, ExternalLink, Wind, Dumbbell } from 'lucide-react';
import { useToast } from "@/src/components/ui/use-toast";
import { Toaster } from "@/src/components/ui/toaster";
import { useTimer } from "../hooks/useTimer";
import { INTERVALS, STORAGE_KEYS } from "../constants";
import { playChime } from "../utils/audio";
import { Score, TimerState } from "../types";

const TimerPage = () => {
  const { toast } = useToast();
  
  // Stats State
  const [score, setScore] = useState<Score>({ me: 0, time: 0 });
  const [fullCycles, setFullCycles] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [currentTopic, setCurrentTopic] = useState("");
  const [showCompletedMessage, setShowCompletedMessage] = useState(false);
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);
  const [isExercisesOpen, setIsExercisesOpen] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState<'me' | 'time' | null>(null);
  const [isBismillahOpen, setIsBismillahOpen] = useState(true);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [hasAcknowledgedCompletion, setHasAcknowledgedCompletion] = useState(false);

  // Persistence Logic
  const loadInitialData = useCallback(async () => {
    try {
      const savedScore = localStorage.getItem(STORAGE_KEYS.SCORE);
      if (savedScore) setScore(JSON.parse(savedScore));

      const savedCycles = localStorage.getItem(STORAGE_KEYS.FULL_CYCLES);
      if (savedCycles) setFullCycles(parseInt(savedCycles));

      const savedVolume = localStorage.getItem(STORAGE_KEYS.VOLUME);
      if (savedVolume) setVolume(parseFloat(savedVolume));

      const savedState = localStorage.getItem(STORAGE_KEYS.TIMER_STATE);
      if (savedState) {
        const state: TimerState = JSON.parse(savedState);
        setCurrentTopic(state.currentTopic || "");
      }

      const userData = await User.getMyUserData();
      if (userData?.current_study_topic) {
        setCurrentTopic(userData.current_study_topic || "");
      }
    } catch (e) {
      console.error("Failed to load initial data", e);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const onIntervalComplete = useCallback(() => {
    playChime('complete', volume);
    setScore(prev => {
      const next = { ...prev, me: prev.me + 1 };
      localStorage.setItem(STORAGE_KEYS.SCORE, JSON.stringify(next));
      if (next.me >= 10 && !isGameOver) {
        setIsGameOver(true);
        setWinner('me');
      }
      return next;
    });
    setShowCompletedMessage(true);
    setTimeout(() => setShowCompletedMessage(false), 2000);
  }, [volume, isGameOver]);

  const onBreakComplete = useCallback(() => {
    playChime('start', volume);
    toast({
      title: "انتهت الاستراحة!",
      description: "حان وقت التركيز مرة أخرى. تستأنف المهمة.",
    });
  }, [toast]);

  const onSessionComplete = useCallback(() => {
    playChime('complete', volume);
    setFullCycles(prev => {
      const next = prev + 1;
      localStorage.setItem(STORAGE_KEYS.FULL_CYCLES, next.toString());
      return next;
    });
    setShowCompletedMessage(true);
    setIsSessionModalOpen(true);
    setTimeout(() => setShowCompletedMessage(false), 2000);
  }, [volume]);

  const onWarmupComplete = useCallback(() => {
    playChime('mandatory', volume);
    toast({
      title: "انتهى التسخين!",
      description: "التقنية ستبدأ الآن. بالتوفيق!",
    });
  }, [volume, toast]);

  const onWarmupIntervalComplete = useCallback(() => {
    playChime('interval', volume);
  }, [volume]);

  const {
    timeLeft,
    isActive,
    isPaused,
    currentIntervalIndex,
    warmupIntervalIndex,
    isBreakTime,
    isWarmup,
    isSessionComplete,
    handleStart: baseStart,
    handlePause,
    handleReset: baseReset,
    handleSkip,
    handleBack,
    skipAllWarmup,
    setTimeLeft,
    progress
  } = useTimer(onIntervalComplete, onSessionComplete, onBreakComplete, onWarmupComplete, onWarmupIntervalComplete);

  // Warmup Steps Logic
  useEffect(() => {
    if (isWarmup && isActive && !isPaused) {
      switch (warmupIntervalIndex) {
        case 0: // YouTube
          toast({
            title: "الخطوة الأولى: قناة اليوتيوب",
            description: "افتح القناة لتجهيز الأجواء.",
            action: (
              <button 
                onClick={() => window.open('https://www.youtube.com/', '_blank')}
                className="bg-white text-black px-3 py-1 rounded-md text-xs font-bold"
              >
                فتح يوتيوب
              </button>
            ),
          });
          break;
        case 1: // Breathing
          setIsBreathingOpen(true);
          toast({
            title: "الخطوة الثانية: التنفس",
            description: "ركز على تنفسك لمدة 5 دقائق.",
          });
          break;
        case 2: // Lumosity
          toast({
            title: "الخطوة الثالثة: تسخين ذهني",
            description: "افتح Lumosity لتنشيط عقلك.",
            action: (
              <button 
                onClick={() => window.open('https://www.lumosity.com/', '_blank')}
                className="bg-white text-black px-3 py-1 rounded-md text-xs font-bold"
              >
                فتح الموقع
              </button>
            ),
          });
          break;
      }
    }
  }, [isWarmup, warmupIntervalIndex, isActive, isPaused, toast]);

  const handleStart = useCallback(() => {
    baseStart();
  }, [baseStart]);

  // Match Logic: Time gets points while paused
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPaused && !isSessionComplete && !isGameOver) {
      interval = setInterval(() => {
        setScore(prev => {
          const next = { ...prev, time: prev.time + 1 };
          localStorage.setItem(STORAGE_KEYS.SCORE, JSON.stringify(next));
          if (next.time >= 10 && !isGameOver) {
            setIsGameOver(true);
            setWinner('time');
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused, isSessionComplete, isGameOver]);

  const handleReset = () => {
    baseReset();
    setScore({ me: 0, time: 0 });
    setIsGameOver(false);
    setWinner(null);
    setHasAcknowledgedCompletion(false);
    localStorage.setItem(STORAGE_KEYS.SCORE, JSON.stringify({ me: 0, time: 0 }));
  };

  const handleTopicSave = async () => {
    try {
      const existing = localStorage.getItem(STORAGE_KEYS.TIMER_STATE);
      const state = existing ? JSON.parse(existing) : {};
      localStorage.setItem(STORAGE_KEYS.TIMER_STATE, JSON.stringify({ ...state, currentTopic }));
      
      await User.updateMyUserData({ current_study_topic: currentTopic });
      toast({ title: "تم حفظ الموضوع!", description: `تم حفظ موضوعك "${currentTopic}" بنجاح.` });
    } catch (error) {
      toast({ title: "خطأ", description: "تعذر حفظ الموضوع.", variant: "destructive" });
    }
  };

  const handleTimeEdit = (newTime: number) => {
    setTimeLeft(newTime);
  };

  if ((isSessionComplete || isGameOver) && (isGameOver || hasAcknowledgedCompletion)) {
    const isMeWinner = winner === 'me' || (isSessionComplete && score.me > score.time);
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6 stadium-gradient">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          className={`w-32 h-32 ${isMeWinner ? 'bg-amber-500' : 'bg-slate-600'} rounded-full flex items-center justify-center mb-8 shadow-2xl`}
        >
          <Trophy size={64} className="text-white" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl max-w-md w-full mb-8"
        >
          <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter scoreboard-font">
            {isMeWinner ? "انتصار!" : "هزيمة!"}
          </h2>
          
          <div className="flex justify-center items-center gap-8 my-6">
            <div className="text-center">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">أنا</div>
              <div className={`text-4xl font-black scoreboard-font ${isMeWinner ? 'text-mario-emerald' : 'text-slate-400'}`}>{score.me}</div>
            </div>
            <div className="text-2xl font-black text-white/20 scoreboard-font">ضد</div>
            <div className="text-center">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">الوقت</div>
              <div className={`text-4xl font-black scoreboard-font ${!isMeWinner ? 'text-mario-red' : 'text-slate-400'}`}>{score.time}</div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-slate-300 font-bold uppercase tracking-widest text-xs">
              الفائز: <span className={isMeWinner ? 'text-mario-emerald' : 'text-mario-red'}>{isMeWinner ? 'أنا' : 'الوقت'}</span>
            </p>
            <p className="text-slate-400 text-[10px] uppercase tracking-widest">
              الخاسر: {isMeWinner ? 'الوقت' : 'أنا'}
            </p>
            {!isMeWinner && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-mario-red font-black uppercase tracking-[0.2em] text-sm mt-4 italic"
              >
                حظاً أوفر! (Hardluck)
              </motion.p>
            )}
          </div>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleReset}
          className="bg-mario-emerald text-black px-12 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl scoreboard-font"
        >
          جلسة جديدة
        </motion.button>
      </div>
    );
  }

  return (
    <div className="min-h-screen stadium-gradient">
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-10 relative">
        <Toaster />
        
        <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-mario-red px-2 py-1 text-[10px] font-black uppercase tracking-tighter">مباشر</div>
            <h1 className="text-xl font-black uppercase tracking-tight scoreboard-font">دوري فاينمان للمذاكرة</h1>
            <button 
              onClick={() => setIsBismillahOpen(true)}
              className="ml-4 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full transition-colors scoreboard-font"
            >
              بسم الله
            </button>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400 scoreboard-font">
            <span>التعلم العميق</span>
            <div className="w-1 h-1 bg-slate-600 rounded-full" />
            <span>تقنية فاينمان</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          <div className="lg:col-span-8 flex flex-col">
            <ScoreBar me={score.me} time={score.time} onReset={handleReset} />
            
            <div className="flex-1 flex flex-col items-center justify-center min-h-[280px] md:min-h-[400px] bg-black/20 rounded-lg border border-white/5 shadow-inner mb-6 relative overflow-hidden">
              <div className="flex flex-col items-center justify-center w-full h-full">
                <TimerDisplay 
                  minutes={Math.floor(timeLeft / 60)} 
                  seconds={timeLeft % 60} 
                  isActive={isActive}
                  currentInterval={currentIntervalIndex + 1}
                  onTimeEdit={handleTimeEdit}
                  isBreakTime={isBreakTime}
                  isWarmup={isWarmup}
                  warmupIntervalIndex={warmupIntervalIndex}
                />
                
                <TimerControls 
                  isActive={isActive}
                  isPaused={isPaused}
                  onStart={() => { playChime('start', volume); handleStart(); }}
                  onPause={handlePause}
                  onStop={handleReset}
                  onSkip={() => { 
                    playChime('mandatory', volume); 
                    if (isWarmup) {
                      skipAllWarmup();
                    } else {
                      handleSkip();
                    }
                  }}
                  onBack={handleBack}
                  isBreakTime={isBreakTime}
                  isWarmup={isWarmup}
                />
              </div>
            </div>

            <IntervalProgress 
              currentIntervalIndex={currentIntervalIndex}
              intervals={INTERVALS}
              progress={progress}
              isBreakTime={isBreakTime}
              isWarmup={isWarmup}
              warmupIntervalIndex={warmupIntervalIndex}
            />
          </div>

          <div className="lg:col-span-4 space-y-4 md:space-y-6">
            <LevelPanel level={fullCycles} cycles={fullCycles} />

            <div className="bg-stadium-blue/80 border border-white/10 rounded-lg p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Wind size={14} className="text-broadcast-yellow" />
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] scoreboard-font">أدوات الاستشفاء</h3>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIsBreathingOpen(true)}
                  className="py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl flex flex-col items-center justify-center gap-2 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Wind size={20} className="text-emerald-400" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white scoreboard-font">تنفس الصندوق</span>
                </button>
                <button
                  onClick={() => setIsExercisesOpen(true)}
                  className="py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl flex flex-col items-center justify-center gap-2 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Dumbbell size={20} className="text-amber-400" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white scoreboard-font">تمارين موجهة</span>
                </button>
              </div>
            </div>

            <div className="bg-stadium-blue/80 border border-white/10 rounded-lg p-6 shadow-xl overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ExternalLink size={14} className="text-broadcast-yellow" />
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] scoreboard-font">أجواء الملعب</h3>
                </div>
              </div>
              
              <a 
                href="https://www.youtube.com/watch?v=74cOUSKXMz0" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative block aspect-video bg-black rounded-md overflow-hidden border border-white/5 hover:border-broadcast-yellow/50 transition-colors"
              >
                <img 
                  src="https://img.youtube.com/vi/74cOUSKXMz0/maxresdefault.jpg" 
                  alt="Stadium Video Thumbnail" 
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 bg-mario-red rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <ExternalLink size={20} className="text-white ml-0.5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white scoreboard-font">فتح الملعب</span>
                </div>
              </a>
              <p className="text-[9px] text-slate-500 mt-3 italic scoreboard-font leading-relaxed">انقر لفتح أجواء الملعب في علامة تبويب جديدة لتجربة التعلم الكاملة.</p>
            </div>
            
            <div className="bg-stadium-blue/80 border border-white/10 rounded-lg p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Volume2 size={14} className="text-broadcast-yellow" />
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] scoreboard-font">التحكم في الصوت</h3>
                </div>
                <span className="text-[10px] font-black text-white scoreboard-font">{Math.round(volume * 100)}%</span>
              </div>
              <div className="flex items-center gap-3">
                {volume === 0 ? <VolumeX size={16} className="text-slate-500" /> : <Volume2 size={16} className="text-broadcast-yellow" />}
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01" 
                  value={volume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setVolume(val);
                    localStorage.setItem(STORAGE_KEYS.VOLUME, val.toString());
                  }}
                  className="flex-1 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-broadcast-yellow"
                />
              </div>
            </div>

            <div className="bg-stadium-blue/80 border border-white/10 rounded-lg p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={14} className="text-broadcast-yellow" />
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] scoreboard-font">التركيز الحالي</h3>
              </div>
              <StudyTopicInput
                topic={currentTopic}
                onTopicChange={setCurrentTopic}
                onTopicSave={handleTopicSave}
                isActive={isActive}
                isPaused={isPaused} 
              />
            </div>

            <TodoList />

            <div className="flex justify-center pt-4">
              <button
                onClick={handleReset}
                className="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-mario-red transition-colors disabled:opacity-30 scoreboard-font"
                disabled={isActive}>
                إلغاء الحملة
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isBreathingOpen} 
        onClose={() => setIsBreathingOpen(false)}
        title="استعادة التركيز"
      >
        <BoxBreathing />
      </Modal>

      <Modal 
        isOpen={isExercisesOpen} 
        onClose={() => setIsExercisesOpen(false)}
        title="تمارين الاستشفاء البدني"
      >
        <RecoveryVideos />
      </Modal>

      <Modal 
        isOpen={isBismillahOpen} 
        onClose={() => setIsBismillahOpen(false)}
        title="بداية مباركة"
      >
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl font-black text-emerald-400 scoreboard-font mb-4"
          >
            بسم الله
          </motion.div>
          <p className="text-slate-400 text-sm font-bold">
            "وقل ربي زدني علماً"
          </p>
          <button
            onClick={() => setIsBismillahOpen(false)}
            className="mt-8 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-2 rounded-xl font-black transition-colors"
          >
            استعنا بالله
          </button>
        </div>
      </Modal>

      <Modal 
        isOpen={isSessionModalOpen} 
        onClose={() => setIsSessionModalOpen(false)}
        title="تمت المهمة بنجاح"
      >
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl font-black text-emerald-400 scoreboard-font mb-6 leading-relaxed px-4"
          >
            الحمد لله
          </motion.div>
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
            <Trophy className="text-emerald-400" size={32} />
          </div>
          <button
            onClick={() => {
              setIsSessionModalOpen(false);
              setHasAcknowledgedCompletion(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-3 rounded-xl font-black transition-colors shadow-lg shadow-emerald-900/20"
          >
            تقبل الله
          </button>
        </div>
      </Modal>

      <AnimatePresence>
        {showCompletedMessage && (
            <motion.div
              initial={{ opacity: 0, y: 50, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, scale: 0.9, x: '-50%' }}
              className={`fixed bottom-10 left-1/2 px-8 py-4 rounded-2xl shadow-2xl z-50 font-black uppercase tracking-widest text-xs ${
                isSessionComplete ? "bg-purple-600 text-white" :
                isWarmup ? "bg-amber-600 text-white" :
                isBreakTime ? "bg-emerald-600 text-white" : "bg-blue-600 text-white"
              }`}
            >
              {isSessionComplete ? "هدددددددف!" : isWarmup ? "جاري التسخين..." : isBreakTime ? "بدأ الاستراحة" : "تم إكمال الخطوة"}
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default memo(TimerPage);
