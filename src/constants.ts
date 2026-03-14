export const INTERVALS = [
  // Phase Alpha (1-18)
  1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 7, 10,
  // Phase Beta (19-36)
  1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 7, 10,
  // Phase Gamma (37-54)
  1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 7, 10,
  // Phase Delta (55-72)
  1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 7, 10
];

export const BREAK_DURATION = 2; // 2 minutes break between intervals

export const STORAGE_KEYS = {
  SCORE: 'mario_timer_score',
  FULL_CYCLES: 'mario_timer_cycles',
  TIMER_STATE: 'mario_timer_state',
  VOLUME: 'mario_timer_volume'
};
