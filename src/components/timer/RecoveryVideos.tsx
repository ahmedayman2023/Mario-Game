import React from 'react';
import { Play, Youtube } from 'lucide-react';
import { RECOVERY_VIDEOS } from '../../constants';

const RecoveryVideos = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {RECOVERY_VIDEOS.map((video) => (
          <a
            key={video.id}
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-primary/30 transition-all"
          >
            <div className="relative w-24 h-14 rounded-xl border border-slate-100 overflow-hidden flex-shrink-0 shadow-sm">
              <img 
                src={video.thumbnail} 
                alt={video.title} 
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                <Play size={16} className="text-white fill-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate tracking-tight">
                {video.title}
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-wider">
                المدة: {video.duration}
              </div>
            </div>
          </a>
        ))}
      </div>
      <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest">
        استخدم هذه المقاطع لاستعادة طاقتك الذهنية والبدنية خلال فترات الاستراحة.
      </p>
    </div>
  );
};

export default RecoveryVideos;
