export interface TimerState {
  timeLeft: number;
  currentIntervalIndex: number;
  warmupIntervalIndex: number;
  isBreakTime: boolean;
  isWarmup: boolean;
  isSessionComplete: boolean;
  isStopwatch: boolean;
  totalStudyTime: number;
  completedIntervals: number;
  currentTopic: string;
}

export interface Score {
  me: number;
  time: number;
}

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}
