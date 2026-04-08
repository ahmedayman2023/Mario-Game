import React, { useState, useEffect } from 'react';
import { Check, Video, RotateCcw } from 'lucide-react';

const STORAGE_KEY = 'smart_study_videos';

export default function SmartStudyChecklist() {
  const [videos, setVideos] = useState<{ id: string; title: string; completed: boolean }[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setVideos(JSON.parse(saved));
    } else {
      setVideos([
        { id: '1', title: 'الفيديو الأول', completed: false },
        { id: '2', title: 'الفيديو الثاني', completed: false },
        { id: '3', title: 'الفيديو الثالث', completed: false },
        { id: '4', title: 'الفيديو الرابع', completed: false },
        { id: '5', title: 'الفيديو الخامس', completed: false },
      ]);
    }
  }, []);

  useEffect(() => {
    if (videos.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
    }
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
        💡 اكتب أسماء 5 فيديوهات، ومررها جميعاً عبر المرحلة الحالية قبل الانتقال للمرحلة التالية.
      </p>

      <div className="space-y-2">
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
              className={`flex-1 bg-transparent border-none outline-none text-[11px] font-bold transition-colors placeholder:text-amber-500/30 ${
                video.completed ? 'text-amber-200/40 line-through' : 'text-amber-100'
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
