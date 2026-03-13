import React from 'react';
import { BookOpen, Save } from 'lucide-react';

export default function StudyTopicInput({ topic, onTopicChange, onTopicSave, isActive, isPaused }: any) {
  return (
    <div className="mb-8 relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50 group-focus-within:text-emerald-500 transition-colors">
        <BookOpen size={20} />
      </div>
      <input 
        type="text"
        value={topic}
        onChange={(e) => onTopicChange(e.target.value)}
        placeholder="What are we studying today?"
        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-16 text-lg font-medium text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all"
        disabled={isActive && !isPaused}
      />
      <button 
        onClick={onTopicSave}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-emerald-600/20 text-emerald-500 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"
      >
        <Save size={18} />
      </button>
    </div>
  );
}
