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
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500/50 group-focus-within:text-emerald-500 transition-colors">
        <BookOpen size={20} />
      </div>
      <input 
        type="text"
        value={topic || ""}
        onChange={(e) => onTopicChange(e.target.value)}
        placeholder="ماذا سندرس اليوم؟"
        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pr-12 pl-16 text-lg font-medium text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all"
        disabled={isActive && !isPaused}
      />
      <button 
        onClick={onTopicSave}
        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-emerald-600/20 text-emerald-500 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"
      >
        <Save size={18} />
      </button>
    </div>
  );
});

export default StudyTopicInput;
