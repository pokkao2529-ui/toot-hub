'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface PdfProgressProps {
  progress: number; // 0 to 100
  message?: string;
  subMessage?: string;
}

export const PdfProgress: React.FC<PdfProgressProps> = ({
  progress,
  message = 'กำลังประมวลผลเอกสาร...',
  subMessage = 'ระบบกำลังทำงานโดยตรงบนเบราว์เซอร์ของคุณ ปลอดภัย 100%',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-lg mx-auto">
      <div className="relative mb-6">
        <Loader2 className="h-16 w-16 text-red-600 animate-spin" />
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
          {Math.round(progress)}%
        </span>
      </div>

      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
        {message}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        {subMessage}
      </p>

      {/* Progress bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-red-500 to-rose-600 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.max(5, Math.min(100, progress))}%` }}
        />
      </div>
    </div>
  );
};
