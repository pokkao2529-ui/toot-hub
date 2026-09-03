'use client';

import React, { useState, useEffect } from 'react';
import { getToolBySlug } from '@/config/pdf-tools';
import { pdfService, type SplitResult } from '@/services/pdf';
import { PdfToolLayout } from '@/components/pdf/PdfToolLayout';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import { PdfProgress } from '@/components/pdf/PdfProgress';
import { PdfResult } from '@/components/pdf/PdfResult';
import { PdfError } from '@/components/pdf/PdfError';
import { FileText, Split, Layers } from 'lucide-react';

export default function SplitPdfPage() {
  const tool = getToolBySlug('split')!;

  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [mode, setMode] = useState<'all' | 'ranges'>('ranges');
  const [rangeInput, setRangeInput] = useState<string>('1');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SplitResult | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

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
      const pages = await pdfService.getPageCount(selectedFile);
      setFile(selectedFile);
      setTotalPages(pages);
      setRangeInput(pages > 1 ? `1-${Math.ceil(pages / 2)}` : '1');
      setStep(2);
    } catch {
      setError('ไม่สามารถอ่านจำนวนหน้าของเอกสาร PDF ได้');
    }
  };

  const parseRanges = (input: string) => {
    const parts = input.split(',').map((p) => p.trim()).filter(Boolean);
    const ranges: { from: number; to: number }[] = [];

    for (const part of parts) {
      if (part.includes('-')) {
        const [fromStr, toStr] = part.split('-');
        const from = parseInt(fromStr, 10);
        const to = parseInt(toStr, 10);
        if (isNaN(from) || isNaN(to)) throw new Error(`รูปแบบช่วงหน้าไม่ถูกต้อง: ${part}`);
        ranges.push({ from, to });
      } else {
        const num = parseInt(part, 10);
        if (isNaN(num)) throw new Error(`เลขหน้าไม่ถูกต้อง: ${part}`);
        ranges.push({ from: num, to: num });
      }
    }
    return ranges;
  };

  const handleSplit = async () => {
    if (!file) return;
    setError(null);

    let parsedRanges: { from: number; to: number }[] = [];
    if (mode === 'ranges') {
      try {
        parsedRanges = parseRanges(rangeInput);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'รูปแบบช่วงหน้าไม่ถูกต้อง');
        return;
      }
    }

    setStep(3);
    setProgress(10);
    setProgressMsg('กำลังเตรียมการแยกเอกสาร...');

    try {
      const splitRes = await pdfService.split(file, {
        mode,
        ranges: parsedRanges,
        baseFilename: file.name,
        onProgress: (p, msg) => {
          setProgress(p);
          setProgressMsg(msg);
        },
      });

      const url = URL.createObjectURL(splitRes.blob);
      setResult(splitRes);
      setResultUrl(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการแยกไฟล์');
      setStep(2);
    }
  };

  const handleReset = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
    setResult(null);
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
          title="เลือกไฟล์ PDF เพื่อแยกหน้า"
          subtitle="ลากและวาง หรือคลิกเพื่อเลือกไฟล์ PDF จากอุปกรณ์ของคุณ"
        />
      )}

      {step === 2 && file && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center space-x-3 truncate">
              <div className="p-2.5 rounded-lg bg-red-100 text-red-600 dark:bg-red-950">
                <FileText size={24} />
              </div>
              <div className="truncate">
                <p className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-slate-500">
                  มีทั้งหมด <span className="font-semibold text-red-600">{totalPages}</span> หน้า
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

          {/* Mode Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setMode('ranges')}
              className={`p-5 rounded-xl border cursor-pointer transition ${
                mode === 'ranges'
                  ? 'border-red-500 bg-red-50/40 ring-2 ring-red-400 dark:bg-red-950/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center space-x-2 text-red-600 mb-2">
                <Split size={20} />
                <h4 className="font-bold text-sm">กำหนดช่วงหน้าที่ต้องการแยก</h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                ระบุช่วงหน้า เช่น 1-3, 5-8 หรือหน้าเดี่ยว
              </p>
              {mode === 'ranges' && (
                <input
                  type="text"
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  placeholder="เช่น 1-3, 5, 7-9"
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:border-red-500"
                />
              )}
            </div>

            <div
              onClick={() => setMode('all')}
              className={`p-5 rounded-xl border cursor-pointer transition ${
                mode === 'all'
                  ? 'border-red-500 bg-red-50/40 ring-2 ring-red-400 dark:bg-red-950/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center space-x-2 text-red-600 mb-2">
                <Layers size={20} />
                <h4 className="font-bold text-sm">แยกทุกหน้าออกเป็นไฟล์เดี่ยว</h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                แปลงทุกหน้าของ PDF ({totalPages} หน้า) ออกเป็นไฟล์ PDF เดี่ยวและบีบอัดเป็น ZIP
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={handleSplit}
              className="px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-500/20 transition"
            >
              แยกไฟล์ PDF ทันที
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <>
          {resultUrl && result ? (
            <PdfResult
              downloadUrl={resultUrl}
              filename={result.filename}
              fileSizeBytes={result.blob.size}
              message={
                result.isZip
                  ? `แยกไฟล์ PDF เป็น ${result.fileCount} ไฟล์ (ZIP) สำเร็จแล้ว!`
                  : 'แยกหน้า PDF เรียบร้อยแล้ว!'
              }
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
