import React from 'react';
import { Play, Youtube } from 'lucide-react';
import { RECOVERY_VIDEOS } from '../../constants';

const RecoveryVideos = () => {
  return (
    <div className="bg-stadium-blue/80 border border-white/10 rounded-lg p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Youtube size={14} className="text-broadcast-yellow" />
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] scoreboard-font">Half-Time Drills</h3>
        </div>
      </div>
      
      <div className="space-y-3">
        {RECOVERY_VIDEOS.map((video) => (
          <a
            key={video.id}
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all"
          >
            <div className="relative w-16 h-10 rounded-lg overflow-hidden flex-shrink-0">
              <img 
                src={video.thumbnail} 
                alt={video.title} 
                className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Play size={12} className="text-white fill-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-black text-white uppercase tracking-tight truncate scoreboard-font">
                {video.title}
              </div>
              <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                {video.duration} Drill
              </div>
            </div>
          </a>
        ))}
      </div>
      <p className="text-[8px] text-slate-600 mt-4 italic scoreboard-font leading-relaxed">
        Quick physical resets to maintain peak cognitive performance during breaks.
      </p>
    </div>
  );
};

export default RecoveryVideos;
