import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Clock, BarChart3, BookOpen, Brain } from "lucide-react";

export default function Layout({ children, currentPageName }: { children: React.ReactNode, currentPageName: string }) {
  const location = useLocation();

  return (
    <div className="dark min-h-screen relative">
      <div className="absolute inset-0 -z-10">
        <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d250f1a460005e70e7e458/a17066f78_SuperMarioMobileWallpaper.jpg" alt="App background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      
      <main className={`max-w-5xl mx-auto px-4 sm:px-6 py-10 ${currentPageName === 'Timer' ? 'bg-black text-white rounded-none ring-0 shadow-none' : 'text-slate-100 rounded-3xl ring-1 ring-emerald-500/15 bg-slate-900/30 shadow-[0_0_40px_-10px_rgba(16,185,129,0.35)]'}`}>
        {children}
      </main>
    </div>
  );
}
