import React, { useState, useEffect } from 'react';
import { Check, Video, RotateCcw } from 'lucide-react';

const STORAGE_KEY = 'smart_study_videos';

const defaultVideos = Array.from({ length: 10 }, (_, i) => ({
  id: (i + 1).toString(),
  title: `الفيديو ${i + 1}`,
  completed: false
}));

export default function SmartStudyChecklist() {
  const [videos, setVideos] = useState<{ id: string; title: string; completed: boolean }[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        let parsed = JSON.parse(saved);
        if (parsed.length < 10) {
          const missing = defaultVideos.slice(parsed.length);
          parsed = [...parsed, ...missing];
        }
        return parsed.slice(0, 10); // Ensure exactly 10
      } catch (e) {
        return defaultVideos;
      }
    }
    return defaultVideos;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
  }, [videos]);

  const toggleVideo = (id: string) => {
    setVideos(videos.map(v => v.id === id ? { ...v, completed: !v.completed } : v));
  };

  const updateTitle = (id: string, title: string) => {
    setVideos(videos.map(v => v.id === id ? { ...v, title } : v));
  };

  const resetChecklist = () => {
    setVideos(videos.map(v => ({ ...v, completed: false })));
  };

  return (
    <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg mt-4 shadow-inner">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Video size={14} className="text-amber-400" />
          <h4 className="text-[10px] font-black text-amber-200 uppercase tracking-widest">قائمة الفيديوهات (الربط الذهني)</h4>
        </div>
        <button 
          onClick={resetChecklist}
          className="flex items-center gap-1 text-[9px] font-bold bg-amber-500/20 text-amber-300 px-2 py-1.5 rounded hover:bg-amber-500/40 transition-colors active:scale-95"
          title="إعادة تعيين للمرحلة التالية"
        >
          <RotateCcw size={10} />
          تصفير للمرحلة التالية
        </button>
      </div>
      
      <p className="text-[9px] text-amber-200/70 mb-4 leading-relaxed font-bold">
        💡 اكتب أسماء 10 فيديوهات، ومررها جميعاً عبر المرحلة الحالية قبل الانتقال للمرحلة التالية. يمكنك النقر على الاسم لتعديله.
      </p>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
        {videos.map((video, idx) => (
          <div key={video.id} className="flex items-center gap-3 bg-black/20 p-2 rounded-md border border-amber-500/10 focus-within:border-amber-500/30 transition-colors">
            <button 
              onClick={() => toggleVideo(video.id)}
              className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border-2 transition-all ${
                video.completed 
                  ? 'bg-mario-emerald border-mario-emerald text-black scale-110' 
                  : 'border-amber-500/30 hover:border-amber-500/60 text-transparent'
              }`}
            >
              <Check size={12} strokeWidth={4} />
            </button>
            <input 
              type="text"
              value={video.title}
              onChange={(e) => updateTitle(video.id, e.target.value)}
              placeholder={`اسم الفيديو ${idx + 1}`}
              className={`flex-1 bg-transparent border-none outline-none text-[11px] font-bold transition-all px-2 py-1 rounded focus:bg-black/40 focus:ring-1 focus:ring-amber-500/50 focus:no-underline focus:text-amber-100 placeholder:text-amber-500/30 ${
                video.completed ? 'text-amber-200/40 line-through' : 'text-amber-100 hover:bg-white/5'
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
