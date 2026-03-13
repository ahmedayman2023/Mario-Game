import React, { useState, useEffect, useRef, useCallback } from "react";
import { StudySession } from "@/src/entities/StudySession";
import { User } from "@/src/entities/User";
import TimerDisplay from "../components/timer/TimerDisplay";
import TodoList from "../components/timer/TodoList";
import TimerControls from "../components/timer/TimerControls";
import IntervalProgress from "../components/timer/IntervalProgress";
import ScoreBar from "../components/timer/ScoreBar";
import StudyTopicInput from "../components/timer/StudyTopicInput";
import { BookOpen } from 'lucide-react';
import { useToast } from "@/src/components/ui/use-toast";
import { Toaster } from "@/src/components/ui/toaster";
import LevelPanel from "../components/timer/LevelPanel";

// Updated interval pattern from user's specification
const INTERVALS = [
1, 1, 1, 2, 2, 2, 5, 5, 5, 5, 6, 6, 7, 7, 5, 10, 15, 5, 15,
1, 1, 1, 1, 1, 1,
2, 2, 2, 2,
3, 3, 3, 3,
4, 4, 4, 4,
5, 5,
6, 10, 5,
1, 1, 1, 1, 1, 1, 1, 1,
2, 2, 2, 2,
3, 3, 3, 3,
4, 4, 4, 4,
5, 5,
6, 10, 5,
1, 1];



const BREAK_DURATION = 2; // 2 minutes break between intervals

// New IntervalSelector component - updated to accept 'isPaused' prop, though not used internally currently
const IntervalSelector = ({ intervals, selectedInterval, onIntervalChange, onReset, isActive, isPaused }: any) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 p-4 bg-black rounded-2xl text-white">
      <label htmlFor="interval-select" className="text-slate-700 font-medium whitespace-nowrap">
        Start from interval:
      </label>
      <select
        id="interval-select"
        value={selectedInterval}
        onChange={(e) => onIntervalChange(parseInt(e.target.value, 10))}
        className="block w-full sm:w-auto px-4 py-2 rounded-lg bg-black text-white border-0 focus:outline-none"
        disabled={isActive} // Disable selection while timer is active
      >
        {intervals.map((duration: number, index: number) =>
        <option key={index} value={index}>
            {index + 1} ({duration} min)
          </option>
        )}
      </select>

    </div>);

};

