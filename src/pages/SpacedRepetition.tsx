import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Check, RotateCcw, Calendar, Brain, Sparkles, Star, Trophy, Coins } from 'lucide-react';
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

          {/* Start Button - Big Pipe Style */}
          <button
            onClick={startReview}
            disabled={dueCount === 0}
            className={`w-full py-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-pixel text-xl transition-all flex items-center justify-center gap-4 active:shadow-none active:translate-x-2 active:translate-y-2 ${
              dueCount > 0 
                ? 'bg-[#43B047] hover:bg-[#4ed453] text-white' 
                : 'bg-slate-800 text-slate-600 cursor-not-allowed border-slate-700'
            }`}
          >
            <Brain size={32} strokeWidth={3} />
            ابدأ المغامرة
          </button>

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
                      <div className="text-white font-bold truncate text-lg">{card.question}</div>
                      <div className="text-[8px] font-pixel text-white/50 mt-2 flex items-center gap-3">
                        <span className={`px-2 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                          card.status === 'new' ? 'bg-[#5C94FC] text-white' :
                          card.status === 'learning' ? 'bg-[#FBD000] text-black' :
                          'bg-[#43B047] text-white'
                        }`}>
                          {card.status === 'new' ? 'جديد' : card.status === 'learning' ? 'تعلم' : 'مراجعة'}
                        </span>
                        <span>NEXT: {new Date(card.nextReview).toLocaleDateString('ar-EG')}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteCard(card.id)}
                      className="text-white/30 hover:text-[#E52521] p-3 transition-colors"
                    >
                      <Trash2 size={24} />
                    </button>
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
                    <div className="text-2xl font-bold text-black leading-relaxed mb-12">
                      {reviewQueue[currentCardIndex].answer}
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
        onClose={() => setIsAddModalOpen(false)}
        title="NEW POWER-UP"
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
              className="w-full bg-white border-4 border-black p-4 text-black font-bold focus:ring-0 outline-none min-h-[120px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              placeholder="اكتب الإجابة هنا..."
            />
          </div>
          <button
            onClick={addCard}
            className="w-full bg-[#43B047] hover:bg-[#4ed453] text-white py-5 border-4 border-black font-pixel text-sm transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
          >
            حفظ البطاقة
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default SpacedRepetition;