import React from 'react';
import { Link } from 'react-router-dom';

export default function PageNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen mario-sky p-4">
      <div className="bg-white mario-block p-10 flex flex-col items-center text-center">
        <h1 className="text-6xl font-pixel text-mario-red mb-6">404</h1>
        <p className="text-lg mb-8 text-black font-black uppercase tracking-widest scoreboard-font">لم يتم العثور على الصفحة</p>
        <Link
          to="/"
          className="mario-btn px-6 py-3 bg-mario-emerald text-white font-black uppercase tracking-widest scoreboard-font"
        >
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
