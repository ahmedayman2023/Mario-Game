import React, { memo } from 'react';
import { BookOpen, Save } from 'lucide-react';

interface StudyTopicInputProps {
  topic: string;
  onTopicChange: (topic: string) => void;
  onTopicSave: () => void;
  isActive: boolean;
  isPaused: boolean;
}

const StudyTopicInput = memo(function StudyTopicInput({ 
  topic, 
  onTopicChange, 
  onTopicSave, 
  isActive, 
  isPaused 
}: StudyTopicInputProps) {
  return (
    <div className="relative group">
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-broadcast-yellow transition-colors">
        <BookOpen size={18} />
      </div>
      <input
        type="text"
        value={topic || ""}
        onChange={(e) => onTopicChange(e.target.value)}
        placeholder="ما هي مهمتك اليوم؟"
        className="w-full bg-white/5 border border-white/10 py-4 pr-12 pl-14 text-sm font-bold text-white placeholder:text-slate-500 focus:outline-none focus:border-broadcast-yellow/50 rounded-xl transition-all"
        disabled={isActive && !isPaused}
      />
      <button
        onClick={onTopicSave}
        className="absolute left-2 top-1/2 -translate-y-1/2 p-2.5 bg-mario-emerald text-black rounded-lg shadow-md hover:brightness-110 active:scale-95 transition-all"
      >
        <Save size={14} />
      </button>
    </div>
  );
});

export default StudyTopicInput;
