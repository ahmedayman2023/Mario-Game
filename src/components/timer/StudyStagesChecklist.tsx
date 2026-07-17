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
          <Brain size={14} className="text-broadcast-yellow" />
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] scoreboard-font">مراحل المذاكرة السبعة</h3>
        </div>
        <button 
          onClick={resetStages}
          className="flex items-center gap-1 text-[9px] font-bold bg-white/5 text-slate-400 px-2 py-1 rounded hover:bg-white/10 transition-colors active:scale-95"
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
            className={`flex items-center gap-3 p-2 rounded-lg border transition-all cursor-pointer ${
              completedStages[idx] 
                ? 'bg-mario-emerald/10 border-mario-emerald/30' 
                : 'bg-white/5 border-white/5 hover:border-white/20'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
              completedStages[idx]
                ? 'bg-mario-emerald text-black shadow-[0_0_10px_rgba(46,204,113,0.4)]'
                : 'bg-mario-emerald/20 text-mario-emerald'
            }`}>
              {completedStages[idx] ? <Check size={12} strokeWidth={4} /> : idx + 1}
            </div>
            <span className={`text-[10px] font-bold leading-relaxed transition-colors ${
              completedStages[idx] ? 'text-mario-emerald/70 line-through' : 'text-white'
            }`}>
              {stage}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
