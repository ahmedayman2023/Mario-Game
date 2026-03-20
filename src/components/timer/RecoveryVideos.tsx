import React, { memo } from 'react';
import { ExternalLink, Play } from 'lucide-react';
import { motion } from 'motion/react';

const RECOVERY_VIDEOS = [
  {
    id: '74cOUSKXMz0',
    title: 'أجواء الملعب - تركيز كامل',
    duration: '10:00'
  }
];

const RecoveryVideos = memo(function RecoveryVideos() {
  return (
    <div className="bg-stadium-blue/80 border border-white/10 rounded-lg p-6 shadow-xl overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ExternalLink size={14} className="text-broadcast-yellow" />
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] scoreboard-font">أجواء الملعب</h3>
        </div>
      </div>
      
      <div className="space-y-4">
        {RECOVERY_VIDEOS.map((video) => (
          <a 
            key={video.id}
            href={`https://www.youtube.com/watch?v=${video.id}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="group relative block aspect-video bg-black rounded-md overflow-hidden border border-white/5 hover:border-broadcast-yellow/50 transition-colors"
          >
            <img 
              src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`} 
              alt={video.title} 
              className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 bg-mario-red rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Play size={20} className="text-white ml-0.5" fill="currentColor" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white scoreboard-font">فتح الملعب</span>
            </div>
          </a>
        ))}
      </div>
      <p className="text-[9px] text-slate-500 mt-3 italic scoreboard-font leading-relaxed">انقر لفتح أجواء الملعب في علامة تبويب جديدة لتجربة التعلم الكاملة.</p>
    </div>
  );
});

export default RecoveryVideos;
