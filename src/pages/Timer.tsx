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
import BoxBreathing from "../components/timer/BoxBreathing";
import MentalWarmup from "../components/timer/MentalWarmup";
import RecoveryVideos from "../components/timer/RecoveryVideos";
import SmartStudyChecklist from "../components/timer/SmartStudyChecklist";
import StudyStagesChecklist from "../components/timer/StudyStagesChecklist";
import Modal from "../components/ui/Modal";
import { Trophy, Sparkles, Volume2, VolumeX, ExternalLink, Wind, Star, Zap } from 'lucide-react';
import { useToast } from "@/src/components/ui/use-toast";
import { Toaster } from "@/src/components/ui/toaster";
import { useTimer } from "../hooks/useTimer";
import { INTERVALS, STORAGE_KEYS, RECOVERY_VIDEOS } from "../constants";
import { playChime, initAudio } from "../utils/audio";
import { Score, TimerState } from "../types";
import { useAuth } from "../lib/AuthContext";

const TimerPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  // Stats State
  const [score, setScore] = useState<Score>({ me: 0, time: 0 });
  const [fullCycles, setFullCycles] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [currentTopic, setCurrentTopic] = useState("");
  const [showCompletedMessage, setShowCompletedMessage] = useState(false);
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);
  const [isMentalWarmupOpen, setIsMentalWarmupOpen] = useState(false);
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

      if (user) {
        const userData = await User.getMyUserData();
        if (userData?.current_study_topic) {
          setCurrentTopic(userData.current_study_topic || "");
        }
      }
    } catch (e) {
      console.error("Failed to load initial data", e);
    }
  }, [user]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const onIntervalComplete = useCallback(() => {
    playChime('complete', volume);
    setScore(prev => {
      const next = { ...prev, me: prev.me + 1 };
      localStorage.setItem(STORAGE_KEYS.SCORE, JSON.stringify(next));
      if (next.me >= 20 && !isGameOver) {
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
    isStopwatch,
    toggleMode,
    handleStart: baseStart,
    handlePause,
    handleReset: baseReset,
    handleSkip,
    handleBack,
    skipAllWarmup,
    setTimeLeft,
    progress,
    jumpToInterval
  } = useTimer(onIntervalComplete, onSessionComplete, onBreakComplete, onWarmupComplete, onWarmupIntervalComplete);

  // Calculate overall progress
  const totalPhases = INTERVALS.length * 2 - 1;
  let overallProgress = 0;
  if (isSessionComplete) {
    overallProgress = 100;
  } else if (!isWarmup) {
    const currentPhase = currentIntervalIndex * 2 + (isBreakTime ? 1 : 0);
    overallProgress = ((currentPhase + progress / 100) / totalPhases) * 100;
  }

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
            description: "ركز على تنفسك لمدة دقيقتين.",
          });
          break;
        case 2: // Mental Warmup
          setIsMentalWarmupOpen(true);
          toast({
            title: "الخطوة الثالثة: تسخين ذهني",
            description: "قم بحل المسائل الرياضية لتنشيط عقلك.",
          });
          break;
      }
    }
  }, [isWarmup, warmupIntervalIndex, isActive, isPaused, toast]);

  const handleStart = useCallback(() => {
    initAudio();
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
          if (next.time >= 20 && !isGameOver) {
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
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          className={`w-32 h-32 ${isMeWinner ? 'bg-mario-yellow' : 'bg-mario-brown'} mario-block rounded-full flex items-center justify-center mb-8`}
        >
          <Trophy size={64} className="text-black" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-panel mario-block p-8 max-w-md w-full mb-8"
        >
          <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter scoreboard-font">
            {isMeWinner ? "انتصار!" : "هزيمة!"}
          </h2>

          <div className="flex justify-center items-center gap-8 my-6">
            <div className="text-center">
              <div className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">أنا</div>
              <div className={`text-4xl font-pixel ${isMeWinner ? 'text-mario-emerald' : 'text-white/30'}`}>{score.me}</div>
            </div>
            <div className="text-2xl font-black text-white/20 scoreboard-font">ضد</div>
            <div className="text-center">
              <div className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">الوقت</div>
              <div className={`text-4xl font-pixel ${!isMeWinner ? 'text-mario-red' : 'text-white/30'}`}>{score.time}</div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-white/70 font-black uppercase tracking-widest text-xs">
              الفائز: <span className={isMeWinner ? 'text-mario-emerald' : 'text-mario-red'}>{isMeWinner ? 'أنا' : 'الوقت'}</span>
            </p>
            <p className="text-white/50 text-[10px] uppercase tracking-widest font-bold">
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
          className="mario-btn bg-mario-emerald text-white px-12 py-4 font-black uppercase tracking-widest scoreboard-font"
        >
          جلسة جديدة
        </motion.button>
      </div>
    );
  }

  return (
    <div>
      <div className="relative p-4 sm:p-6 md:p-8">
        <Toaster />

        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-black mario-block-sm p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-mario-red px-2 py-1 text-[10px] font-black uppercase tracking-tighter text-white border-2 border-black">مباشر</div>

            <div className="flex items-center gap-2">
              <Star size={20} className="text-mario-yellow fill-mario-yellow" />
              <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight scoreboard-font text-white">دوري فاينمان للمذاكرة</h1>
            </div>

            <button
              onClick={() => setIsBismillahOpen(true)}
              className="mario-btn bg-mario-emerald text-white text-[10px] font-black px-3 py-1"
            >
              بسم الله
            </button>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/50 scoreboard-font">
            <span>التعلم العميق</span>
            <div className="w-1 h-1 bg-mario-yellow rounded-full" />
            <span>تقنية فاينمان</span>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mb-6 bg-panel mario-block-sm p-3">
          <div className="flex justify-between text-[10px] font-black text-white/60 uppercase tracking-widest mb-2">
            <span>التقدم الإجمالي</span>
            <span className="font-pixel text-[9px]">{Math.round(overallProgress)}%</span>
          </div>
          <div className="h-3 bg-white/10 border-2 border-black overflow-hidden">
            <motion.div
              className="h-full bg-mario-emerald"
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          <div className="lg:col-span-8 min-w-0 flex flex-col">
            <ScoreBar me={score.me} time={score.time} onReset={handleReset} />

            <div className="flex-1 min-w-0 flex flex-col items-center justify-center min-h-[280px] md:min-h-[400px] bg-panel mario-block mb-6 relative overflow-hidden">
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
                  progress={progress}
                  isStopwatch={isStopwatch}
                  onToggleMode={toggleMode}
                />

                <TimerControls
                  isActive={isActive}
                  isPaused={isPaused}
                  onStart={() => { playChime('start', volume); handleStart(); }}
                  onPause={handlePause}
                  onStop={handleReset}
                  onSkip={() => {
                    initAudio();
                    playChime('mandatory', volume);
                    if (isWarmup) {
                      skipAllWarmup();
                    } else {
                      handleSkip();
                    }
                  }}
                  onBack={() => {
                    initAudio();
                    playChime('mandatory', volume);
                    handleBack();
                  }}
                  isBreakTime={isBreakTime}
                  isWarmup={isWarmup}
                  isStopwatch={isStopwatch}
                />
              </div>
            </div>

            {/* Quick Timers Bar */}
            <div className="mb-6 bg-panel mario-block p-5">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={14} className="text-mario-sky" />
                <h3 className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] scoreboard-font">مؤقتات سريعة (دقائق)</h3>
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {INTERVALS.map((mins, tIdx) => (
                  <button
                    key={tIdx}
                    onClick={() => {
                      initAudio();
                      playChime('interval', volume);
                      handleTimeEdit(mins * 60);
                    }}
                    className="mario-btn h-10 bg-panel-soft text-white font-pixel text-[10px] flex items-center justify-center"
                  >
                    {mins}
                  </button>
                ))}
              </div>
            </div>

            <IntervalProgress
              currentIntervalIndex={currentIntervalIndex}
              intervals={INTERVALS}
              progress={progress}
              isBreakTime={isBreakTime}
              isWarmup={isWarmup}
              warmupIntervalIndex={warmupIntervalIndex}
              onJumpToInterval={(idx) => {
                initAudio();
                playChime('mandatory', volume);
                jumpToInterval(idx);
              }}
            />
          </div>

          <div className="lg:col-span-4 min-w-0 space-y-4 md:space-y-6">
            <div className="bg-panel mario-block p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Wind size={14} className="text-mario-sky" />
                  <h3 className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] scoreboard-font">أدوات الاستشفاء</h3>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIsBreathingOpen(true)}
                  className="mario-btn py-4 bg-mario-emerald/10 flex flex-col items-center justify-center gap-2 group"
                >
                  <div className="w-10 h-10 rounded-full bg-mario-emerald border-2 border-black flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Wind size={20} className="text-white" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white scoreboard-font">تنفس الصندوق</span>
                </button>

                {/* Individualized Exercises */}
                {RECOVERY_VIDEOS.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank')}
                    className="mario-btn py-4 bg-mario-yellow/10 flex flex-col items-center justify-center gap-2 group"
                  >
                    <div className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white scoreboard-font text-center px-2 line-clamp-1">
                      {video.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-panel mario-block p-5 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ExternalLink size={14} className="text-mario-sky" />
                  <h3 className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] scoreboard-font">أجواء تحفيزية</h3>
                </div>
              </div>

              <a
                href="https://www.youtube.com/watch?v=74cOUSKXMz0"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block aspect-video bg-black border-2 border-black overflow-hidden hover:border-mario-yellow transition-colors"
              >
                <img
                  src="https://img.youtube.com/vi/74cOUSKXMz0/maxresdefault.jpg"
                  alt="Motivational Video Thumbnail"
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 bg-mario-red border-2 border-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <ExternalLink size={20} className="text-white ml-0.5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white scoreboard-font">تشغيل</span>
                </div>
              </a>
              <p className="text-[9px] text-white/50 mt-3 font-bold leading-relaxed">انقر لفتح فيديو تحفيزي في علامة تبويب جديدة.</p>
            </div>

            <div className="bg-panel mario-block p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Volume2 size={14} className="text-mario-sky" />
                  <h3 className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] scoreboard-font">التحكم في الصوت</h3>
                </div>
                <span className="text-[10px] font-pixel text-white">{Math.round(volume * 100)}%</span>
              </div>
              <div className="flex items-center gap-3">
                {volume === 0 ? <VolumeX size={16} className="text-white/40" /> : <Volume2 size={16} className="text-mario-sky" />}
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
                  className="flex-1 h-2 bg-white/10 border border-white/20 rounded-lg appearance-none cursor-pointer accent-mario-red"
                />
              </div>
            </div>

            <div className="bg-panel mario-block p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={14} className="text-mario-sky" />
                <h3 className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] scoreboard-font">التركيز الحالي</h3>
              </div>
              <StudyTopicInput
                topic={currentTopic}
                onTopicChange={setCurrentTopic}
                onTopicSave={handleTopicSave}
                isActive={isActive}
                isPaused={isPaused}
              />
            </div>

            <div className="bg-panel mario-block p-5">
              <StudyStagesChecklist />
              <SmartStudyChecklist />
            </div>

            <div className="flex justify-center pt-4">
              <button
                onClick={handleReset}
                className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-mario-red transition-colors disabled:opacity-30 scoreboard-font"
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
        isOpen={isMentalWarmupOpen}
        onClose={() => setIsMentalWarmupOpen(false)}
        title="تسخين ذهني"
      >
        <MentalWarmup onComplete={() => setIsMentalWarmupOpen(false)} />
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
            className="text-5xl font-black text-mario-emerald scoreboard-font mb-4"
          >
            بسم الله
          </motion.div>
          <p className="text-white/60 text-sm font-bold">
            "وقل ربي زدني علماً"
          </p>
          <button
            onClick={() => setIsBismillahOpen(false)}
            className="mario-btn mt-8 bg-mario-emerald text-white px-8 py-2 font-black"
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
            className="text-5xl font-black text-mario-emerald scoreboard-font mb-6 leading-relaxed px-4"
          >
            الحمد لله
          </motion.div>
          <div className="w-16 h-16 bg-mario-yellow mario-block-sm rounded-full flex items-center justify-center mb-6">
            <Trophy className="text-black" size={32} />
          </div>
          <button
            onClick={() => {
              setIsSessionModalOpen(false);
              setHasAcknowledgedCompletion(true);
            }}
            className="mario-btn bg-mario-emerald text-white px-10 py-3 font-black"
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
              className={`fixed bottom-24 left-1/2 px-8 py-4 mario-block z-50 font-black uppercase tracking-widest text-xs scoreboard-font ${
                isSessionComplete ? "bg-mario-brown text-white" :
                isWarmup ? "bg-mario-yellow text-black" :
                isBreakTime ? "bg-mario-emerald text-white" : "bg-mario-sky text-white"
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
