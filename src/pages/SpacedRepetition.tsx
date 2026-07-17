import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Check, Calendar, Brain, Sparkles, Star, Trophy, Layers, Pencil, Zap } from 'lucide-react';
import { useToast } from "@/src/components/ui/use-toast";
import Modal from "../components/ui/Modal";
import MentalWarmup from "../components/timer/MentalWarmup";
import { INTERVALS } from '../constants';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  nextReview: number; // timestamp
  interval: number; // in days (legacy, keeping for compatibility)
  easeFactor: number;
  status: 'new' | 'learning' | 'reviewing';
  step: number;
  checklist: { text: string; completed: boolean }[];
}

const STORAGE_KEY = 'spaced_repetition_cards';

const REVIEW_STAGE_LABELS = ['12 ساعة', 'يومين', 'أسبوع', 'شهر', '3 أشهر', '6 أشهر', 'سنة'];
const REVIEW_STAGE_INTERVALS = [
  12 * 60 * 60 * 1000,
  2 * 24 * 60 * 60 * 1000,
  7 * 24 * 60 * 60 * 1000,
  30 * 24 * 60 * 60 * 1000,
  90 * 24 * 60 * 60 * 1000,
  180 * 24 * 60 * 60 * 1000,
  365 * 24 * 60 * 60 * 1000
];
const STAGE_COLORS = ['bg-mario-sky', 'bg-mario-yellow', 'bg-mario-emerald', 'bg-mario-red', 'bg-mario-brown', 'bg-mario-sky', 'bg-mario-yellow'];

const RATING_OPTIONS = [
  { label: 'مرة أخرى', rating: 1, className: 'bg-mario-red text-white' },
  { label: 'صعب', rating: 2, className: 'bg-mario-yellow text-black' },
  { label: 'جيد', rating: 3, className: 'bg-mario-sky text-white' },
  { label: 'سهل', rating: 4, className: 'bg-mario-emerald text-white' },
];

