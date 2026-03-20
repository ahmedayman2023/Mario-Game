import React, { memo } from 'react';
import { Sparkles, Save } from 'lucide-react';
import { motion } from 'motion/react';

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
    <div className="bg-stadium-blue/80 border border-white/10 rounded-lg p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={14} className="text-broadcast-yellow" />
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] scoreboard-font">التركيز الحالي</h3>
      </div>
      <div className="flex gap-2">
        <input 
          type="text" 
          placeholder="ما الذي تدرسه الآن؟" 
          value={topic}
          onChange={(e) => onTopicChange(e.target.value)}
          disabled={isActive && !isPaused}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-broadcast-yellow/50 transition-all disabled:opacity-50"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onTopicSave}
          className="bg-broadcast-yellow text-black p-3 rounded-xl font-black hover:bg-amber-400 transition-colors"
        >
          <Save size={20} />
        </motion.button>
      </div>
    </div>
  );
});

export default StudyTopicInput;
