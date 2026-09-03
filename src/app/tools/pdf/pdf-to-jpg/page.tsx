'use client';

import React, { useState, useEffect } from 'react';
import { getToolBySlug } from '@/config/pdf-tools';
import { pdfService, type PdfToJpgResult } from '@/services/pdf';
import { PdfToolLayout } from '@/components/pdf/PdfToolLayout';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import { PdfProgress } from '@/components/pdf/PdfProgress';
import { PdfResult } from '@/components/pdf/PdfResult';
import { PdfError } from '@/components/pdf/PdfError';
import { PdfThumbnailGrid, type PageGridItem } from '@/components/pdf/PdfThumbnailGrid';
import { FileImage, CheckCircle2 } from 'lucide-react';

export default function PdfToJpgPage() {
  const tool = getToolBySlug('pdf-to-jpg')!;

  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageGridItem[]>([]);
  const [scope, setScope] = useState<'all' | 'selected'>('all');
  const [quality, setQuality] = useState<'standard' | 'high'>('high');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PdfToJpgResult | null>(null);
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

    setFile(selectedFile);
    setStep(2);

    try {
      const thumbs = await pdfService.renderThumbnails(selectedFile, 150);
      const items: PageGridItem[] = thumbs.map((t) => ({
        id: `p_${t.pageNumber}`,
        originalPageNumber: t.pageNumber,
        rotation: 0,
        thumbnailUrl: t.dataUrl,
        selected: false,
      }));
      setPages(items);
    } catch {
      const total = await pdfService.getPageCount(selectedFile);
      const items: PageGridItem[] = Array.from({ length: total }, (_, i) => ({
        id: `p_${i + 1}`,
        originalPageNumber: i + 1,
        rotation: 0,
        selected: false,
      }));
      setPages(items);
    }
  };

  const handleToggleSelect = (id: string) => {
    setPages((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleConvert = async () => {
    if (!file) return;
    setError(null);

    const targetPages = scope === 'selected'
      ? pages.filter((p) => p.selected).map((p) => p.originalPageNumber)
      : undefined;

    if (scope === 'selected' && (!targetPages || targetPages.length === 0)) {
      setError('กรุณาเลือกหน้าที่ต้องการแปลงเป็นรูปภาพอย่างน้อย 1 หน้า');
      return;
    }

    setStep(3);
    setProgress(15);
    setProgressMsg('กำลังเรนเดอร์หน้า PDF เป็นรูปภาพ JPG...');

    try {
      const res = await pdfService.pdfToJpg(file, {
        scale: quality === 'high' ? 2.0 : 1.2,
        quality: quality === 'high' ? 0.92 : 0.8,
        pagesToConvert: targetPages,
        baseFilename: file.name,
        onProgress: (p, msg) => {
          setProgress(p);
          setProgressMsg(msg);
        },
      });

      const url = URL.createObjectURL(res.blob);
      setResult(res);
      setResultUrl(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการแปลง PDF เป็น JPG');
      setStep(2);
    }
  };

  const handleReset = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
    setResult(null);
    setFile(null);
    setPages([]);
    setStep(1);
    setProgress(0);
    setError(null);
  };

  const selectedCount = pages.filter((p) => p.selected).length;

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
          title="เลือกไฟล์ PDF เพื่อแปลงเป็น JPG"
          subtitle="แปลงทุกหน้าหรือหน้าที่เลือกให้เป็นรูปภาพ JPG คุณภาพคมชัดสูง"
        />
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                1. ขอบเขตหน้าที่ต้องการแปลง
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setScope('all')}
                  className={`flex-1 py-2 rounded-lg font-semibold transition ${
                    scope === 'all'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 border text-slate-700 dark:text-slate-300'
                  }`}
                >
                  ทุกหน้า ({pages.length} หน้า)
                </button>
                <button
                  type="button"
                  onClick={() => setScope('selected')}
                  className={`flex-1 py-2 rounded-lg font-semibold transition ${
                    scope === 'selected'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 border text-slate-700 dark:text-slate-300'
                  }`}
                >
                  เลือกเฉพาะบางหน้า ({selectedCount})
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                2. คุณภาพรูปภาพ (Resolution)
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setQuality('high')}
                  className={`flex-1 py-2 rounded-lg font-semibold transition ${
                    quality === 'high'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 border text-slate-700 dark:text-slate-300'
                  }`}
                >
                  คมชัดสูง (HD 300 DPI)
                </button>
                <button
                  type="button"
                  onClick={() => setQuality('standard')}
                  className={`flex-1 py-2 rounded-lg font-semibold transition ${
                    quality === 'standard'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 border text-slate-700 dark:text-slate-300'
                  }`}
                >
                  ขนาดกะทัดรัด (Web 150 DPI)
                </button>
              </div>
            </div>
          </div>

          {scope === 'selected' && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                คลิกเลือกหน้าที่ต้องการแปลงเป็นภาพ:
              </p>
              <PdfThumbnailGrid
                items={pages}
                onToggleSelect={handleToggleSelect}
                selectable={true}
              />
            </div>
          )}

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
              onClick={handleConvert}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-500/20 transition"
            >
              <FileImage size={18} />
              <span>แปลงเป็น JPG ทันที</span>
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
                  ? `แปลงเป็นรูปภาพ JPG จำนวน ${result.pageCount} ภาพ (ZIP) เรียบร้อยแล้ว!`
                  : 'แปลงเป็นรูปภาพ JPG เรียบร้อยแล้ว!'
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