const SpacedRepetition = () => {
  const { toast } = useToast();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCard, setNewCard] = useState({
    question: '',
    answer: '',
    checklist: ['', '', '', '']
  });
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewQueue, setReviewQueue] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isMentalWarmupOpen, setIsMentalWarmupOpen] = useState(false);
  const [activeTimer, setActiveTimer] = useState<{ cardId: string, stageIdx: number, seconds: number } | null>(null);

  // Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimer && activeTimer.seconds > 0) {
      interval = setInterval(() => {
        setActiveTimer(prev => prev ? { ...prev, seconds: prev.seconds - 1 } : null);
      }, 1000);
    } else if (activeTimer && activeTimer.seconds === 0) {
      toast({
        title: "انتهى الوقت!",
        description: "انتهى مؤقت المراجعة لهذه المرحلة",
        variant: "default",
      });
      setActiveTimer(null);
    }
    return () => clearInterval(interval);
  }, [activeTimer, toast]);

  const startTimer = (cardId: string, stageIdx: number, minutes: number) => {
    setActiveTimer({ cardId, stageIdx, seconds: minutes * 60 });
  };

  // Load cards from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setCards(JSON.parse(saved));
    }
  }, []);

  // Save cards to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  }, [cards]);

  const addCard = () => {
    if (!newCard.question || !newCard.answer) {
      toast({
        title: "خطأ",
        description: "يرجى ملء السؤال والجواب",
        variant: "destructive"
      });
      return;
    }

    if (editingId) {
      setCards(cards.map(c => c.id === editingId ? {
        ...c,
        question: newCard.question,
        answer: newCard.answer,
        checklist: newCard.checklist.map((text, idx) => ({
          text: text || 'خطوة جديدة',
          completed: c.checklist[idx]?.completed || false
        }))
      } : c));
      toast({
        title: "تم التحديث",
        description: "تم تحديث البطاقة بنجاح"
      });
    } else {
      const card: Flashcard = {
        id: Date.now().toString(),
        question: newCard.question,
        answer: newCard.answer,
        nextReview: Date.now(),
        interval: 0,
        easeFactor: 2.5,
        status: 'new',
        step: 0,
        checklist: newCard.checklist.map(text => ({ text: text || 'خطوة جديدة', completed: false }))
      };

      setCards([...cards, card]);
      toast({
        title: "تمت الإضافة",
        description: "تمت إضافة البطاقة بنجاح"
      });
    }

    setNewCard({ question: '', answer: '', checklist: ['', '', '', ''] });
    setEditingId(null);
    setIsAddModalOpen(false);
  };

  const editCard = (card: Flashcard) => {
    setNewCard({
      question: card.question,
      answer: card.answer,
      checklist: card.checklist.map(item => item.text)
    });
    setEditingId(card.id);
    setIsAddModalOpen(true);
  };

  const deleteCard = (id: string) => {
    setCards(cards.filter(c => c.id !== id));
    toast({
      title: "تم الحذف",
      description: "تم حذف البطاقة"
    });
  };

  const startReview = () => {
    const now = Date.now();
    const due = cards.filter(c => c.nextReview <= now);
    if (due.length === 0) {
      toast({
        title: "لا يوجد مراجعة",
        description: "لقد أكملت جميع المراجعات لليوم!"
      });
      return;
    }
    setReviewQueue(due);
    setCurrentCardIndex(0);
    setIsReviewing(true);
    setShowAnswer(false);
  };

  const handleRating = (rating: 1 | 2 | 3 | 4, cardToUpdate?: Flashcard) => {
    const currentCard = cardToUpdate || reviewQueue[currentCardIndex];
    let nextStep = currentCard.step || 0;
    let newStatus = currentCard.status;

    let nextReviewDelay = 0;

    if (rating === 1) { // Again
      nextStep = 0;
      newStatus = 'learning';
      nextReviewDelay = 0; // Review again immediately (due now)
    } else {
      // Success (Hard, Good, Easy)
      const baseInterval = REVIEW_STAGE_INTERVALS[Math.min(nextStep, REVIEW_STAGE_INTERVALS.length - 1)];

      if (nextStep >= REVIEW_STAGE_INTERVALS.length) {
        nextReviewDelay = REVIEW_STAGE_INTERVALS[REVIEW_STAGE_INTERVALS.length - 1] * Math.pow(2, nextStep - (REVIEW_STAGE_INTERVALS.length - 1));
      } else {
        nextReviewDelay = baseInterval;
      }

      if (rating === 4) {
        nextStep += 2;
      } else {
        nextStep += 1;
      }

      newStatus = 'reviewing';
    }

    const updatedCard: Flashcard = {
      ...currentCard,
      step: nextStep,
      status: newStatus,
      nextReview: Date.now() + nextReviewDelay
    };

    setCards(prevCards => prevCards.map(c => c.id === updatedCard.id ? updatedCard : c));

    if (!cardToUpdate) {
      if (currentCardIndex < reviewQueue.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        setShowAnswer(false);
      } else {
        setIsReviewing(false);
        toast({
          title: "أحسنت!",
          description: "لقد أكملت جلسة المراجعة"
        });
      }
    }
  };

  const toggleChecklistItem = (cardId: string, index: number) => {
    setCards(cards.map(card => {
      if (card.id === cardId) {
        const newChecklist = [...card.checklist];
        newChecklist[index] = { ...newChecklist[index], completed: !newChecklist[index].completed };
        return { ...card, checklist: newChecklist };
      }
      return card;
    }));
  };

  const dueCount = cards.filter(c => c.nextReview <= Date.now()).length;

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-6 bg-black mario-block p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-mario-yellow border-2 border-white flex items-center justify-center text-black">
            <Brain size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white uppercase tracking-tight scoreboard-font">التكرار المتباعد</h1>
            <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mt-1">تقنية فاينمان للمراجعة</p>
          </div>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="mario-btn bg-mario-emerald text-white w-12 h-12 rounded-full flex items-center justify-center"
        >
          <Plus size={22} strokeWidth={3} />
        </button>
      </div>

      {!isReviewing ? (
        <div className="space-y-8">
          {/* Stats Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-mario-yellow mario-block p-6 flex flex-col items-center text-center">
              <Layers size={28} className="text-black mb-3" />
              <div className="text-3xl font-pixel text-black mb-1">{cards.length}</div>
              <div className="text-[9px] font-black text-black/60 uppercase tracking-widest">إجمالي البطاقات</div>
            </div>

            <div className="bg-mario-red mario-block p-6 flex flex-col items-center text-center">
              <Calendar size={28} className="text-white mb-3" />
              <div className="text-3xl font-pixel text-white mb-1">{dueCount}</div>
              <div className="text-[9px] font-black text-white/70 uppercase tracking-widest">مستحق للمراجعة</div>
            </div>

            <div className="bg-mario-emerald mario-block p-6 flex flex-col items-center text-center">
              <Trophy size={28} className="text-white mb-3" />
              <div className="text-3xl font-pixel text-white mb-1">
                {cards.filter(c => c.status === 'reviewing').length}
              </div>
              <div className="text-[9px] font-black text-white/70 uppercase tracking-widest">بطاقات متقنة</div>
            </div>
          </div>

          {/* Review Schedule */}
          <div className="bg-white mario-block p-6">
            <h2 className="text-[10px] font-black text-black/50 uppercase tracking-[0.3em] mb-5 flex items-center gap-2 scoreboard-font">
              <Sparkles size={14} className="text-mario-sky" />
              جدول المراجعة
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {REVIEW_STAGE_LABELS.map((time, idx) => (
                <div key={idx} className={`${STAGE_COLORS[idx]} mario-block-sm p-3 text-center`}>
                  <div className="text-[8px] font-black text-black/50 uppercase tracking-widest mb-1">مراجعة {idx + 1}</div>
                  <div className="text-xs font-black text-black">{time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Timers Bar - Global */}
          <div className="bg-white mario-block p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={14} className="text-mario-sky" />
              <h3 className="text-[10px] font-black text-black/50 uppercase tracking-[0.3em] scoreboard-font">مؤقتات سريعة (دقائق)</h3>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {INTERVALS.map((mins, tIdx) => (
                <button
                  key={tIdx}
                  onClick={() => {
                    toast({
                      title: `مؤقت ${mins} دقائق`,
                      description: "تم اختيار المؤقت السريع.",
                    });
                  }}
                  className="mario-btn flex-shrink-0 min-w-[44px] h-10 bg-white text-black font-pixel text-[10px] flex items-center justify-center"
                >
                  {mins}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setIsMentalWarmupOpen(true)}
              className="mario-btn flex-1 py-5 bg-white text-black font-black scoreboard-font text-sm uppercase tracking-widest flex items-center justify-center gap-3"
            >
              <Sparkles size={20} className="text-mario-sky" />
              تسخين ذهني
            </button>
            <button
              onClick={startReview}
              disabled={dueCount === 0}
              className={`mario-btn flex-[2] py-5 font-black scoreboard-font text-sm uppercase tracking-widest flex items-center justify-center gap-3 ${
                dueCount > 0
                  ? 'bg-mario-emerald text-white'
                  : 'bg-black/10 text-black/30'
              }`}
            >
              <Brain size={20} strokeWidth={3} />
              ابدأ المراجعة
            </button>
          </div>

          {/* Cards List */}
          <div className="space-y-4">
            <h2 className="text-[10px] font-black text-black/50 uppercase tracking-[0.3em] scoreboard-font flex items-center gap-2">
              <Layers size={14} className="text-mario-sky" />
              قائمة البطاقات
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {cards.length === 0 ? (
                <div className="text-center py-16 bg-white mario-block-sm border-dashed">
                  <p className="text-black/40 text-xs font-black uppercase tracking-widest">لا توجد بطاقات بعد. أضف أول بطاقة للبدء.</p>
                </div>
              ) : (
                cards.map(card => (
                  <div key={card.id} className="bg-white mario-block-sm p-5">
                    <div className="flex items-start justify-between mb-4 gap-3">
                      <div className="text-black font-bold text-base flex-1">{card.question}</div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => editCard(card)}
                          className="text-black/40 hover:text-mario-sky p-2 transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => deleteCard(card.id)}
                          className="text-black/40 hover:text-mario-red p-2 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Review Stages Timeline */}
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-4">
                      {REVIEW_STAGE_INTERVALS.map((_, idx) => {
                        const isCompleted = card.step > idx;
                        const isNext = card.step === idx;

                        let stageDate = 0;
                        if (isCompleted) {
                          stageDate = 0;
                        } else if (isNext) {
                          stageDate = card.nextReview;
                        } else {
                          let additionalTime = 0;
                          for (let j = card.step + 1; j <= idx; j++) {
                            additionalTime += REVIEW_STAGE_INTERVALS[j];
                          }
                          stageDate = card.nextReview + additionalTime;
                        }

                        const dateObj = new Date(stageDate);
                        const isToday = dateObj.toDateString() === new Date().toDateString();

                        return (
                          <div key={idx} className="flex flex-col items-center gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isNext) handleRating(3, card);
                              }}
                              className={`w-full h-8 border-2 border-black flex items-center justify-center transition-all ${
                                isCompleted ? 'bg-mario-emerald text-white' :
                                isNext ? 'bg-mario-yellow text-black animate-pulse' :
                                'bg-black/5 text-black/30'
                              }`}
                            >
                              {isCompleted ? <Check size={14} strokeWidth={3} /> : isNext ? <Brain size={12} /> : <span className="text-[9px] font-bold">{idx + 1}</span>}
                            </button>
                            <div className="text-[8px] font-bold text-black/50 leading-tight text-center min-h-[24px] flex flex-col justify-center">
                              {isCompleted ? (
                                <span className="text-mario-emerald font-black">تم</span>
                              ) : (
                                <div>
                                  <div>{dateObj.toLocaleDateString('ar-EG', { month: 'numeric', day: 'numeric' })}</div>
                                  {isToday && <div className="text-mario-red">{dateObj.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</div>}
                                </div>
                              )}
                            </div>

                            {/* Timer Boxes */}
                            <div className="grid grid-cols-5 gap-0.5 w-full">
                              {[1, 2, 3, 4, 5].map((mins) => {
                                const isThisTimerActive = activeTimer?.cardId === card.id && activeTimer?.stageIdx === idx && Math.ceil(activeTimer.seconds / 60) === mins;
                                const isAnyTimerActiveInThisStage = activeTimer?.cardId === card.id && activeTimer?.stageIdx === idx;

                                return (
                                  <button
                                    key={mins}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (isThisTimerActive) {
                                        setActiveTimer(null);
                                      } else {
                                        startTimer(card.id, idx, mins);
                                      }
                                    }}
                                    className={`text-[7px] font-bold py-1 border transition-all ${
                                      isThisTimerActive
                                        ? 'bg-mario-red text-white border-black animate-pulse'
                                        : isAnyTimerActiveInThisStage
                                          ? 'bg-black/5 text-black/20 border-black/10 cursor-not-allowed'
                                          : 'bg-black/5 text-black/60 border-black/20 hover:bg-mario-yellow/30'
                                    }`}
                                    disabled={isAnyTimerActiveInThisStage && !isThisTimerActive}
                                  >
                                    {isThisTimerActive
                                      ? `${Math.floor(activeTimer.seconds / 60)}:${(activeTimer.seconds % 60).toString().padStart(2, '0')}`
                                      : `${mins}د`
                                    }
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <span className={`inline-block px-3 py-1 border-2 border-black text-[9px] font-black uppercase tracking-widest ${
                      card.status === 'new' ? 'bg-mario-sky text-white' :
                      card.status === 'learning' ? 'bg-mario-yellow text-black' :
                      'bg-mario-emerald text-white'
                    }`}>
                      {card.status === 'new' ? 'جديد' : card.status === 'learning' ? 'تعلم' : 'مراجعة'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Review Mode - Question Block Style */
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6 px-2">
              <div className="bg-black px-4 py-2 text-[10px] font-black text-white scoreboard-font border-2 border-black">
                البطاقة {currentCardIndex + 1} / {reviewQueue.length}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={reviewQueue[currentCardIndex].id + (showAnswer ? '-ans' : '-q')}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="bg-mario-yellow mario-block p-8 sm:p-12 min-h-[400px] flex flex-col items-center justify-center text-center relative overflow-hidden"
              >
                {/* Decorative corner dots for Question Block */}
                <div className="absolute top-4 left-4 w-3 h-3 bg-black/20 rounded-full" />
                <div className="absolute top-4 right-4 w-3 h-3 bg-black/20 rounded-full" />
                <div className="absolute bottom-4 left-4 w-3 h-3 bg-black/20 rounded-full" />
                <div className="absolute bottom-4 right-4 w-3 h-3 bg-black/20 rounded-full" />

                {!showAnswer ? (
                  <>
                    <div className="text-2xl font-pixel text-black mb-8 animate-pulse">?</div>
                    <div className="text-2xl sm:text-3xl font-black text-black leading-tight mb-12">
                      {reviewQueue[currentCardIndex].question}
                    </div>
                    <button
                      onClick={() => setShowAnswer(true)}
                      className="mario-btn bg-black text-white px-10 py-4 font-black scoreboard-font text-xs uppercase tracking-widest"
                    >
                      إظهار الإجابة
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-[10px] font-black text-black/40 mb-6 scoreboard-font uppercase tracking-widest">تم إيجاد الإجابة!</div>
                    <div className="text-xl sm:text-2xl font-bold text-black leading-relaxed mb-8">
                      {reviewQueue[currentCardIndex].answer}
                    </div>

                    {/* Checklist in Review Mode */}
                    <div className="w-full max-w-md bg-black/5 border-2 border-black mb-10 p-4 space-y-2">
                      <div className="text-[9px] font-black text-black/50 uppercase tracking-widest mb-2 text-right scoreboard-font">خطوات فاينمان</div>
                      {reviewQueue[currentCardIndex].checklist.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => toggleChecklistItem(reviewQueue[currentCardIndex].id, idx)}
                          className="w-full flex items-center gap-3 text-right group"
                        >
                          <div className={`w-5 h-5 flex-shrink-0 border-2 border-black flex items-center justify-center transition-colors ${item.completed ? 'bg-mario-emerald' : 'bg-white'}`}>
                            {item.completed && <Check size={12} className="text-white" strokeWidth={3} />}
                          </div>
                          <span className={`text-sm font-bold text-black ${item.completed ? 'line-through opacity-40' : ''}`}>
                            {item.text}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
                      {RATING_OPTIONS.map((btn) => (
                        <button
                          key={btn.rating}
                          onClick={() => handleRating(btn.rating as any)}
                          className={`${btn.className} mario-btn py-3 font-black text-[10px] uppercase tracking-widest scoreboard-font`}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Add/Edit Card Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingId(null);
          setNewCard({ question: '', answer: '', checklist: ['', '', '', ''] });
        }}
        title={editingId ? "تعديل البطاقة" : "بطاقة جديدة"}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-black/60 uppercase tracking-widest">السؤال</label>
            <textarea
              value={newCard.question}
              onChange={(e) => setNewCard({ ...newCard, question: e.target.value })}
              className="w-full bg-white border-2 border-black p-4 text-black font-bold focus:outline-none focus:border-mario-sky min-h-[100px] transition-all"
              placeholder="ما الذي تريد تذكره؟"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-black/60 uppercase tracking-widest">الإجابة</label>
            <textarea
              value={newCard.answer}
              onChange={(e) => setNewCard({ ...newCard, answer: e.target.value })}
              className="w-full bg-white border-2 border-black p-4 text-black font-bold focus:outline-none focus:border-mario-sky min-h-[80px] transition-all"
              placeholder="اكتب الإجابة هنا..."
            />
          </div>

          {/* Checklist Inputs */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-black/60 uppercase tracking-widest">خطوات المراجعة</label>
            <div className="grid grid-cols-1 gap-2">
              {newCard.checklist.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-mario-yellow border-2 border-black text-black font-black text-[10px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const newList = [...newCard.checklist];
                      newList[idx] = e.target.value;
                      setNewCard({ ...newCard, checklist: newList });
                    }}
                    className="flex-1 bg-white border-2 border-black px-3 py-2 text-sm font-bold text-black focus:outline-none focus:border-mario-sky transition-all"
                    placeholder={`الخطوة ${idx + 1}...`}
                  />
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={addCard}
            className="mario-btn w-full bg-mario-emerald text-white py-4 font-black scoreboard-font text-sm uppercase tracking-widest"
          >
            {editingId ? "تحديث البطاقة" : "حفظ البطاقة"}
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={isMentalWarmupOpen}
        onClose={() => setIsMentalWarmupOpen(false)}
        title="تسخين ذهني"
      >
        <MentalWarmup onComplete={() => setIsMentalWarmupOpen(false)} />
      </Modal>
    </div>
  );
};

export default SpacedRepetition;
