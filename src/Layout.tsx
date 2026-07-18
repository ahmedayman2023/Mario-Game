import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Clock, BarChart3, BookOpen, Brain, Zap } from "lucide-react";

export default function Layout({ children, currentPageName }: { children: React.ReactNode, currentPageName: string }) {
  const location = useLocation();

  const tabs = [
    { to: "/", key: "Timer", label: "المؤقت", icon: Clock },
    { to: "/Nutrition", key: "Nutrition", label: "التغذية", icon: Zap },
    { to: "/SRS", key: "SRS", label: "التكرار", icon: Brain },
  ];

  return (
    <div className="dark min-h-screen relative overflow-x-hidden mario-sky flex flex-col">
      <main className="flex-1 max-w-6xl mx-auto w-full px-3 sm:px-6 py-8 pb-32">
        <div className="bg-panel mario-block rounded-none overflow-hidden min-h-[80vh]">
          {children}
        </div>
      </main>

      <div className="mario-ground h-10 w-full fixed bottom-0 left-0 z-40" />

      {/* Navigation Bar */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-panel mario-block rounded-none z-50 flex items-stretch overflow-hidden">
        {tabs.map(({ to, key, label, icon: Icon }) => (
          <Link
            key={key}
            to={to}
            className={`flex flex-col items-center justify-center gap-1 px-5 sm:px-7 py-3 transition-colors border-l-4 border-black last:border-l-0 ${
              currentPageName === key ? 'bg-mario-yellow text-black' : 'bg-panel text-white hover:bg-white/10'
            }`}
          >
            <Icon size={20} strokeWidth={2.5} />
            <span className="text-[8px] font-black uppercase tracking-widest scoreboard-font">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
