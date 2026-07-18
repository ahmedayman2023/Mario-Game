import React, { useState, useEffect } from 'react';
import { Check, RotateCcw, Brain } from 'lucide-react';

const STORAGE_KEY = 'study_stages_checklist';

const STAGES = [
  "الاستماع فقط بدون تركيز (يفضل عند النوم)",
  "مشاهدة بدون توقف وبدون كتابة (فقط فهم)",
  "المشاهدة بدون توقف مع الكتابة",
  "المشاهدة والتوقف والكتابة",
  "محاولة الشرح أو تسميع المعلومة",
  "الكتابة بدون مشاهدة",
  "ربط المواضيع ببعضها (اختبار شامل)"
];

export default function StudyStagesChecklist() {
  const [completedStages, setCompletedStages] = useState<boolean[]>(Array(7).fill(false));

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setCompletedStages(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completedStages));
  }, [completedStages]);

  const toggleStage = (index: number) => {
    const newStages = [...completedStages];
    newStages[index] = !newStages[index];
    setCompletedStages(newStages);
  };

  const resetStages = () => {
    setCompletedStages(Array(7).fill(false));
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain size={14} className="text-mario-sky" />
          <h3 className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em] scoreboard-font">مراحل المذاكرة السبعة</h3>
        </div>
        <button
          onClick={resetStages}
          className="mario-btn flex items-center gap-1 text-[9px] font-black bg-panel text-white px-2 py-1"
          title="إعادة تعيين المراحل"
        >
          <RotateCcw size={10} />
          تصفير
        </button>
      </div>
      <div className="space-y-2 mb-4">
        {STAGES.map((stage, idx) => (
          <div
            key={idx}
            onClick={() => toggleStage(idx)}
            className={`flex items-center gap-3 p-2.5 border-2 border-black cursor-pointer transition-colors ${
              completedStages[idx]
                ? 'bg-mario-emerald/20'
                : 'bg-panel hover:bg-mario-sky/10'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 border-2 border-black transition-colors ${
              completedStages[idx]
                ? 'bg-mario-emerald text-white'
                : 'bg-mario-yellow text-black'
            }`}>
              {completedStages[idx] ? <Check size={12} strokeWidth={4} /> : idx + 1}
            </div>
            <span className={`text-[10px] font-bold leading-relaxed transition-colors ${
              completedStages[idx] ? 'text-white/40 line-through' : 'text-white'
            }`}>
              {stage}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
