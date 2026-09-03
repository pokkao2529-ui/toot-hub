'use client';

import React, { useState, useEffect } from 'react';
import { getToolBySlug } from '@/config/pdf-tools';
import { pdfService } from '@/services/pdf';
import { PdfToolLayout } from '@/components/pdf/PdfToolLayout';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import { PdfFileList, type FileItem } from '@/components/pdf/PdfFileList';
import { PdfProgress } from '@/components/pdf/PdfProgress';
import { PdfResult } from '@/components/pdf/PdfResult';
import { PdfError } from '@/components/pdf/PdfError';

export default function MergePdfPage() {
  const tool = getToolBySlug('merge')!;

  const [files, setFiles] = useState<FileItem[]>([]);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number>(0);

  // Revoke object URL on unmount or reset
  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  const handleFilesSelected = async (newFiles: File[]) => {
    setError(null);
    const combinedFiles = [...files.map((f) => f.file), ...newFiles];

    // Validate files
    const validation = await pdfService.validateFileList(combinedFiles, tool.maxFiles, {
      maxFileSize: tool.maxFileSize,
      acceptedMimeTypes: tool.acceptedMimeTypes,
    });

    if (!validation.isValid) {
      setError(validation.error || 'ไฟล์ไม่ถูกต้อง');
      return;
    }

    const newItems: FileItem[] = newFiles.map((file) => ({
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      file,
    }));

    setFiles((prev) => [...prev, ...newItems]);
    setStep(2);
  };

  const handleRemoveFile = (id: string) => {
    const updated = files.filter((f) => f.id !== id);
    setFiles(updated);
    if (updated.length === 0) {
      setStep(1);
    }
  };

  const handleReorder = (newFiles: FileItem[]) => {
    setFiles(newFiles);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('กรุณาเลือกไฟล์ PDF อย่างน้อย 2 ไฟล์ขึ้นไปเพื่อทำการรวมไฟล์');
      return;
    }

    setError(null);
    setStep(3);
    setProgress(5);
    setProgressMsg('กำลังเตรียมการรวมไฟล์...');

    try {
      const rawFiles = files.map((f) => f.file);
      const res = await pdfService.merge(rawFiles, {
        onProgress: (p, msg) => {
          setProgress(p);
          setProgressMsg(msg);
        },
      });

      const url = URL.createObjectURL(res.blob);
      setResultUrl(url);
      setResultSize(res.size);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการรวมไฟล์';
      setError(message);
      setStep(2);
    }
  };

  const handleReset = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
    setFiles([]);
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
          onFilesSelected={handleFilesSelected}
          accept=".pdf,application/pdf"
          multiple={true}
          maxFiles={tool.maxFiles}
          maxFileSizeMb={Math.round(tool.maxFileSize / (1024 * 1024))}
          title="เลือกหรือลากไฟล์ PDF มาวางที่นี่"
          subtitle="สามารถเลือกหลายไฟล์พร้อมกันเพื่อรวมเป็นไฟล์เดียว"
        />
      )}

      {step === 2 && (
        <div className="space-y-6">
          <PdfFileList
            files={files}
            onRemove={handleRemoveFile}
            onReorder={handleReorder}
            onAddMore={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.pdf,application/pdf';
              input.multiple = true;
              input.onchange = (e) => {
                const target = e.target as HTMLInputElement;
                if (target.files) handleFilesSelected(Array.from(target.files));
              };
              input.click();
            }}
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={handleReset}
              className="text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              ยกเลิกและเลือกใหม่
            </button>

            <button
              type="button"
              onClick={handleMerge}
              disabled={files.length < 2}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold shadow-md shadow-red-500/20 transition"
            >
              รวมไฟล์ PDF ({files.length} ไฟล์)
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <>
          {resultUrl ? (
            <PdfResult
              downloadUrl={resultUrl}
              filename="merged_document.pdf"
              fileSizeBytes={resultSize}
              message="รวมไฟล์ PDF เรียบร้อยแล้ว!"
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
