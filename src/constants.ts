export const INTERVALS = [
  1, 5, 2, 4, 5, 5, 5, 10, 9, 14
];

// 4-step warmup sequence:
// 1. YouTube (1 min for setup)
// 2. Breathing (5 mins)
// 3. Lumosity (5 mins)
// 4. Stretches (5 mins)
export const WARMUP_INTERVALS = [1, 5, 5, 5]; 
export const BREAK_DURATION = 2; // 2 minutes break between intervals

export const STORAGE_KEYS = {
  SCORE: 'mario_timer_score',
  FULL_CYCLES: 'mario_timer_cycles',
  TIMER_STATE: 'mario_timer_state',
  VOLUME: 'mario_timer_volume'
};

export const RECOVERY_VIDEOS = [
  {
    id: 'wnlcuZ0mJSU',
    title: 'تمارين إطالة الكتف',
    duration: 'دقيقة واحدة',
    thumbnail: 'https://img.youtube.com/vi/wnlcuZ0mJSU/mqdefault.jpg'
  },
  {
    id: 'Re-h_rtttIE',
    title: 'تمارين إطالة الرقبة',
    duration: 'دقيقة واحدة',
    thumbnail: 'https://img.youtube.com/vi/Re-h_rtttIE/mqdefault.jpg'
  },
  {
    id: 'jvlztOtc4HI',
    title: 'تمارين اليوجا',
    duration: 'دقيقة واحدة',
    thumbnail: 'https://img.youtube.com/vi/jvlztOtc4HI/mqdefault.jpg'
  }
];
