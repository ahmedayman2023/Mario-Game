import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Clock, BarChart3, BookOpen, Brain, Zap } from "lucide-react";

export default function Layout({ children, currentPageName }: { children: React.ReactNode, currentPageName: string }) {
  const location = useLocation();

  return (
    <div className="dark min-h-screen relative overflow-x-hidden">
      <div className="fixed inset-0 -z-10">
        <img 
          src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=2070&auto=format&fit=crop" 
          alt="Stadium background" 
          className="w-full h-full object-cover opacity-40" 
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stadium-blue/80 via-stadium-blue/90 to-black" />
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 pb-32">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[80vh]">
          {children}
        </div>
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 glass px-8 py-5 rounded-[2.5rem] border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 flex items-center gap-16">
        <Link 
          to="/" 
          className={`flex flex-col items-center gap-2 transition-all group ${currentPageName === 'Timer' ? 'text-mario-emerald scale-110' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <div className={`p-2 rounded-xl transition-colors ${currentPageName === 'Timer' ? 'bg-mario-emerald/20' : 'group-hover:bg-white/5'}`}>
            <Clock size={24} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] scoreboard-font">المؤقت</span>
        </Link>
        <Link 
          to="/Nutrition" 
          className={`flex flex-col items-center gap-2 transition-all group ${currentPageName === 'Nutrition' ? 'text-mario-emerald scale-110' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <div className={`p-2 rounded-xl transition-colors ${currentPageName === 'Nutrition' ? 'bg-mario-emerald/20' : 'group-hover:bg-white/5'}`}>
            <Zap size={24} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] scoreboard-font">التغذية</span>
        </Link>
        <Link 
          to="/SRS" 
          className={`flex flex-col items-center gap-2 transition-all group ${currentPageName === 'SRS' ? 'text-mario-emerald scale-110' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <div className={`p-2 rounded-xl transition-colors ${currentPageName === 'SRS' ? 'bg-mario-emerald/20' : 'group-hover:bg-white/5'}`}>
            <Brain size={24} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] scoreboard-font">التكرار</span>
        </Link>
      </nav>
    </div>
  );
}
