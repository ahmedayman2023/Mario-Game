import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Check, X, RotateCcw, Calendar, Brain, Sparkles, Star, Trophy, Coins } from 'lucide-react';
import { useToast } from "@/src/components/ui/use-toast";
import Modal from "../components/ui/Modal";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  nextReview: number; // timestamp
  interval: number; // in days
  easeFactor: number;
  status: 'new' | 'learning' | 'reviewing';
}

const STORAGE_KEY = 'spaced_repetition_cards';

const SpacedRepetition = () => {
  const { toast } = useToast();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCard, setNewCard] = useState({ question: '', answer: '' });
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewQueue, setReviewQueue] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

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

    const card: Flashcard = {
      id: Date.now().toString(),
      question: newCard.question,
      answer: newCard.answer,
      nextReview: Date.now(),
      interval: 0,
      easeFactor: 2.5,
      status: 'new'
    };

    setCards([...cards, card]);
    setNewCard({ question: '', answer: '' });
    setIsAddModalOpen(false);
    toast({
      title: "تمت الإضافة",
      description: "تمت إضافة البطاقة بنجاح"
    });
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

  const handleRating = (rating: 1 | 2 | 3 | 4) => {
    const currentCard = reviewQueue[currentCardIndex];
    let newInterval = currentCard.interval;
    let newEaseFactor = currentCard.easeFactor;
    let newStatus = currentCard.status;

    // Simplified SuperMemo-2 algorithm
    if (rating === 1) { // Again
      newInterval = 0;
      newStatus = 'learning';
    } else {
      if (currentCard.interval === 0) {
        newInterval = 1;
      } else if (currentCard.interval === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.round(currentCard.interval * currentCard.easeFactor);
      }
      
      // Update ease factor (simplified)
      newEaseFactor = Math.max(1.3, currentCard.easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02)));
      newStatus = 'reviewing';
    }

    const updatedCard: Flashcard = {
      ...currentCard,
      interval: newInterval,
      easeFactor: newEaseFactor,
      status: newStatus,
      nextReview: Date.now() + (newInterval * 24 * 60 * 60 * 1000) || Date.now() // if interval 0, review again soon
    };

    setCards(cards.map(c => c.id === updatedCard.id ? updatedCard : c));

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
  };

  const dueCount = cards.filter(c => c.nextReview <= Date.now()).length;

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto min-h-screen">
      {/* Header - Stadium Style */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-6 bg-stadium-blue/80 p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="bg-amber-500/20 p-4 rounded-2xl border border-amber-500/30">
            <Star size={32} className="text-amber-400 fill-amber-400/20" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight scoreboard-font">نظام المراجعة الذكي</h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">Spaced Repetition System</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-2xl transition-all shadow-lg shadow-emerald-900/20 group"
        >
          <Plus size={24} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {!isReviewing ? (
        <div className="space-y-12">
          {/* Stats Summary - Stadium Style */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 shadow-xl flex flex-col items-center text-center group hover:border-indigo-500/30 transition-colors">
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Coins size={24} className="text-indigo-400" />
              </div>
              <div className="text-3xl font-black text-white scoreboard-font mb-1">{cards.length}</div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">إجمالي البطاقات</div>
            </div>
            
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 shadow-xl flex flex-col items-center text-center group hover:border-amber-500/30 transition-colors">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Calendar size={24} className="text-amber-400" />
              </div>
              <div className="text-3xl font-black text-white scoreboard-font mb-1">{dueCount}</div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">مستحق للمراجعة</div>
            </div>

            <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 shadow-xl flex flex-col items-center text-center group hover:border-emerald-500/30 transition-colors">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Trophy size={24} className="text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-white scoreboard-font mb-1">
                {cards.filter(c => c.status === 'reviewing').length}
              </div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">بطاقات متقنة</div>
            </div>
          </div>

          {/* Start Button - Stadium Style */}
          <button
            onClick={startReview}
            disabled={dueCount === 0}
            className={`w-full py-6 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-4 shadow-xl scoreboard-font ${
              dueCount > 0 
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20' 
                : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-white/5'
            }`}
          >
            <Brain size={24} strokeWidth={3} />
            ابدأ جلسة المراجعة
          </button>

          {/* Cards List - Stadium Style */}
          <div className="space-y-6">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-3 scoreboard-font">
              <div className="w-2 h-2 bg-indigo-500 rounded-full" />
              قائمة البطاقات
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {cards.length === 0 ? (
                <div className="text-center py-16 bg-black/20 border border-dashed border-white/10 rounded-3xl">
                  <p className="text-slate-500 font-bold text-sm">لا توجد بطاقات حالياً. ابدأ بإضافة أول بطاقة!</p>
                </div>
              ) : (
                cards.map(card => (
                  <div key={card.id} className="bg-slate-900/40 p-5 rounded-2xl border border-white/5 flex items-center justify-between group hover:bg-slate-900/60 transition-all">
                    <div className="min-w-0 flex-1">
                      <div className="text-white font-bold truncate text-lg">{card.question}</div>
                      <div className="text-[10px] font-black text-slate-500 mt-2 flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                          card.status === 'new' ? 'bg-indigo-500/20 text-indigo-400' :
                          card.status === 'learning' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {card.status === 'new' ? 'جديد' : card.status === 'learning' ? 'تعلم' : 'مراجعة'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          المراجعة القادمة: {new Date(card.nextReview).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteCard(card.id)}
                      className="text-slate-600 hover:text-mario-red p-3 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Review Mode - Stadium Style */
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-full max-w-2xl">
            <div className="flex justify-between items-center mb-8 px-4">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest scoreboard-font">
                البطاقة: {currentCardIndex + 1} / {reviewQueue.length}
              </div>
              <button 
                onClick={() => setIsReviewing(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X size={24} strokeWidth={3} />
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={reviewQueue[currentCardIndex].id + (showAnswer ? '-ans' : '-q')}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-stadium-blue/80 p-12 rounded-[2.5rem] border border-white/10 shadow-2xl backdrop-blur-xl min-h-[400px] flex flex-col items-center justify-center text-center relative overflow-hidden"
              >
                {!showAnswer ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-8">
                      <Brain size={32} className="text-indigo-400" />
                    </div>
                    <div className="text-3xl font-black text-white leading-tight mb-12 px-4">
                      {reviewQueue[currentCardIndex].question}
                    </div>
                    <button
                      onClick={() => setShowAnswer(true)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-2xl font-black transition-all shadow-lg shadow-indigo-900/20 scoreboard-font"
                    >
                      إظهار الإجابة
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-6 scoreboard-font">تم كشف الإجابة</div>
                    <div className="text-2xl font-bold text-white leading-relaxed mb-12 px-4">
                      {reviewQueue[currentCardIndex].answer}
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                      {[
                        { label: 'مرة أخرى', rating: 1, color: 'bg-mario-red/20 text-mario-red hover:bg-mario-red hover:text-white' },
                        { label: 'صعب', rating: 2, color: 'bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-white' },
                        { label: 'جيد', rating: 3, color: 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white' },
                        { label: 'سهل', rating: 4, color: 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white' },
                      ].map((btn) => (
                        <button
                          key={btn.rating}
                          onClick={() => handleRating(btn.rating as any)}
                          className={`${btn.color} py-4 rounded-xl font-black text-[10px] uppercase transition-all border border-white/5 scoreboard-font`}
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

      {/* Add Card Modal - Stadium Style */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="إضافة بطاقة جديدة"
      >
        <div className="space-y-8 p-4">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest scoreboard-font">السؤال</label>
            <textarea
              value={newCard.question}
              onChange={(e) => setNewCard({ ...newCard, question: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none min-h-[120px] transition-all"
              placeholder="ما الذي تريد تذكره؟"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest scoreboard-font">الإجابة</label>
            <textarea
              value={newCard.answer}
              onChange={(e) => setNewCard({ ...newCard, answer: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none min-h-[120px] transition-all"
              placeholder="اكتب الإجابة هنا..."
            />
          </div>
          <button
            onClick={addCard}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-2xl font-black transition-all shadow-lg shadow-emerald-900/20 scoreboard-font"
          >
            حفظ البطاقة
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default SpacedRepetition;