export default function Timer() {
  const [currentIntervalIndex, setCurrentIntervalIndex] = useState(0);
  const [selectedStartingInterval, setSelectedStartingInterval] = useState(0);
  const [timeLeft, setTimeLeft] = useState(INTERVALS[0] * 60);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isBreakTime, setIsBreakTime] = useState(false);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const [completedIntervals, setCompletedIntervals] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [showCompletedMessage, setShowCompletedMessage] = useState(false);
  const [todaysTotalTime, setTodaysTotalTime] = useState(0);
  const [currentTopic, setCurrentTopic] = useState("");
  const [lastStudySession, setLastStudySession] = useState<any>(null);

  const [score, setScore] = useState({ me: 0, time: 0 });
  const scoreKey = () => 'score';
  const persistScore = (s: any) => localStorage.setItem(scoreKey(), JSON.stringify(s));
  const goalFor = (who: 'me' | 'time') => {
    setScore((prev) => {
      const capped = {
        me: Math.min(69, prev.me || 0),
        time: Math.min(69, prev.time || 0)
      };
      const next = {
        ...capped,
        [who]: Math.min(69, (capped[who] || 0) + 1)
      };
      persistScore(next);
      return next;
    });
  };

  const intervalRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null); // New: audio context for start chime

  const { toast } = useToast();

  const FULL_CYCLES_KEY = "fullCyclesCountV1";
  const [fullCycles, setFullCycles] = useState(0);
  const incFullCycles = React.useCallback(() => {
    setFullCycles((prev) => {
      const next = prev + 1;
      try {localStorage.setItem(FULL_CYCLES_KEY, String(next));} catch {}
      toast({ title: "Level Up!", description: `وصلت للمستوى ${next}` });
      return next;
    });
  }, [toast]);

  const TIMER_STATE_KEY = "timerStateV1";

  // New function to load today's total study time and last session
  const loadTodaysData = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      // Assuming StudySession.filter can sort by '-created_date'
      const todaysSessions = await StudySession.filter({ date: today }, '-created_date');
      const totalMinutes = todaysSessions.reduce((sum: number, session: any) => sum + session.total_minutes, 0);
      setTodaysTotalTime(totalMinutes);

      if (todaysSessions.length > 0) {
        setLastStudySession(todaysSessions[0]); // Most recent session
      } else {
        setLastStudySession(null);
      }

      // Load user's current study topic
      const user = await User.me();
      if (user && user.current_study_topic) {
        setCurrentTopic(user.current_study_topic);
      }

    } catch (error) {
      console.error("Error loading today's data:", error);
    }
  }, []); // useCallback with empty dependency array because it doesn't depend on any state/props

  useEffect(() => {
    // Create audio context for notification sound
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSwm8Np9KAcydcXp2JFAChJctO3n');
    loadTodaysData(); // Load today's data on component mount
  }, [loadTodaysData]); // Add loadTodaysData to dependencies

  // Load today's score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(scoreKey());
    if (saved) {
      try {
        const obj = JSON.parse(saved) || {};
        const clamped = {
          me: Math.min(69, obj.me || 0),
          time: Math.min(69, obj.time || 0)
        };
        setScore(clamped);
        persistScore(clamped);
      } catch {}
    }
  }, []);

  // Load full cycles (completed 1→19 sessions) from localStorage
  useEffect(() => {
    const saved = parseInt(localStorage.getItem(FULL_CYCLES_KEY) || "0", 10);
    if (!isNaN(saved)) setFullCycles(saved);
  }, []);

  // Load persisted timer state on mount (freeze; paused on resume)
  useEffect(() => {
    const raw = localStorage.getItem(TIMER_STATE_KEY);
    if (!raw) return;
    try {
      const st = JSON.parse(raw);
      if (typeof st.timeLeft === "number") setTimeLeft(st.timeLeft);
      if (typeof st.currentIntervalIndex === "number") setCurrentIntervalIndex(st.currentIntervalIndex);
      if (typeof st.isBreakTime === "boolean") setIsBreakTime(st.isBreakTime);
      if (typeof st.isSessionComplete === "boolean") setIsSessionComplete(st.isSessionComplete);
      if (typeof st.selectedStartingInterval === "number") setSelectedStartingInterval(st.selectedStartingInterval);
      if (typeof st.totalStudyTime === "number") setTotalStudyTime(st.totalStudyTime);
      if (typeof st.completedIntervals === "number") setCompletedIntervals(st.completedIntervals);
      if (typeof st.currentTopic === "string") setCurrentTopic(st.currentTopic);
      // Always resume paused, never auto-run, no real-time catchup
      setIsActive(false);
      setIsPaused(true);
    } catch {}
  }, []);

  // Removed auto reset at midnight per request; score resets only via Reset Full Session button

  // Inactivity: escalating idle penalties at 20s, 40s, 60s, 80s, 100s
  useEffect(() => {
    let to: any;
    const steps = [2, 4, 6, 8, 10];
    let stepIdx = 0;

    const clearTimer = () => {
      if (to) {
        clearTimeout(to);
        to = null;
      }
    };

    const schedule = () => {
      clearTimer();
      if (!isActive) {
        const secs = steps[Math.min(stepIdx, steps.length - 1)];
        to = setTimeout(() => {
          goalFor('time');
          toast({ title: 'هدف للوقت', description: `${secs} ثانية بلا بدء جلسة.` });
          stepIdx = Math.min(stepIdx + 1, steps.length - 1); // escalate, capped at 100s
          schedule(); // keep scheduling if still inactive
        }, secs * 1000);
      }
    };

    const onActivity = () => {
      stepIdx = 0; // reset on any user action
      schedule();
    };

    const evs = ['mousedown', 'keydown', 'touchstart'];
    evs.forEach((e) => window.addEventListener(e, onActivity));

    schedule();

    return () => {
      clearTimer();
      evs.forEach((e) => window.removeEventListener(e, onActivity));
    };
  }, [isActive, toast]);

  // Persist timer state locally whenever relevant values change
  useEffect(() => {
    const st = {
      timeLeft,
      currentIntervalIndex,
      isBreakTime,
      isSessionComplete,
      selectedStartingInterval,
      totalStudyTime,
      completedIntervals,
      currentTopic
    };
    try {
      localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(st));
    } catch {}
  }, [timeLeft, currentIntervalIndex, isBreakTime, isSessionComplete, selectedStartingInterval, totalStudyTime, completedIntervals, currentTopic]);

  // New: soft natural chime on start (no external files)
  const playStartChime = React.useCallback(() => {
    const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioCtx();
    }
    const ctx = audioCtxRef.current!;
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.2, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    const o1 = ctx.createOscillator();
    o1.type = "sine";
    o1.frequency.setValueAtTime(880, now);
    o1.frequency.exponentialRampToValueAtTime(1320, now + 0.4);

    const o2 = ctx.createOscillator();
    o2.type = "triangle";
    o2.frequency.setValueAtTime(1760, now);
    o2.frequency.exponentialRampToValueAtTime(990, now + 0.6);

    o1.connect(gain);
    o2.connect(gain);
    gain.connect(ctx.destination);

    o1.start(now);
    o2.start(now);
    o1.stop(now + 1.2);
    o2.stop(now + 1.2);
  }, []);

  // Notification chime for interval transitions (works better in background)
  const playNotifyChime = React.useCallback(() => {
    const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioCtx();
    }
    const ctx = audioCtxRef.current!;
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.25, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

    const o1 = ctx.createOscillator();
    o1.type = "sine";
    o1.frequency.setValueAtTime(1200, now);

    const o2 = ctx.createOscillator();
    o2.type = "square";
    o2.frequency.setValueAtTime(900, now + 0.02);

    o1.connect(gain);
    o2.connect(gain);
    gain.connect(ctx.destination);

    o1.start(now);
    o2.start(now + 0.02);
    o1.stop(now + 0.4);
    o2.stop(now + 0.35);
  }, []);

  // Mandatory end chime: WebAudio + HTMLAudio fallback
  const playMandatoryChime = React.useCallback(() => {
    try {playNotifyChime();} catch (e) {}
    try {audioRef.current && audioRef.current.play().catch(() => {});} catch (e) {}
  }, [playNotifyChime]);

  // Keep audio context active on visibility/focus changes
  useEffect(() => {
    const ensureAudio = () => {
      const ctx = audioCtxRef.current;
      if (ctx && ctx.state === "suspended") ctx.resume();
    };
    document.addEventListener("visibilitychange", ensureAudio);
    window.addEventListener("focus", ensureAudio);
    return () => {
      document.removeEventListener("visibilitychange", ensureAudio);
      window.removeEventListener("focus", ensureAudio);
    };
  }, []);

  // Optional: cleanup audio context on unmount
  React.useEffect(() => {
    return () => {
      if (audioCtxRef.current && typeof audioCtxRef.current.close === "function") {
        audioCtxRef.current.close();
      }
    };
  }, []);

  const saveSession = useCallback(async () => {
    if (totalStudyTime > 0) {
      await StudySession.create({
        date: new Date().toISOString().split('T')[0],
        total_minutes: totalStudyTime,
        intervals_completed: completedIntervals,
        // Changed highest_interval logic as per outline
        highest_interval: Math.max(...INTERVALS.slice(0, currentIntervalIndex + 1)),
        topic: currentTopic || "Revit Study", // New topic field
        notes: "" // New notes field
      });
      // Reload today's data after saving
      loadTodaysData();
    }
  }, [totalStudyTime, completedIntervals, currentIntervalIndex, currentTopic, loadTodaysData]);

  useEffect(() => {
    if (isActive && timeLeft > 0 && !isSessionComplete) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            // Time completed
            try {
              playMandatoryChime();
            } catch (e) {}

            if (isBreakTime) {
              // Break finished, start next study interval
              setIsBreakTime(false);
              if (currentIntervalIndex < INTERVALS.length - 1) {
                const nextIndex = currentIntervalIndex + 1;
                setCurrentIntervalIndex(nextIndex);
                setShowCompletedMessage(true);
                setTimeout(() => setShowCompletedMessage(false), 2000);
                return INTERVALS[nextIndex] * 60;
              } else {
                // All intervals completed - STOP HERE
                setIsActive(false);
                setIsSessionComplete(true);
                setShowCompletedMessage(true);
                if (selectedStartingInterval === 0) {incFullCycles();}
                saveSession();
                return 0;
              }
            } else {
              // Study interval finished
              setCompletedIntervals((prev) => prev + 1);
              goalFor('me');
              setTotalStudyTime((prev) => prev + INTERVALS[currentIntervalIndex]);

              if (currentIntervalIndex < INTERVALS.length - 1) {
                // More intervals to go, start break
                setIsBreakTime(true);
                setTimeLeft(BREAK_DURATION * 60); // Set break time here
                setShowCompletedMessage(true);
                setTimeout(() => setShowCompletedMessage(false), 2000);
                return BREAK_DURATION * 60; // Explicitly return break duration
              } else {
                // Last interval completed - STOP HERE
                setIsActive(false);
                setIsSessionComplete(true);
                setShowCompletedMessage(true);
                if (selectedStartingInterval === 0) {incFullCycles();}
                saveSession();
                return 0;
              }
            }
          }
          return time - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, currentIntervalIndex, timeLeft, isBreakTime, isSessionComplete, saveSession, playMandatoryChime, selectedStartingInterval, incFullCycles]);

  const handleTimeEdit = (newTimeInSeconds: number) => {
    setTimeLeft(newTimeInSeconds);
  };

  const handleIntervalChange = (intervalIndex: number) => {
    setSelectedStartingInterval(intervalIndex);
    setCurrentIntervalIndex(intervalIndex);
    setTimeLeft(INTERVALS[intervalIndex] * 60);
    setIsBreakTime(false);
    setIsSessionComplete(false);
    setIsActive(false); // Stop the timer if running
    setIsPaused(true); // Put it in a paused state, ready to start
  };

  const handleReset = () => {
    setSelectedStartingInterval(0);
    setCurrentIntervalIndex(0);
    setTimeLeft(INTERVALS[0] * 60);
    setTotalStudyTime(0);
    setCompletedIntervals(0);
    setSessionStartTime(null);
    setIsBreakTime(false);
    setIsSessionComplete(false);
    setIsActive(false);
    setIsPaused(false);
    setCurrentTopic(""); // Reset topic on full session reset
    try {localStorage.removeItem(TIMER_STATE_KEY);} catch {}
    // Reset score to 0-0 only when pressing this button
    const reset = { me: 0, time: 0 };
    setScore(reset);
    persistScore(reset);
  };

  const handleStart = () => {
    if (isSessionComplete) {
      // Start a new session from selected interval
      setCurrentIntervalIndex(selectedStartingInterval);
      setTimeLeft(INTERVALS[selectedStartingInterval] * 60);
      setTotalStudyTime(0);
      setCompletedIntervals(0);
      setIsBreakTime(false);
      setIsSessionComplete(false);
      setSessionStartTime(new Date());
    } else if (!sessionStartTime) {
      // If session not complete and no start time, initialize
      setSessionStartTime(new Date());
      // Ensure we start from the correct interval if selectedStartingInterval was changed before starting
      // but only if the timer hasn't already begun counting down from currentIntervalIndex
      if (currentIntervalIndex === 0 && selectedStartingInterval !== 0) {
        setCurrentIntervalIndex(selectedStartingInterval);
        setTimeLeft(INTERVALS[selectedStartingInterval] * 60);
      }
    }
    // New: play soft natural chime on start
    playStartChime();

    setIsActive(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsActive(false);
    setIsPaused(true);
  };

  const handleStop = async () => {
    setIsActive(false);
    setIsPaused(true); // Keep the state as paused to allow resuming later if desired
    await saveSession();
    // The reset logic is removed to keep the session state.
  };

  const handleTopicSave = async () => {
    try {
      await User.updateMyUserData({ current_study_topic: currentTopic });
      toast({
        title: "Topic Saved!",
        description: `Your topic "${currentTopic}" has been saved for the next session.`
      });
    } catch (error) {
      console.error("Error saving topic:", error);
      toast({
        title: "Error",
        description: "Could not save your topic. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSkip = () => {
    if (!isActive && !isSessionComplete) return; // Only skip if timer is active or not already complete

    try {
      playMandatoryChime(); // Play sound on skip
    } catch (e) {}

    if (isBreakTime) {
      // Skip break, go to next interval
      if (currentIntervalIndex < INTERVALS.length - 1) {
        const nextIndex = currentIntervalIndex + 1;
        setCurrentIntervalIndex(nextIndex);
        setTimeLeft(INTERVALS[nextIndex] * 60);
        setIsBreakTime(false);
        setShowCompletedMessage(true); // Indicate break ended, next interval started
        setTimeout(() => setShowCompletedMessage(false), 2000);
      } else {
        // No more intervals, complete session
        setIsActive(false);
        setIsSessionComplete(true);
        setShowCompletedMessage(true); // Indicate session completed
        setTimeout(() => setShowCompletedMessage(false), 2000);
        saveSession();
      }
    } else {
      // Skip study interval
      setTotalStudyTime((prev) => prev + INTERVALS[currentIntervalIndex]);
      setCompletedIntervals((prev) => prev + 1);

      if (currentIntervalIndex < INTERVALS.length - 1) {
        // Go to break
        setIsBreakTime(true);
        setTimeLeft(BREAK_DURATION * 60);
        setShowCompletedMessage(true); // Indicate interval ended, break started
        setTimeout(() => setShowCompletedMessage(false), 2000);
      } else {
        // Last interval, complete session
        setIsActive(false);
        setIsSessionComplete(true);
        setShowCompletedMessage(true); // Indicate session completed
        setTimeout(() => setShowCompletedMessage(false), 2000);
        if (selectedStartingInterval === 0) {incFullCycles();}
        saveSession();
      }
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const currentDuration = isBreakTime ? BREAK_DURATION : INTERVALS[currentIntervalIndex];
  const progress = (currentDuration * 60 - timeLeft) / (currentDuration * 60) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      <Toaster />

      <ScoreBar me={score.me} time={score.time} />
      <LevelPanel level={fullCycles} cycles={fullCycles} />

      {showCompletedMessage &&
      <div
        className={`fixed top-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-lg z-50 font-semibold ${
        isSessionComplete ?
        "bg-purple-500 text-white" :
        isBreakTime ?
        "bg-green-500 text-white" :
        "bg-blue-500 text-white"}`
        }>

          {isSessionComplete ?
        "Gooooooool!" :
        isBreakTime ?
        "💧 Break Time! Hydrate & stretch!" :
        "✅ Interval Complete!"}
        </div>
      }

      <div className="text-center mb-8">
        




        


      </div>

      {isSessionComplete ?
      <div
        className="bg-black rounded-3xl p-12 text-center text-white mb-8">

          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold mb-2">Session Complete!</h2>
          <p className="text-lg mb-2">You've completed all intervals from {selectedStartingInterval + 1} to {INTERVALS.length}!</p>
          {currentTopic &&
        <p className="text-lg mb-6">Topic: {currentTopic}</p>
        }
          <button
          onClick={handleStart}
          className="bg-white text-purple-600 px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:bg-gray-50 transition-colors">

            Start New Session
          </button>
        </div> :

      <>
          <StudyTopicInput
          topic={currentTopic}
          onTopicChange={setCurrentTopic}
          onTopicSave={handleTopicSave}
          isActive={isActive}
          isPaused={isPaused} />


          <IntervalSelector
          intervals={INTERVALS}
          selectedInterval={selectedStartingInterval}
          onIntervalChange={handleIntervalChange}
          onReset={handleReset}
          isActive={isActive}
          isPaused={isPaused} // Added isPaused prop
        />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start mb-6">
            <TimerDisplay
            minutes={minutes}
            seconds={seconds}
            isActive={isActive}
            currentInterval={isBreakTime ? "Break" : currentIntervalIndex + 1}
            onTimeEdit={handleTimeEdit}
            isBreakTime={isBreakTime} />

            <TodoList />
          </div>

          <TimerControls
          isActive={isActive}
          isPaused={isPaused}
          onStart={handleStart}
          onPause={handlePause}
          onStop={handleStop}
          onSkip={handleSkip}
          isBreakTime={isBreakTime} />


          <IntervalProgress
          currentIntervalIndex={currentIntervalIndex}
          intervals={INTERVALS}
          progress={progress}
          isBreakTime={isBreakTime}
          // The total number of visible intervals in IntervalProgress should reflect
          // the full set, not just from selectedStartingInterval, to show the full roadmap.
          // However, the progress logic itself accounts for currentIntervalIndex.
        />
        </>
      }

      {(totalStudyTime > 0 || completedIntervals > 0) &&
      <div
        className="mt-8 bg-black rounded-2xl p-6 text-center text-white">

          <h3 className="text-lg font-semibold text-white mb-2">Current Session</h3>
          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
            <div>
              <span className="text-slate-300">Total Time</span>
              <div className="text-2xl font-bold text-blue-600">{totalStudyTime}min</div>
            </div>
            <div>
              <span className="text-slate-300">Intervals Done</span>
              <div className="text-2xl font-bold text-green-600">{completedIntervals}</div>
            </div>
          </div>
          {currentTopic &&
        <div className="bg-blue-50 rounded-xl p-3 mt-3">
              <span className="text-sm text-blue-600 font-medium">Studying: </span>
              <span className="text-blue-800 font-semibold">{currentTopic}</span>
            </div>
        }
        </div>
      }

      {/* New "Today's Total Study Time" section */}
      <div
        className="mt-6 bg-black rounded-2xl p-6 text-center text-white">

        <h3 className="text-lg font-semibold mb-2">Today's Total Study Time</h3>
        <div className="text-4xl font-bold mb-1">
          {Math.floor((todaysTotalTime + totalStudyTime) / 60)}h {(todaysTotalTime + totalStudyTime) % 60}m
        </div>
        <p className="text-indigo-100 text-sm">
          Saved sessions: {Math.floor(todaysTotalTime / 60)}h {todaysTotalTime % 60}m
          {totalStudyTime > 0 &&
          <span> + Current: {totalStudyTime}m</span>
          }
        </p>
      </div>

      




























      <div className="mt-10 flex justify-center">
        <button
          onClick={handleReset}
          className="px-6 py-3 bg-red-600 text-white rounded-xl shadow-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isActive}>

          Reset Full Session
        </button>
      </div>
    </div>);

}
