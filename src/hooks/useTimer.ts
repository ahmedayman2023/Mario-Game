import { useState, useEffect, useRef, useCallback } from "react";
import { INTERVALS, BREAK_DURATION, WARMUP_INTERVALS, STORAGE_KEYS } from "../constants";
import { TimerState } from "../types";

export const useTimer = (
  onIntervalComplete: () => void, 
  onSessionComplete: () => void, 
  onBreakComplete: () => void,
  onWarmupComplete: () => void,
  onWarmupIntervalComplete: () => void
) => {
  // Persistence Helper
  const getSavedState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TIMER_STATE);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  const savedState = getSavedState();

  const [isWarmup, setIsWarmup] = useState(savedState?.isWarmup ?? true);
  const [warmupIntervalIndex, setWarmupIntervalIndex] = useState(() => {
    const index = savedState?.warmupIntervalIndex ?? 0;
    return index >= WARMUP_INTERVALS.length ? 0 : index;
  });

  // Ensure index is valid if WARMUP_INTERVALS changes
  useEffect(() => {
    if (warmupIntervalIndex >= WARMUP_INTERVALS.length) {
      setWarmupIntervalIndex(0);
    }
  }, [warmupIntervalIndex]);
  
  const [timeLeft, setTimeLeft] = useState(() => {
    if (savedState && savedState.isActive && savedState.lastUpdated) {
      const passed = Math.floor((Date.now() - savedState.lastUpdated) / 1000);
      return Math.max(0, savedState.timeLeft - passed);
    }
    if (savedState?.timeLeft !== undefined) return savedState.timeLeft;
    return WARMUP_INTERVALS[0] * 60;
  });

  const [isActive, setIsActive] = useState(savedState?.isActive ?? false);
  const [isPaused, setIsPaused] = useState(savedState?.isPaused ?? false);
  const [currentIntervalIndex, setCurrentIntervalIndex] = useState(savedState?.currentIntervalIndex ?? 0);
  const [isBreakTime, setIsBreakTime] = useState(savedState?.isBreakTime ?? false);
  const [isSessionComplete, setIsSessionComplete] = useState(savedState?.isSessionComplete ?? false);
  const [selectedStartingInterval, setSelectedStartingInterval] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const targetEndTimeRef = useRef<number | null>(null);

  // Save state whenever it changes
  useEffect(() => {
    const existing = getSavedState() || {};
    const state = {
      ...existing,
      timeLeft,
      currentIntervalIndex,
      warmupIntervalIndex,
      isBreakTime,
      isWarmup,
      isSessionComplete,
      isPaused,
      isActive,
      lastUpdated: Date.now()
    };
    localStorage.setItem(STORAGE_KEYS.TIMER_STATE, JSON.stringify(state));
  }, [timeLeft, currentIntervalIndex, warmupIntervalIndex, isBreakTime, isWarmup, isSessionComplete, isPaused, isActive]);

  const handleReset = useCallback(() => {
    setSelectedStartingInterval(0);
    setCurrentIntervalIndex(0);
    setWarmupIntervalIndex(0);
    setTimeLeft(WARMUP_INTERVALS[0] * 60);
    setIsWarmup(true);
    setIsBreakTime(false);
    setIsSessionComplete(false);
    setIsActive(false);
    setIsPaused(false);
    targetEndTimeRef.current = null;
  }, []);

  const handleStart = useCallback(() => {
    let initialTime = timeLeft;
    if (isSessionComplete) {
      setIsWarmup(true);
      setWarmupIntervalIndex(0);
      initialTime = WARMUP_INTERVALS[0] * 60;
      setCurrentIntervalIndex(0);
      setIsBreakTime(false);
      setIsSessionComplete(false);
    }
    
    setTimeLeft(initialTime);
    setIsActive(true);
    setIsPaused(false);
    targetEndTimeRef.current = Date.now() + initialTime * 1000;
  }, [isSessionComplete, timeLeft]);

  const handlePause = useCallback(() => {
    setIsActive(false);
    setIsPaused(true);
    targetEndTimeRef.current = null;
  }, []);

  const handleSkip = useCallback(() => {
    let nextTime = 0;
    if (isWarmup) {
      if (warmupIntervalIndex < WARMUP_INTERVALS.length - 1) {
        onWarmupIntervalComplete();
        const nextIdx = warmupIntervalIndex + 1;
        setWarmupIntervalIndex(nextIdx);
        nextTime = WARMUP_INTERVALS[nextIdx] * 60;
      } else {
        onWarmupComplete();
        setIsWarmup(false);
        setCurrentIntervalIndex(0);
        nextTime = INTERVALS[0] * 60;
      }
    } else if (isBreakTime) {
      onBreakComplete();
      if (currentIntervalIndex < INTERVALS.length - 1) {
        const nextIndex = currentIntervalIndex + 1;
        setCurrentIntervalIndex(nextIndex);
        nextTime = INTERVALS[nextIndex] * 60;
        setIsBreakTime(false);
      } else {
        setIsActive(false);
        setIsSessionComplete(true);
        onSessionComplete();
      }
    } else {
      onIntervalComplete();
      if (currentIntervalIndex < INTERVALS.length - 1) {
        if (BREAK_DURATION > 0) {
          setIsBreakTime(true);
          nextTime = BREAK_DURATION * 60;
        } else {
          const nextIndex = currentIntervalIndex + 1;
          setCurrentIntervalIndex(nextIndex);
          nextTime = INTERVALS[nextIndex] * 60;
          setIsBreakTime(false);
        }
      } else {
        setIsActive(false);
        setIsSessionComplete(true);
        onSessionComplete();
      }
    }
    
    setTimeLeft(nextTime);
    if (isActive && !isPaused && nextTime > 0) {
      targetEndTimeRef.current = Date.now() + nextTime * 1000;
    } else {
      targetEndTimeRef.current = null;
    }
  }, [isWarmup, isBreakTime, currentIntervalIndex, onIntervalComplete, onSessionComplete, onBreakComplete, isActive, isPaused]);

  const skipAllWarmup = useCallback(() => {
    onWarmupComplete();
    setIsWarmup(false);
    setCurrentIntervalIndex(0);
    const nextTime = INTERVALS[0] * 60;
    setTimeLeft(nextTime);
    if (isActive && !isPaused) {
      targetEndTimeRef.current = Date.now() + nextTime * 1000;
    } else {
      targetEndTimeRef.current = null;
    }
  }, [onWarmupComplete, isActive, isPaused]);

  useEffect(() => {
    if (isActive && !isPaused) {
      // Initialize target end time if not set (e.g. on resume or initial load)
      if (!targetEndTimeRef.current) {
        targetEndTimeRef.current = Date.now() + timeLeft * 1000;
      }

      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((targetEndTimeRef.current! - now) / 1000));
        
        if (remaining <= 0) {
          clearInterval(intervalRef.current!);
          
          if (isWarmup) {
            if (warmupIntervalIndex < WARMUP_INTERVALS.length - 1) {
              onWarmupIntervalComplete();
              const nextIdx = warmupIntervalIndex + 1;
              const nextTime = WARMUP_INTERVALS[nextIdx] * 60;
              setWarmupIntervalIndex(nextIdx);
              setTimeLeft(nextTime);
              targetEndTimeRef.current = Date.now() + nextTime * 1000;
            } else {
              onWarmupComplete();
              setIsWarmup(false);
              setCurrentIntervalIndex(0);
              const nextTime = INTERVALS[0] * 60;
              setTimeLeft(nextTime);
              targetEndTimeRef.current = Date.now() + nextTime * 1000;
            }
          } else if (isBreakTime) {
            onBreakComplete();
            if (currentIntervalIndex < INTERVALS.length - 1) {
              const nextIndex = currentIntervalIndex + 1;
              const nextTime = INTERVALS[nextIndex] * 60;
              setCurrentIntervalIndex(nextIndex);
              setIsBreakTime(false);
              setTimeLeft(nextTime);
              targetEndTimeRef.current = Date.now() + nextTime * 1000;
            } else {
              setIsActive(false);
              setIsSessionComplete(true);
              onSessionComplete();
              setTimeLeft(0);
              targetEndTimeRef.current = null;
            }
          } else {
            onIntervalComplete();
            if (currentIntervalIndex < INTERVALS.length - 1) {
              if (BREAK_DURATION > 0) {
                const nextTime = BREAK_DURATION * 60;
                setIsBreakTime(true);
                setTimeLeft(nextTime);
                targetEndTimeRef.current = Date.now() + nextTime * 1000;
              } else {
                const nextIndex = currentIntervalIndex + 1;
                const nextTime = INTERVALS[nextIndex] * 60;
                setCurrentIntervalIndex(nextIndex);
                setIsBreakTime(false);
                setTimeLeft(nextTime);
                targetEndTimeRef.current = Date.now() + nextTime * 1000;
              }
            } else {
              setIsActive(false);
              setIsSessionComplete(true);
              onSessionComplete();
              setTimeLeft(0);
              targetEndTimeRef.current = null;
            }
          }
        } else {
          // Only update if the second has changed to minimize re-renders
          setTimeLeft(remaining);
        }
      }, 200); // High frequency check for accuracy
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      targetEndTimeRef.current = null;
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, isPaused, isWarmup, warmupIntervalIndex, isBreakTime, currentIntervalIndex, onIntervalComplete, onSessionComplete, onBreakComplete, onWarmupComplete, onWarmupIntervalComplete]);

  const handleTimeEdit = useCallback((newTime: number) => {
    setTimeLeft(newTime);
    if (isActive && !isPaused) {
      targetEndTimeRef.current = Date.now() + newTime * 1000;
    }
  }, [isActive, isPaused]);

  const currentDuration = isWarmup ? WARMUP_INTERVALS[warmupIntervalIndex] : isBreakTime ? BREAK_DURATION : INTERVALS[currentIntervalIndex];
  const progress = ((currentDuration * 60 - timeLeft) / (currentDuration * 60)) * 100;

  return {
    timeLeft,
    setTimeLeft,
    isActive,
    isPaused,
    currentIntervalIndex,
    warmupIntervalIndex,
    isBreakTime,
    isWarmup,
    isSessionComplete,
    selectedStartingInterval,
    setSelectedStartingInterval,
    handleStart,
    handlePause,
    handleReset,
    handleSkip,
    skipAllWarmup,
    handleTimeEdit,
    setIsSessionComplete,
    progress
  };
};
