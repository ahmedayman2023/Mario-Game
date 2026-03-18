export const INTERVALS = [1, 5, 10, 24, 20, 56, 15, 15, 10]; 

export const FEYNMAN_STEPS = [
  {
    title: "اختر المفهوم (Choose the Concept)",
    description: "اكتب اسم الموضوع اللي عايز تتعلمه في أعلى ورقة بيضاء. ابدأ بكتابة كل اللي تعرفه عن الموضوع ده حاليًا، وكأنك بتفرغ عقلك على الورق."
  },
  {
    title: "مشاهدة بدون توقف بدون كتابة فقط فهم",
    description: "شاهد المقطع بتركيز كامل بدون تدوين أي ملاحظات أو توقف. الهدف هو استيعاب الفكرة العامة للموضوع."
  },
  {
    title: "المذاكرة النشطة: المشاهدة الأولى",
    description: "شاهد مقطع مدته 10 دقائق بتركيز عالي، واكتب فقط 'كلمات مفتاحية' (Keywords). تجنب التوقف الطويل أثناء المشاهدة."
  },
  {
    title: "المشاهدة والتوقف والكتابة",
    description: "شاهد المقطع بتركيز، وتوقف كل 3 دقائق لتدوين الملاحظات وتلخيص ما شاهدته. استمر في هذه الدورة لمدة 24 دقيقة."
  },
  {
    title: "مراجعة لما سبق عن طريق الكتابة زي أيام زمان",
    description: "قم بمراجعة كل ما دونته وشاهدته حتى الآن عن طريق كتابته مرة أخرى بأسلوبك الخاص على الورق، لترسيخ المعلومات في ذاكرتك."
  },
  {
    title: "المذاكرة النشطة: المذاكرة العميقة",
    description: "استكمل مذاكرة الموضوع من مصدرك الأساسي بتركيز شديد على 'لماذا؟' و 'كيف؟'. تخيل إنك هتشرح النقطة دي لشخص معندوش خلفية."
  },
  {
    title: "اشرحه لـ طفل (Explain it to a Child)",
    description: "تخيل إنك بتشرح المفهوم ده لطفل عنده 10 سنين. استخدم لغة بسيطة، كن موجزاً، واستخدم التشبيهات."
  },
  {
    title: "حدد الفجوات في فهمك (Identify Knowledge Gaps)",
    description: "حدد النقط اللي وقفت عندها أو اضطررت تستخدم فيها مصطلحات صعبة. ارجع للمصادر الأصلية وركز على الأجزاء دي."
  },
  {
    title: "المراجعة والتبسيط النهائي (Review and Simplify)",
    description: "قُم بتنقيح شرحك، اقرأه بصوت عالي، وحاول تعيد صياغة الجمل المعقدة بكلمات أسهل."
  }
];

// 4-step warmup sequence:
// 1. YouTube (10 seconds for setup)
// 2. Breathing (5 mins)
// 3. Lumosity (5 mins)
// 4. Stretches (5 mins)
export const WARMUP_INTERVALS = [10/60, 5, 5, 5]; 
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
