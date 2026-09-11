'use client';

import React, { useEffect } from 'react';
import { Download, CheckCircle2, RotateCcw, FileCheck } from 'lucide-react';

interface PdfResultProps {
  downloadUrl: string;
  filename: string;
  fileSizeBytes?: number;
  message?: string;
  onReset: () => void;
}

export const PdfResult: React.FC<PdfResultProps> = ({
  downloadUrl,
  filename,
  fileSizeBytes,
  message = 'ประมวลผลเอกสารของคุณเรียบร้อยแล้ว!',
  onReset,
}) => {
  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleDownload = async () => {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isAndroid = /Android/i.test(ua);
    const isMobile = isIOS || isAndroid || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
    const isInApp = /Line|FBAN|FBAV|Instagram|MicroMessenger/i.test(ua);

    // --- IN-APP BROWSER (LINE, Facebook): cannot download blobs, just guide user ---
    if (isInApp) {
      alert('⚠️ ไม่สามารถดาวน์โหลดได้ในแอปนี้\n\n👉 กรุณากดเมนู (•••) หรือ (...) มุมขวาบน\n👉 เลือก "เปิดใน Safari" หรือ "เปิดในเบราว์เซอร์" แล้วโหลดอีกครั้งครับ');
      return;
    }

    // --- iOS Safari: Web Share API works best (saves to Files / share sheet) ---
    if (isIOS) {
      try {
        if (navigator.share && navigator.canShare) {
          const response = await fetch(downloadUrl);
          const blob = await response.blob();
          const file = new File([blob], filename, { type: blob.type || 'application/pdf' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: filename });
            return;
          }
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') return; // user cancelled share sheet - that's fine
        console.warn('iOS share failed, trying window.open fallback', err);
      }
      // iOS fallback: open blob URL in new tab — iOS Safari will show PDF viewer with download option
      window.open(downloadUrl, '_blank');
      return;
    }

    // --- Android: Web Share API first, then normal anchor download ---
    if (isAndroid) {
      try {
        if (navigator.share && navigator.canShare) {
          const response = await fetch(downloadUrl);
          const blob = await response.blob();
          const file = new File([blob], filename, { type: blob.type || 'application/pdf' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: filename });
            return;
          }
        }
      } catch (err) {
        console.warn('Android share failed, using anchor download', err);
      }
    }

    // --- Desktop / Android fallback: standard anchor click ---
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-lg mx-auto">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400 mb-6">
        <CheckCircle2 size={44} />
      </div>

      <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
        {message}
      </h3>

      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8 px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 max-w-full">
        <FileCheck size={18} className="text-red-500 flex-shrink-0" />
        <span className="truncate font-medium">{filename}</span>
        {fileSizeBytes && (
          <span className="flex-shrink-0 text-slate-400 font-normal">
            ({formatSize(fileSizeBytes)})
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
        <button
          type="button"
          onClick={handleDownload}
          className="flex-1 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3.5 shadow-md shadow-red-500/20 transition"
        >
          <Download size={20} />
          <span>ดาวน์โหลดไฟล์</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium px-5 py-3.5 transition"
        >
          <RotateCcw size={18} />
          <span>ทำรายการใหม่</span>
        </button>
      </div>
    </div>
  );
};
