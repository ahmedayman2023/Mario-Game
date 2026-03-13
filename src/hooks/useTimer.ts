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
  }, []);

  const handleStart = useCallback(() => {
    if (isSessionComplete) {
      setCurrentIntervalIndex(selectedStartingInterval);
      setTimeLeft(INTERVALS[selectedStartingInterval] * 60);
      setIsBreakTime(false);
      setIsSessionComplete(false);
    }
    setIsActive(true);
    setIsPaused(false);
  }, [isSessionComplete, selectedStartingInterval]);

  const handlePause = useCallback(() => {
    setIsActive(false);
    setIsPaused(true);
  }, []);

  const handleSkip = useCallback(() => {
    if (isBreakTime) {
      onBreakComplete();
      if (currentIntervalIndex < INTERVALS.length - 1) {
        const nextIndex = currentIntervalIndex + 1;
        setCurrentIntervalIndex(nextIndex);
        setTimeLeft(INTERVALS[nextIndex] * 60);
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
        setTimeLeft(BREAK_DURATION * 60);
      } else {
        setIsActive(false);
        setIsSessionComplete(true);
        onSessionComplete();
      }
    }
  }, [isBreakTime, currentIntervalIndex, onIntervalComplete, onSessionComplete, onBreakComplete]);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            clearInterval(intervalRef.current!);
            
            if (isBreakTime) {
              // Break finished, go to next interval
              onBreakComplete();
              if (currentIntervalIndex < INTERVALS.length - 1) {
                const nextIndex = currentIntervalIndex + 1;
                setCurrentIntervalIndex(nextIndex);
                setIsBreakTime(false);
                setTimeLeft(INTERVALS[nextIndex] * 60);
                return INTERVALS[nextIndex] * 60;
              } else {
                setIsActive(false);
                setIsSessionComplete(true);
                onSessionComplete();
                return 0;
              }
            } else {
              // Study interval finished
              onIntervalComplete();
              if (currentIntervalIndex < INTERVALS.length - 1) {
                setIsBreakTime(true);
                setTimeLeft(BREAK_DURATION * 60);
                return BREAK_DURATION * 60;
              } else {
                setIsActive(false);
                setIsSessionComplete(true);
                onSessionComplete();
                return 0;
              }
            }
          }
          return time - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, isBreakTime, currentIntervalIndex, onIntervalComplete, onSessionComplete, onBreakComplete]);

  const handleTimeEdit = useCallback((newTime: number) => {
    setTimeLeft(newTime);
  }, []);

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
