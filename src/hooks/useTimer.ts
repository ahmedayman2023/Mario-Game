import { useState, useEffect, useRef, useCallback } from "react";
import { INTERVALS, BREAK_DURATION, STORAGE_KEYS } from "../constants";
import { TimerState } from "../types";

export const useTimer = (onIntervalComplete: () => void, onSessionComplete: () => void) => {
  const [timeLeft, setTimeLeft] = useState(INTERVALS[0] * 60);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIntervalIndex, setCurrentIntervalIndex] = useState(0);
  const [isBreakTime, setIsBreakTime] = useState(false);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [selectedStartingInterval, setSelectedStartingInterval] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleReset = useCallback(() => {
    setSelectedStartingInterval(0);
    setCurrentIntervalIndex(0);
    setTimeLeft(INTERVALS[0] * 60);
    setIsBreakTime(false);
    setIsSessionComplete(false);
    setIsActive(false);
    setIsPaused(false);
    try { localStorage.removeItem(STORAGE_KEYS.TIMER_STATE); } catch {}
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
  }, [isBreakTime, currentIntervalIndex, onIntervalComplete, onSessionComplete]);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            clearInterval(intervalRef.current!);
            
            if (isBreakTime) {
              // Break finished, go to next interval
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
  }, [isActive, isBreakTime, currentIntervalIndex, onIntervalComplete, onSessionComplete]);

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
