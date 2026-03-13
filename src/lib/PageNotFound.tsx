import React from 'react';
import { Link } from 'react-router-dom';

export default function PageNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-900 p-4">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl mb-8 text-slate-600 font-medium">Page not found</p>
      <Link 
        to="/" 
        className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}
