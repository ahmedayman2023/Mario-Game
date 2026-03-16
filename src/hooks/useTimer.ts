import { useState, useEffect, useRef, useCallback } from "react";
import { INTERVALS, BREAK_DURATION, STORAGE_KEYS } from "../constants";
import { TimerState } from "../types";

export const useTimer = (onIntervalComplete: () => void, onSessionComplete: () => void, onBreakComplete: () => void) => {
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

  const [timeLeft, setTimeLeft] = useState(() => {
    if (savedState && savedState.isActive && savedState.lastUpdated) {
      const passed = Math.floor((Date.now() - savedState.lastUpdated) / 1000);
      return Math.max(0, savedState.timeLeft - passed);
    }
    return savedState?.timeLeft ?? INTERVALS[0] * 60;
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
      isBreakTime,
      isSessionComplete,
      isPaused,
      isActive,
      lastUpdated: Date.now()
    };
    localStorage.setItem(STORAGE_KEYS.TIMER_STATE, JSON.stringify(state));
  }, [timeLeft, currentIntervalIndex, isBreakTime, isSessionComplete, isPaused, isActive]);

  const handleReset = useCallback(() => {
    setSelectedStartingInterval(0);
    setCurrentIntervalIndex(0);
    setTimeLeft(INTERVALS[0] * 60);
    setIsBreakTime(false);
    setIsSessionComplete(false);
    setIsActive(false);
    setIsPaused(false);
    targetEndTimeRef.current = null;
  }, []);

  const handleStart = useCallback(() => {
    let initialTime = timeLeft;
    if (isSessionComplete) {
      const startIdx = selectedStartingInterval;
      setCurrentIntervalIndex(startIdx);
      initialTime = INTERVALS[startIdx] * 60;
      setIsBreakTime(false);
      setIsSessionComplete(false);
    }
    
    setTimeLeft(initialTime);
    setIsActive(true);
    setIsPaused(false);
    targetEndTimeRef.current = Date.now() + initialTime * 1000;
  }, [isSessionComplete, selectedStartingInterval, timeLeft]);

  const handlePause = useCallback(() => {
    setIsActive(false);
    setIsPaused(true);
    targetEndTimeRef.current = null;
  }, []);

  const handleSkip = useCallback(() => {
    let nextTime = 0;
    if (isBreakTime) {
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
        setIsBreakTime(true);
        nextTime = BREAK_DURATION * 60;
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
  }, [isBreakTime, currentIntervalIndex, onIntervalComplete, onSessionComplete, onBreakComplete, isActive, isPaused]);

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
          
          if (isBreakTime) {
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
              const nextTime = BREAK_DURATION * 60;
              setIsBreakTime(true);
              setTimeLeft(nextTime);
              targetEndTimeRef.current = Date.now() + nextTime * 1000;
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
  }, [isActive, isPaused, isBreakTime, currentIntervalIndex, onIntervalComplete, onSessionComplete, onBreakComplete]);

  const handleTimeEdit = useCallback((newTime: number) => {
    setTimeLeft(newTime);
    if (isActive && !isPaused) {
      targetEndTimeRef.current = Date.now() + newTime * 1000;
    }
  }, [isActive, isPaused]);

  const currentDuration = isBreakTime ? BREAK_DURATION : INTERVALS[currentIntervalIndex];
  const progress = ((currentDuration * 60 - timeLeft) / (currentDuration * 60)) * 100;

  return {
    timeLeft,
    setTimeLeft,
    isActive,
    isPaused,
    currentIntervalIndex,
    isBreakTime,
    isSessionComplete,
    selectedStartingInterval,
    setSelectedStartingInterval,
    handleStart,
    handlePause,
    handleReset,
    handleSkip,
    handleTimeEdit,
    setIsSessionComplete,
    progress
  };
};
