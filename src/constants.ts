export const INTERVALS = [1, 1, 1, 2, 5, 1, 1, 2, 2, 10, 1, 1, 1, 2, 5, 10, 1, 1, 10]; 

export const FEYNMAN_STEPS = [
  { title: "مشاهدة بدون توقف بدون كتابة فقط فهم", duration: 1 },
  { title: "مشاهدة بدون توقف بدون كتابة فقط فهم", duration: 1 },
  { title: "مشاهدة بدون توقف بدون كتابة فقط فهم", duration: 1 },
  { title: "مشاهدة بدون توقف بدون كتابة فقط فهم", duration: 2 },
  { title: "مشاهدة بدون توقف بدون كتابة فقط فهم", duration: 5 },
  { title: "المذاكرة النشطة: المشاهدة الأولى", duration: 1 },
  { title: "المذاكرة النشطة: المشاهدة الأولى", duration: 1 },
  { title: "المذاكرة النشطة: المشاهدة الأولى", duration: 2 },
  { title: "المذاكرة النشطة: المشاهدة الأولى", duration: 2 },
  { title: "المذاكرة النشطة: المشاهدة الأولى", duration: 10 },
  { title: "المشاهدة والتوقف والكتابة", duration: 1 },
  { title: "المشاهدة والتوقف والكتابة", duration: 1 },
  { title: "المشاهدة والتوقف والكتابة", duration: 1 },
  { title: "المشاهدة والتوقف والكتابة", duration: 2 },
  { title: "المشاهدة والتوقف والكتابة", duration: 5 },
  { title: "المشاهدة والتوقف والكتابة", duration: 10 },
  { title: "مراجعة لما سبق عن طريق الكتابة", duration: 1 },
  { title: "مراجعة لما سبق عن طريق الكتابة", duration: 1 },
  { title: "مراجعة لما سبق عن طريق الكتابة", duration: 10 }
];

// 3-step warmup sequence:
// 1. YouTube (10 seconds for setup)
// 2. Breathing (2 mins)
// 3. Lumosity (5 mins)
export const WARMUP_INTERVALS = [1, 1, 1]; 
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
