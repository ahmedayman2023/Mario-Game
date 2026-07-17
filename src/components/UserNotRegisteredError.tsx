import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function UserNotRegisteredError() {
  return (
    <div className="fixed inset-0 flex items-center justify-center mario-sky p-4">
      <div className="max-w-md w-full bg-white mario-block p-8 text-center">
        <div className="w-16 h-16 bg-mario-red mario-block-sm rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={32} className="text-white" />
        </div>
        <h2 className="text-xl font-black text-black mb-2 scoreboard-font uppercase tracking-wide">لم يتم العثور على الحساب</h2>
        <p className="text-black/60 mb-8 font-bold text-sm">
          لم نتمكن من العثور على حساب مسجل ببياناتك. تواصل مع الدعم إذا كنت تعتقد أن هذا خطأ.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mario-btn w-full py-3 bg-mario-emerald text-white font-black uppercase tracking-widest scoreboard-font"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}
