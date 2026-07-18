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
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40">
        <BookOpen size={18} />
      </div>
      <input
        type="text"
        value={topic || ""}
        onChange={(e) => onTopicChange(e.target.value)}
        placeholder="ما هي مهمتك اليوم؟"
        className="w-full bg-panel-soft border-2 border-white/20 py-4 pr-12 pl-14 text-sm font-bold text-white placeholder:text-white/30 focus:outline-none focus:border-mario-sky transition-all"
        disabled={isActive && !isPaused}
      />
      <button
        onClick={onTopicSave}
        className="mario-btn absolute left-2 top-1/2 -translate-y-1/2 p-2.5 bg-mario-emerald text-white active:scale-95"
      >
        <Save size={14} />
      </button>
    </div>
  );
});

export default StudyTopicInput;
