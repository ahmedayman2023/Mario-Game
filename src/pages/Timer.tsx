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
import { Trophy, Sparkles, Volume2, VolumeX, ExternalLink, Wind, Dumbbell, ChevronRight } from 'lucide-react';
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
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-paper">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mb-10 paper-shadow"
        >
          <Trophy size={40} className="text-white" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border ink-border p-12 rounded-lg max-w-md w-full mb-10 paper-shadow"
        >
          <h2 className="text-4xl serif-text font-bold text-ink mb-6">
            {isMeWinner ? "إنجاز عظيم" : "انقضى الوقت"}
          </h2>
          
          <div className="flex justify-center items-center gap-16 my-10">
            <div className="text-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">التركيز</div>
              <div className={`text-6xl font-serif ${isMeWinner ? 'text-accent' : 'text-slate-300'}`}>{score.me}</div>
            </div>
            <div className="text-3xl font-serif text-slate-100">/</div>
            <div className="text-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">الوقت</div>
              <div className={`text-6xl font-serif ${!isMeWinner ? 'text-danger' : 'text-slate-300'}`}>{score.time}</div>
            </div>
          </div>

          <div className="pt-6 border-t ink-border">
            <p className="text-slate-500 text-sm italic serif-text">
              {isMeWinner ? "لقد انتصرت على الوقت اليوم." : "الوقت لا ينتظر أحداً، استعد للجولة القادمة."}
            </p>
          </div>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleReset}
          className="bg-primary text-white px-16 py-4 rounded-full font-bold shadow-xl hover:bg-primary-hover transition-all tracking-widest text-xs uppercase"
        >
          بدء رحلة جديدة
        </motion.button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="max-w-6xl mx-auto px-6 py-12 relative">
        <Toaster />
        
        <header className="flex flex-col items-center mb-16 text-center">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-4"
          >
            <div className="h-[1px] w-12 bg-accent/30" />
            <span className="text-[10px] font-bold text-accent uppercase tracking-[0.4em]">FEYNMAN STUDY LEAGUE</span>
            <div className="h-[1px] w-12 bg-accent/30" />
          </motion.div>
          
          <h1 className="text-5xl serif-text font-bold text-ink mb-6">محراب العلم</h1>
          
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setIsBismillahOpen(true)}
              className="text-xs font-bold text-slate-400 hover:text-ink transition-all border-b border-transparent hover:border-ink pb-1"
            >
              بسم الله
            </button>
            <div className="w-1 h-1 bg-accent rounded-full" />
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              التعلم العميق
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <main className="lg:col-span-8 space-y-12">
            <ScoreBar me={score.me} time={score.time} onReset={handleReset} />
            
            <div className="bg-white border ink-border rounded-lg paper-shadow p-12 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden">
              {/* Subtle background pattern */}
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              
              <div className="relative z-10 w-full flex flex-col items-center">
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
                
                <div className="mt-12">
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
            </div>

            <IntervalProgress 
              currentIntervalIndex={currentIntervalIndex}
              intervals={INTERVALS}
              progress={progress}
              isBreakTime={isBreakTime}
              isWarmup={isWarmup}
              warmupIntervalIndex={warmupIntervalIndex}
            />
          </main>

          <aside className="lg:col-span-4 space-y-10">
            <LevelPanel level={fullCycles} cycles={fullCycles} />

            <section className="bg-white border ink-border p-8 rounded-lg paper-shadow">
              <div className="flex items-center gap-4 mb-8">
                <Wind size={16} className="text-accent" />
                <h3 className="text-xs font-bold text-ink uppercase tracking-widest">أدوات الاستشفاء</h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => setIsBreathingOpen(true)}
                  className="group flex items-center justify-between p-4 bg-paper border ink-border rounded-lg transition-all hover:border-accent"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                      <Wind size={14} className="text-success" />
                    </div>
                    <span className="text-xs font-bold text-slate-700">تنفس الصندوق</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-accent transition-colors" />
                </button>
                <button
                  onClick={() => setIsExercisesOpen(true)}
                  className="group flex items-center justify-between p-4 bg-paper border ink-border rounded-lg transition-all hover:border-accent"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-danger/10 rounded-full flex items-center justify-center">
                      <Dumbbell size={14} className="text-danger" />
                    </div>
                    <span className="text-xs font-bold text-slate-700">تمارين موجهة</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-accent transition-colors" />
                </button>
              </div>
            </section>

            <section className="bg-white border ink-border p-8 rounded-lg paper-shadow">
              <div className="flex items-center gap-4 mb-8">
                <ExternalLink size={16} className="text-accent" />
                <h3 className="text-xs font-bold text-ink uppercase tracking-widest">أجواء التركيز</h3>
              </div>
              
              <a 
                href="https://www.youtube.com/watch?v=74cOUSKXMz0" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative block aspect-video bg-ink rounded-lg overflow-hidden"
              >
                <img 
                  src="https://img.youtube.com/vi/74cOUSKXMz0/maxresdefault.jpg" 
                  alt="Focus Video Thumbnail" 
                  className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ExternalLink size={16} className="text-white" />
                  </div>
                </div>
              </a>
              <p className="text-[10px] text-slate-400 mt-4 leading-relaxed italic serif-text">موسيقى هادئة لتعزيز التركيز العميق.</p>
            </section>
            
            <section className="bg-white border ink-border p-8 rounded-lg paper-shadow">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <Volume2 size={16} className="text-accent" />
                  <h3 className="text-xs font-bold text-ink uppercase tracking-widest">الصوت</h3>
                </div>
                <span className="text-[10px] font-bold text-slate-400">{Math.round(volume * 100)}%</span>
              </div>
              <div className="flex items-center gap-4">
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
                  className="flex-1 h-1 bg-slate-100 rounded-full appearance-none cursor-pointer accent-primary"
                />
              </div>
            </section>

            <section className="bg-white border ink-border p-8 rounded-lg paper-shadow">
              <div className="flex items-center gap-4 mb-8">
                <Sparkles size={16} className="text-accent" />
                <h3 className="text-xs font-bold text-ink uppercase tracking-widest">المهمة الحالية</h3>
              </div>
              <StudyTopicInput
                topic={currentTopic}
                onTopicChange={setCurrentTopic}
                onTopicSave={handleTopicSave}
                isActive={isActive}
                isPaused={isPaused} 
              />
            </section>

            <TodoList />

            <div className="flex justify-center pt-8">
              <button
                onClick={handleReset}
                className="text-[10px] font-bold text-slate-300 hover:text-danger transition-colors uppercase tracking-widest"
                disabled={isActive}>
                إلغاء الجلسة
              </button>
            </div>
          </aside>
        </div>
      </div>

      <Modal 
        isOpen={isBreathingOpen} 
        onClose={() => setIsBreathingOpen(false)}
        title="استعادة السكينة"
      >
        <BoxBreathing />
      </Modal>

      <Modal 
        isOpen={isExercisesOpen} 
        onClose={() => setIsExercisesOpen(false)}
        title="تنشيط الجسد"
      >
        <RecoveryVideos />
      </Modal>

      <Modal 
        isOpen={isBismillahOpen} 
        onClose={() => setIsBismillahOpen(false)}
        title="بداية الرحلة"
      >
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-6xl serif-text font-bold text-ink mb-8"
          >
            بسم الله
          </motion.div>
          <p className="text-slate-400 text-xl font-serif italic mb-12">
            "وقل ربي زدني علماً"
          </p>
          <button
            onClick={() => setIsBismillahOpen(false)}
            className="bg-primary text-white px-16 py-4 rounded-full font-bold transition-all shadow-xl hover:bg-primary-hover tracking-widest text-xs uppercase"
          >
            استعنا بالله
          </button>
        </div>
      </Modal>

      <Modal 
        isOpen={isSessionModalOpen} 
        onClose={() => setIsSessionModalOpen(false)}
        title="حصاد العلم"
      >
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-6xl serif-text font-bold text-success mb-10"
          >
            الحمد لله
          </motion.div>
          <div className="w-24 h-24 bg-success/5 rounded-full flex items-center justify-center mb-12">
            <Trophy className="text-success" size={48} />
          </div>
          <button
            onClick={() => {
              setIsSessionModalOpen(false);
              setHasAcknowledgedCompletion(true);
            }}
            className="bg-success text-white px-16 py-4 rounded-full font-bold transition-all shadow-xl hover:bg-success/90 tracking-widest text-xs uppercase"
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
              className={`fixed bottom-12 left-1/2 px-10 py-4 rounded-full shadow-2xl z-50 font-bold text-[10px] uppercase tracking-[0.2em] border-none ${
                isSessionComplete ? "bg-primary text-white" :
                isWarmup ? "bg-danger text-white" :
                isBreakTime ? "bg-success text-white" : "bg-accent text-white"
              }`}
            >
              {isSessionComplete ? "مهمة مكتملة" : isWarmup ? "جاري التسخين" : isBreakTime ? "استراحة" : "تم الإنجاز"}
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default memo(TimerPage);
