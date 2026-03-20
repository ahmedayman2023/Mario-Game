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
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-accent transition-colors">
        <BookOpen size={18} />
      </div>
      <input 
        type="text"
        value={topic || ""}
        onChange={(e) => onTopicChange(e.target.value)}
        placeholder="ما هي مهمتك اليوم؟"
        className="w-full bg-paper border ink-border py-4 pr-12 pl-14 text-sm font-bold text-ink placeholder:text-slate-300 focus:outline-none focus:border-accent rounded-lg transition-all"
        disabled={isActive && !isPaused}
      />
      <button 
        onClick={onTopicSave}
        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-md shadow-md hover:bg-primary-hover active:scale-95 transition-all"
      >
        <Save size={14} />
      </button>
    </div>
  );
});

export default StudyTopicInput;
