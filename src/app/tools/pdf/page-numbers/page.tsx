'use client';

import React, { useState, useEffect } from 'react';
import { getToolBySlug } from '@/config/pdf-tools';
import { pdfService, type PageNumberPosition, type PageNumberFormat } from '@/services/pdf';
import { PdfToolLayout } from '@/components/pdf/PdfToolLayout';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import { PdfProgress } from '@/components/pdf/PdfProgress';
import { PdfResult } from '@/components/pdf/PdfResult';
import { PdfError } from '@/components/pdf/PdfError';
import { Hash, FileText } from 'lucide-react';

export default function PageNumbersPage() {
  const tool = getToolBySlug('page-numbers')!;

  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [position, setPosition] = useState<PageNumberPosition>('bottom-center');
  const [format, setFormat] = useState<PageNumberFormat>('number');
  const [startFromPage, setStartFromPage] = useState<number>(1);
  const [fontSize, setFontSize] = useState<number>(11);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number>(0);

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selectedFile = files[0];
    setError(null);

    const validation = await pdfService.validateFile(selectedFile, {
      maxFileSize: tool.maxFileSize,
      acceptedMimeTypes: tool.acceptedMimeTypes,
    });

    if (!validation.isValid) {
      setError(validation.error || 'ไฟล์ไม่ถูกต้อง');
      return;
    }

    try {
      const count = await pdfService.getPageCount(selectedFile);
      setFile(selectedFile);
      setTotalPages(count);
      setStep(2);
    } catch {
      setError('ไม่สามารถเปิดอ่านจำนวนหน้าเอกสาร PDF ได้');
    }
  };

  const handleApplyNumbers = async () => {
    if (!file) return;
    setError(null);
    setStep(3);
    setProgress(20);
    setProgressMsg('กำลังรันหมายเลขหน้าในเอกสาร...');

    try {
      const res = await pdfService.pageNumbers(file, {
        position,
        format,
        startFromPage,
        fontSize,
        onProgress: (p, msg) => {
          setProgress(p);
          setProgressMsg(msg);
        },
      });

      const url = URL.createObjectURL(res.blob);
      setResultUrl(url);
      setResultSize(res.size);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการใส่เลขหน้า');
      setStep(2);
    }
  };

  const handleReset = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
    setFile(null);
    setTotalPages(0);
    setStep(1);
    setProgress(0);
    setError(null);
  };

  return (
    <PdfToolLayout tool={tool} currentStep={step}>
      {error && (
        <div className="mb-6">
          <PdfError message={error} onReset={handleReset} />
        </div>
      )}

      {step === 1 && (
        <PdfDropzone
          onFilesSelected={handleFileSelected}
          accept=".pdf,application/pdf"
          multiple={false}
          maxFileSizeMb={Math.round(tool.maxFileSize / (1024 * 1024))}
          title="เลือกไฟล์ PDF เพื่อใส่เลขหน้า"
          subtitle="รันเลขหน้าอัตโนมัติ จัดวางตำแหน่งหัวกระดาษ-ท้ายกระดาษได้อิสระ"
        />
      )}

      {step === 2 && file && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-sm">
            <div className="flex items-center space-x-3 truncate">
              <div className="p-2.5 rounded-lg bg-red-100 text-red-600 dark:bg-red-950">
                <FileText size={22} />
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{file.name}</p>
                <p className="text-xs text-slate-500">
                  มีทั้งหมด <span className="font-bold text-red-600">{totalPages}</span> หน้า
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-red-600 underline"
            >
              เปลี่ยนไฟล์
            </button>
          </div>

          {/* Position Selector */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-3">
              1. ตำแหน่งเลขหน้าบนกระดาษ
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {[
                { id: 'bottom-center', label: 'ท้ายกระดาษ (กึ่งกลาง)' },
                { id: 'bottom-right', label: 'ท้ายกระดาษ (มุมขวา)' },
                { id: 'bottom-left', label: 'ท้ายกระดาษ (มุมซ้าย)' },
                { id: 'top-center', label: 'หัวกระดาษ (กึ่งกลาง)' },
                { id: 'top-right', label: 'หัวกระดาษ (มุมขวา)' },
              ].map((pos) => (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => setPosition(pos.id as PageNumberPosition)}
                  className={`p-3 rounded-xl font-bold transition border ${
                    position === pos.id
                      ? 'border-red-500 bg-red-50/50 ring-2 ring-red-400 text-red-600 dark:bg-red-950/40'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          {/* Format and Start Page */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                2. รูปแบบการแสดงผล (Format)
              </label>
              <div className="flex gap-2">
                {[
                  { id: 'number', label: 'ตัวเลข (1)' },
                  { id: 'page-n', label: 'Page 1' },
                  { id: 'n-of-total', label: `1 / ${totalPages}` },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFormat(f.id as PageNumberFormat)}
                    className={`flex-1 py-2 rounded-lg font-bold transition ${
                      format === f.id
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 border text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                3. เริ่มใส่เลขหน้าตั้งแต่หน้า:
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={startFromPage}
                  onChange={(e) => setStartFromPage(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 text-sm font-bold px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center"
                />
                <span className="text-slate-500 text-xs">
                  {startFromPage > 1 ? `(จะข้ามหน้า 1-${startFromPage - 1} เช่น หน้าปก/สารบัญ)` : '(ใส่ตั้งแต่หน้าแรก)'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={handleReset}
              className="text-sm text-slate-500 hover:text-slate-800"
            >
              ยกเลิก
            </button>

            <button
              type="button"
              onClick={handleApplyNumbers}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-500/20 transition"
            >
              <Hash size={18} />
              <span>ใส่เลขหน้าทันที</span>
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <>
          {resultUrl ? (
            <PdfResult
              downloadUrl={resultUrl}
              filename="numbered_document.pdf"
              fileSizeBytes={resultSize}
              message="ใส่เลขหน้าในเอกสาร PDF สำเร็จเรียบร้อยแล้ว!"
              onReset={handleReset}
            />
          ) : (
            <PdfProgress progress={progress} message={progressMsg} />
          )}
        </>
      )}
    </PdfToolLayout>
  );
}
