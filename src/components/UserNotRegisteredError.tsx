import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function UserNotRegisteredError() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Account Not Found</h2>
        <p className="text-slate-600 mb-8">
          We couldn't find a registered account with your credentials. Please contact support if you believe this is an error.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
