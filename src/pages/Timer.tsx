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
import { Trophy, Sparkles } from 'lucide-react';
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
  const [currentTopic, setCurrentTopic] = useState("");
  const [showCompletedMessage, setShowCompletedMessage] = useState(false);

  // Persistence Logic
  const loadInitialData = useCallback(async () => {
    try {
      const savedScore = localStorage.getItem(STORAGE_KEYS.SCORE);
      if (savedScore) setScore(JSON.parse(savedScore));

      const savedCycles = localStorage.getItem(STORAGE_KEYS.FULL_CYCLES);
      if (savedCycles) setFullCycles(parseInt(savedCycles));

      const savedState = localStorage.getItem(STORAGE_KEYS.TIMER_STATE);
      if (savedState) {
        const state: TimerState = JSON.parse(savedState);
        setCurrentTopic(state.currentTopic);
      }

      const userData = await User.getMyUserData();
      if (userData?.current_study_topic) {
        setCurrentTopic(userData.current_study_topic);
      }
    } catch (e) {
      console.error("Failed to load initial data", e);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const onIntervalComplete = useCallback(() => {
    playChime('complete');
    setScore(prev => {
      const next = { ...prev, me: prev.me + 1 };
      localStorage.setItem(STORAGE_KEYS.SCORE, JSON.stringify(next));
      return next;
    });
    setShowCompletedMessage(true);
    setTimeout(() => setShowCompletedMessage(false), 2000);
  }, []);

  const onSessionComplete = useCallback(() => {
    playChime('complete');
    setFullCycles(prev => {
      const next = prev + 1;
      localStorage.setItem(STORAGE_KEYS.FULL_CYCLES, next.toString());
      return next;
    });
    setShowCompletedMessage(true);
    setTimeout(() => setShowCompletedMessage(false), 2000);
  }, []);

  const {
    timeLeft,
    isActive,
    isPaused,
    currentIntervalIndex,
    isBreakTime,
    isSessionComplete,
    handleStart,
    handlePause,
    handleReset: baseReset,
    handleSkip,
    setTimeLeft,
    progress
  } = useTimer(onIntervalComplete, onSessionComplete);

  // Match Logic: Time gets points while paused
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPaused && !isSessionComplete) {
      interval = setInterval(() => {
        setScore(prev => {
          const next = { ...prev, time: prev.time + 1 };
          localStorage.setItem(STORAGE_KEYS.SCORE, JSON.stringify(next));
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused, isSessionComplete]);

  const handleReset = () => {
    baseReset();
    setScore({ me: 0, time: 0 });
    localStorage.setItem(STORAGE_KEYS.SCORE, JSON.stringify({ me: 0, time: 0 }));
  };

  const handleTopicSave = async () => {
    try {
      const existing = localStorage.getItem(STORAGE_KEYS.TIMER_STATE);
      const state = existing ? JSON.parse(existing) : {};
      localStorage.setItem(STORAGE_KEYS.TIMER_STATE, JSON.stringify({ ...state, currentTopic }));
      
      await User.updateMyUserData({ current_study_topic: currentTopic });
      toast({ title: "Topic Saved!", description: `Your topic "${currentTopic}" has been saved.` });
    } catch (error) {
      toast({ title: "Error", description: "Could not save topic.", variant: "destructive" });
    }
  };

  const handleTimeEdit = (newTime: number) => {
    setTimeLeft(newTime);
  };

  if (isSessionComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          className="w-32 h-32 bg-amber-500 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(245,158,11,0.4)]"
        >
          <Trophy size={64} className="text-white" />
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-black text-white mb-4 uppercase tracking-tighter"
        >
          Campaign Secured
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 mb-12 max-w-md"
        >
          You've successfully navigated the focus timeline. Your cognitive stamina has increased.
        </motion.p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleReset}
          className="bg-mario-emerald text-black px-12 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl"
        >
          New Campaign
        </motion.button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 relative">
      <Toaster />
      
      <div className="fixed top-1/4 -left-20 w-64 h-64 bg-mario-red/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-1/4 -right-20 w-64 h-64 bg-mario-emerald/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col">
          <ScoreBar me={score.me} time={score.time} onReset={handleReset} />
          
          <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
            <TimerDisplay 
              minutes={Math.floor(timeLeft / 60)} 
              seconds={timeLeft % 60} 
              isActive={isActive}
              currentInterval={isBreakTime ? "Break" : currentIntervalIndex + 1}
              onTimeEdit={handleTimeEdit}
              isBreakTime={isBreakTime}
            />
            
            <TimerControls 
              isActive={isActive}
              isPaused={isPaused}
              onStart={() => { playChime('start'); handleStart(); }}
              onPause={handlePause}
              onStop={handleReset}
              onSkip={() => { playChime('mandatory'); handleSkip(); }}
              isBreakTime={isBreakTime}
            />
          </div>

          <IntervalProgress 
            currentIntervalIndex={currentIntervalIndex}
            intervals={INTERVALS}
            progress={progress}
            isBreakTime={isBreakTime}
          />
        </div>

        <div className="lg:col-span-4 space-y-6">
          <LevelPanel level={fullCycles} cycles={fullCycles} />
          
          <div className="glass rounded-3xl p-6 border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={14} className="text-mario-emerald" />
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Current Focus</h3>
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
              className="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-mario-red transition-colors disabled:opacity-30"
              disabled={isActive}>
              Reset Full Campaign
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showCompletedMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.9, x: '-50%' }}
            className={`fixed bottom-10 left-1/2 px-8 py-4 rounded-2xl shadow-2xl z-50 font-black uppercase tracking-widest text-xs ${
              isSessionComplete ? "bg-purple-600 text-white" :
              isBreakTime ? "bg-emerald-600 text-white" : "bg-blue-600 text-white"
            }`}
          >
            {isSessionComplete ? "Gooooooool!" : isBreakTime ? "Break Initiated" : "Phase Secured"}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default memo(TimerPage);
