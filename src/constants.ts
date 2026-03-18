export const INTERVALS = [5, 10, 24, 20]; 

export const FEYNMAN_STEPS = [
  {
    title: "مشاهدة بدون توقف بدون كتابة فقط فهم",
    description: "شاهد المقطع بتركيز كامل بدون تدوين أي ملاحظات أو توقف. الهدف هو استيعاب الفكرة العامة للموضوع.",
    completionPercentage: 20
  },
  {
    title: "المذاكرة النشطة: المشاهدة الأولى",
    description: "شاهد مقطع مدته 10 دقائق بتركيز عالي، واكتب فقط 'كلمات مفتاحية' (Keywords). تجنب التوقف الطويل أثناء المشاهدة.",
    completionPercentage: 50
  },
  {
    title: "المشاهدة والتوقف والكتابة",
    description: "شاهد المقطع بتركيز، وتوقف كل 3 دقائق لتدوين الملاحظات وتلخيص ما شاهدته. استمر في هذه الدورة لمدة 24 دقيقة.",
    completionPercentage: 70
  },
  {
    title: "مراجعة لما سبق عن طريق الكتابة زي أيام زمان",
    description: "قم بمراجعة كل ما دونته وشاهدته حتى الآن عن طريق كتابته مرة أخرى بأسلوبك الخاص على الورق، لترسيخ المعلومات في ذاكرتك.",
    completionPercentage: 100
  }
];

// 3-step warmup sequence:
// 1. YouTube (10 seconds for setup)
// 2. Breathing (5 mins)
// 3. Lumosity (5 mins)
export const WARMUP_INTERVALS = [10/60, 5, 5]; 
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
