'use client';

import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface PdfErrorProps {
  message: string;
  onRetry?: () => void;
  onReset?: () => void;
}

export const PdfError: React.FC<PdfErrorProps> = ({
  message,
  onRetry,
  onReset,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 dark:bg-red-950/30 rounded-2xl border border-red-200 dark:border-red-900 shadow-sm max-w-lg mx-auto">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400 mb-4">
        <AlertCircle size={32} />
      </div>

      <h4 className="text-lg font-bold text-red-900 dark:text-red-200 mb-2">
        เกิดข้อผิดพลาดในการดำเนินการ
      </h4>
      <p className="text-sm text-red-700 dark:text-red-300 mb-6">
        {message}
      </p>

      <div className="flex items-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2.5 transition shadow-sm"
          >
            <RotateCcw size={16} />
            <span>ลองใหม่อีกครั้ง</span>
          </button>
        )}
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-xl border border-red-300 dark:border-red-800 bg-white dark:bg-slate-900 hover:bg-red-50 text-red-700 dark:text-red-300 text-sm font-medium px-4 py-2.5 transition"
          >
            <span>เปลี่ยนไฟล์</span>
          </button>
        )}
      </div>
    </div>
  );
};
