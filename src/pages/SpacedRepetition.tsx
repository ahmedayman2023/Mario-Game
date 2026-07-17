import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Check, RotateCcw, Calendar, Brain, Sparkles, Star, Trophy, Coins, Pencil } from 'lucide-react';
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
      // Play a simple beep if possible, or just the toast
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

    // Defined intervals in milliseconds
    const intervals = [
      12 * 60 * 60 * 1000,      // 1st Review: 12 hours
      2 * 24 * 60 * 60 * 1000,  // 2nd Review: 2 days
      7 * 24 * 60 * 60 * 1000,  // 3rd Review: 1 week
      30 * 24 * 60 * 60 * 1000, // 4th Review: 1 month
      90 * 24 * 60 * 60 * 1000, // 5th Review: 3 months
      180 * 24 * 60 * 60 * 1000, // 6th Review: 6 months (Testing between topics)
      365 * 24 * 60 * 60 * 1000 // 7th Review: 1 year (Test previous with current)
    ];

    let nextReviewDelay = 0;

    if (rating === 1) { // Again
      nextStep = 0;
      newStatus = 'learning';
      nextReviewDelay = 0; // Review again immediately (due now)
    } else {
      // Success (Hard, Good, Easy)
      const baseInterval = intervals[Math.min(nextStep, intervals.length - 1)];
      
      if (nextStep >= intervals.length) {
        nextReviewDelay = intervals[intervals.length - 1] * Math.pow(2, nextStep - (intervals.length - 1));
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
    <div className="p-4 sm:p-8 max-w-4xl mx-auto min-h-screen font-cairo">
      {/* Header - Mario Style */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-6 bg-[#5C94FC] p-6 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-4">
          <div className="bg-[#FBD000] p-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-bounce">
            <Star size={32} className="text-black fill-black" />
          </div>
          <div>
            <h1 className="text-2xl font-pixel text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">SUPER SRS</h1>
            <p className="text-[10px] font-pixel text-black/60 mt-2">WORLD 1-1</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#E52521] hover:bg-[#ff3e3e] text-white p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
        >
          <Plus size={24} strokeWidth={4} />
        </button>
      </div>

      {!isReviewing ? (
        <div className="space-y-12">
          {/* Stats Summary - Coin Blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-[#FBD000] p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center text-center relative overflow-hidden group">
              <div className="absolute top-2 right-2 opacity-20 group-hover:scale-125 transition-transform">
                <Coins size={40} className="text-black" />
              </div>
              <div className="text-3xl font-pixel text-black mb-2">{cards.length}</div>
              <div className="text-[8px] font-pixel text-black/70 leading-relaxed uppercase">إجمالي البطاقات</div>
            </div>
            
            <div className="bg-[#E52521] p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center text-center relative overflow-hidden group">
              <div className="absolute top-2 right-2 opacity-20 group-hover:scale-125 transition-transform">
                <Calendar size={40} className="text-white" />
              </div>
              <div className="text-3xl font-pixel text-white mb-2">{dueCount}</div>
              <div className="text-[8px] font-pixel text-white/70 leading-relaxed uppercase">مستحق للمراجعة</div>
            </div>

            <div className="bg-[#43B047] p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center text-center relative overflow-hidden group">
              <div className="absolute top-2 right-2 opacity-20 group-hover:scale-125 transition-transform">
                <Trophy size={40} className="text-white" />
              </div>
              <div className="text-3xl font-pixel text-white mb-2">
                {cards.filter(c => c.status === 'reviewing').length}
              </div>
              <div className="text-[8px] font-pixel text-white/70 leading-relaxed uppercase">بطاقات متقنة</div>
            </div>
          </div>

          {/* Review Schedule Table - Mario Style */}
          <div className="bg-[#8B4513] p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-xs font-pixel text-white uppercase mb-6 flex items-center gap-3">
              <Sparkles size={16} className="text-[#FBD000]" />
              جدول المراجعة (POWER-UP SCHEDULE)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
              {[
                { label: 'المراجعة 1', time: '12 ساعة', color: 'bg-[#5C94FC]' },
                { label: 'المراجعة 2', time: 'يومين', color: 'bg-[#FBD000]' },
                { label: 'المراجعة 3', time: 'أسبوع', color: 'bg-[#43B047]' },
                { label: 'المراجعة 4', time: 'شهر', color: 'bg-[#E52521]' },
                { label: 'المراجعة 5', time: '3 أشهر', color: 'bg-[#9C27B0]' },
                { label: 'اختبار مواضيع', time: '6 أشهر', color: 'bg-[#FF9800]' },
                { label: 'ربط المواضيع', time: 'سنة', color: 'bg-[#00BCD4]' },
              ].map((item, idx) => (
                <div key={idx} className={`${item.color} p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center`}>
                  <div className="text-[8px] font-pixel text-black/60 mb-2 uppercase">{item.label}</div>
                  <div className="text-xs font-bold text-black uppercase">{item.time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Timers Bar - Global */}
          <div className="mb-8 bg-black/20 p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-[8px] font-pixel text-slate-500 uppercase tracking-widest mb-4">مؤقتات سريعة (دقائق)</div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {INTERVALS.map((mins, tIdx) => (
                <button
                  key={tIdx}
                  onClick={() => {
                    // Start a general timer or just show a toast for now if no card is selected
                    toast({
                      title: `مؤقت ${mins} دقائق`,
                      description: "تم اختيار المؤقت السريع.",
                    });
                  }}
                  className="flex-shrink-0 min-w-[48px] h-12 bg-[#FBD000] text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-pixel text-xs flex items-center justify-center active:shadow-none active:translate-x-1 active:translate-y-1 hover:bg-[#ffe04d]"
                >
                  {mins}
                </button>
              ))}
            </div>
          </div>

          {/* Start Button - Big Pipe Style */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setIsMentalWarmupOpen(true)}
              className="flex-1 py-8 bg-[#5C94FC] hover:bg-[#7ba6ff] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-pixel text-xl transition-all flex items-center justify-center gap-4 active:shadow-none active:translate-x-2 active:translate-y-2 text-white"
            >
              <Sparkles size={32} strokeWidth={3} className="text-[#FBD000]" />
              تسخين ذهني
            </button>
            <button
              onClick={startReview}
              disabled={dueCount === 0}
              className={`flex-[2] py-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-pixel text-xl transition-all flex items-center justify-center gap-4 active:shadow-none active:translate-x-2 active:translate-y-2 ${
                dueCount > 0 
                  ? 'bg-[#43B047] hover:bg-[#4ed453] text-white' 
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed border-slate-700'
              }`}
            >
              <Brain size={32} strokeWidth={3} />
              ابدأ المغامرة
            </button>
          </div>

          {/* Cards List - Brick Style */}
          <div className="space-y-6">
            <h2 className="text-xs font-pixel text-white uppercase flex items-center gap-3">
              <div className="w-4 h-4 bg-[#8B4513] border-2 border-black" />
              قائمة البطاقات
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {cards.length === 0 ? (
                <div className="text-center py-16 bg-black/20 border-4 border-dashed border-white/10 rounded-3xl">
                  <p className="text-slate-500 font-pixel text-[10px]">لا توجد بطاقات. ابحث عن صندوق الحظ!</p>
                </div>
              ) : (
                cards.map(card => (
                  <div key={card.id} className="bg-[#8B4513] p-5 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between group hover:-translate-y-1 transition-transform">
                    <div className="min-w-0 flex-1">
                      <div className="text-white font-bold truncate text-lg mb-4">{card.question}</div>
                      
                      {/* Review Stages Timeline */}
                      <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 mb-4">
                        {[0, 1, 2, 3, 4, 5, 6].map((idx) => {
                          const intervals = [12 * 60 * 60 * 1000, 2 * 24 * 60 * 60 * 1000, 7 * 24 * 60 * 60 * 1000, 30 * 24 * 60 * 60 * 1000, 90 * 24 * 60 * 60 * 1000, 180 * 24 * 60 * 60 * 1000, 365 * 24 * 60 * 60 * 1000];
                          const isCompleted = card.step > idx;
                          const isNext = card.step === idx;
                          
                          // Calculate date for this stage
                          let stageDate = 0;
                          if (isCompleted) {
                            stageDate = 0; // Placeholder for "Done"
                          } else if (isNext) {
                            stageDate = card.nextReview;
                          } else {
                            // Future stage: nextReview + sum of remaining intervals
                            let additionalTime = 0;
                            for (let j = card.step + 1; j <= idx; j++) {
                              additionalTime += intervals[j];
                            }
                            stageDate = card.nextReview + additionalTime;
                          }

                          const dateObj = new Date(stageDate);
                          const isToday = dateObj.toDateString() === new Date().toDateString();

                          return (
                            <div key={idx} className="flex flex-col items-center gap-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isNext) handleRating(3, card);
                                }}
                                className={`w-full h-8 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center active:shadow-none active:translate-x-1 active:translate-y-1 ${
                                  isCompleted ? 'bg-[#43B047]' : 
                                  isNext ? 'bg-[#FBD000] animate-pulse' : 'bg-white/20'
                                }`}
                              >
                                {isCompleted && <Check size={16} className="text-white" strokeWidth={4} />}
                                {isNext && <Brain size={14} className="text-black" />}
                              </button>
                              <div className="text-[15px] font-pixel text-white/70 leading-tight text-center min-h-[60px] flex flex-col justify-center">
                                {isCompleted ? (
                                  <span className="text-[#43B047] text-[32px]">تم</span>
                                ) : (
                                  <div className="text-[32px]">
                                    <div>{dateObj.toLocaleDateString('ar-EG', { month: 'numeric', day: 'numeric' })}</div>
                                    {isToday && <div className="text-[#FBD000] text-[15px]">{dateObj.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</div>}
                                  </div>
                                )}
                              </div>

                              {/* Timer Boxes */}
                              <div className="grid grid-cols-5 gap-1 mt-2 w-full">
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
                                      className={`text-[7px] font-pixel p-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:shadow-none active:translate-x-0.5 active:translate-y-0.5 ${
                                        isThisTimerActive 
                                          ? 'bg-[#E52521] text-white animate-pulse' 
                                          : isAnyTimerActiveInThisStage
                                            ? 'bg-white/10 text-white/30 cursor-not-allowed'
                                            : 'bg-[#FBD000] text-black hover:bg-[#ffe04d]'
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

                      <div className="text-[8px] font-pixel text-white/50 flex items-center gap-3">
                        <span className={`px-2 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                          card.status === 'new' ? 'bg-[#5C94FC] text-white' :
                          card.status === 'learning' ? 'bg-[#FBD000] text-black' :
                          'bg-[#43B047] text-white'
                        }`}>
                          {card.status === 'new' ? 'جديد' : card.status === 'learning' ? 'تعلم' : 'مراجعة'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => editCard(card)}
                        className="text-white/30 hover:text-[#FBD000] p-3 transition-colors"
                      >
                        <Pencil size={24} />
                      </button>
                      <button 
                        onClick={() => deleteCard(card.id)}
                        className="text-white/30 hover:text-[#E52521] p-3 transition-colors"
                      >
                        <Trash2 size={24} />
                      </button>
                    </div>
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
            <div className="flex justify-between items-center mb-8 px-4 font-pixel text-[10px] text-white">
              <div className="bg-black/40 px-4 py-2 border-2 border-white/20">
                CARD: {currentCardIndex + 1} / {reviewQueue.length}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={reviewQueue[currentCardIndex].id + (showAnswer ? '-ans' : '-q')}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="bg-[#FBD000] p-12 border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] min-h-[400px] flex flex-col items-center justify-center text-center relative overflow-hidden"
              >
                {/* Decorative dots for Question Block */}
                <div className="absolute top-4 left-4 w-4 h-4 bg-black/20 rounded-full" />
                <div className="absolute top-4 right-4 w-4 h-4 bg-black/20 rounded-full" />
                <div className="absolute bottom-4 left-4 w-4 h-4 bg-black/20 rounded-full" />
                <div className="absolute bottom-4 right-4 w-4 h-4 bg-black/20 rounded-full" />

                {!showAnswer ? (
                  <>
                    <div className="text-xl font-pixel text-black mb-8 animate-pulse">?</div>
                    <div className="text-3xl font-black text-black leading-tight mb-12">
                      {reviewQueue[currentCardIndex].question}
                    </div>
                    <button
                      onClick={() => setShowAnswer(true)}
                      className="bg-black text-white px-10 py-4 border-4 border-white/20 font-pixel text-xs hover:scale-105 transition-transform"
                    >
                      إظهار الإجابة
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-[10px] font-pixel text-black/40 mb-6">ANSWER FOUND!</div>
                    <div className="text-2xl font-bold text-black leading-relaxed mb-8">
                      {reviewQueue[currentCardIndex].answer}
                    </div>

                    {/* Checklist in Review Mode */}
                    <div className="w-full max-w-md bg-black/5 p-4 border-4 border-black mb-12 space-y-3">
                      <div className="text-[8px] font-pixel text-black/40 mb-2 uppercase text-right">خطوات فاينمان (CHECKLIST)</div>
                      {reviewQueue[currentCardIndex].checklist.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => toggleChecklistItem(reviewQueue[currentCardIndex].id, idx)}
                          className="w-full flex items-center gap-3 text-right group"
                        >
                          <div className={`w-6 h-6 border-4 border-black flex-shrink-0 transition-colors ${item.completed ? 'bg-[#43B047]' : 'bg-white'}`}>
                            {item.completed && <Check size={14} className="text-white" />}
                          </div>
                          <span className={`text-sm font-bold text-black ${item.completed ? 'line-through opacity-40' : ''}`}>
                            {item.text}
                          </span>
                        </button>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                      {[
                        { label: 'مرة أخرى', rating: 1, color: 'bg-[#E52521]' },
                        { label: 'صعب', rating: 2, color: 'bg-[#FBD000] text-black' },
                        { label: 'جيد', rating: 3, color: 'bg-[#5C94FC]' },
                        { label: 'سهل', rating: 4, color: 'bg-[#43B047]' },
                      ].map((btn) => (
                        <button
                          key={btn.rating}
                          onClick={() => handleRating(btn.rating as any)}
                          className={`${btn.color} border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 text-white py-4 font-pixel text-[8px] uppercase transition-all`}
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

      {/* Add Card Modal - Mario Style */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingId(null);
          setNewCard({ question: '', answer: '', checklist: ['', '', '', ''] });
        }}
        title={editingId ? "EDIT POWER-UP" : "NEW POWER-UP"}
      >
        <div className="space-y-8 p-4 bg-[#5C94FC] border-4 border-black">
          <div className="space-y-3">
            <label className="text-[10px] font-pixel text-white uppercase">السؤال (INPUT)</label>
            <textarea
              value={newCard.question}
              onChange={(e) => setNewCard({ ...newCard, question: e.target.value })}
              className="w-full bg-white border-4 border-black p-4 text-black font-bold focus:ring-0 outline-none min-h-[120px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              placeholder="ما الذي تريد تذكره؟"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-pixel text-white uppercase">الإجابة (OUTPUT)</label>
            <textarea
              value={newCard.answer}
              onChange={(e) => setNewCard({ ...newCard, answer: e.target.value })}
              className="w-full bg-white border-4 border-black p-4 text-black font-bold focus:ring-0 outline-none min-h-[100px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              placeholder="اكتب الإجابة هنا..."
            />
          </div>

          {/* Checklist Inputs */}
          <div className="space-y-4">
            <label className="text-[10px] font-pixel text-white uppercase">خطوات المراجعة (CHECKLIST)</label>
            <div className="grid grid-cols-1 gap-3">
              {newCard.checklist.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-black text-white font-pixel text-[10px] flex items-center justify-center border-2 border-white/20">
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
                    className="flex-1 bg-white border-4 border-black p-2 text-sm font-bold focus:ring-0 outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    placeholder={`الخطوة ${idx + 1}...`}
                  />
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={addCard}
            className="w-full bg-[#43B047] hover:bg-[#4ed453] text-white py-5 border-4 border-black font-pixel text-sm transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
          >
            {editingId ? "تحديث البطاقة" : "حفظ البطاقة"}
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={isMentalWarmupOpen}
        onClose={() => setIsMentalWarmupOpen(false)}
        title="BONUS STAGE: MENTAL WARMUP"
      >
        <MentalWarmup onComplete={() => setIsMentalWarmupOpen(false)} />
      </Modal>
    </div>
  );
};

export default SpacedRepetition;