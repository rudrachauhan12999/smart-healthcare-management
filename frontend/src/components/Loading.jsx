import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading({
  message = 'Loading healthcare records...',
  fullScreen = false,
  variant = 'spinner', // 'spinner' | 'skeleton'
  count = 3,
}) {
  if (variant === 'skeleton') {
    return (
      <div className="w-full space-y-3 animate-pulse">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="h-16 bg-slate-200/80 rounded-xl w-full border border-slate-200/50"
          />
        ))}
      </div>
    );
  }

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full border border-slate-200 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Processing</h3>
          <p className="text-sm text-slate-500 mt-1">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 flex flex-col items-center justify-center text-center">
      <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-3">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
      </div>
      <p className="text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
}
