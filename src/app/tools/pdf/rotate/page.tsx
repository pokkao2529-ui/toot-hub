'use client';

import React, { useState, useEffect } from 'react';
import { getToolBySlug } from '@/config/pdf-tools';
import { pdfService } from '@/services/pdf';
import { PdfToolLayout } from '@/components/pdf/PdfToolLayout';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import { PdfProgress } from '@/components/pdf/PdfProgress';
import { PdfResult } from '@/components/pdf/PdfResult';
import { PdfError } from '@/components/pdf/PdfError';
import { PdfThumbnailGrid, type PageGridItem } from '@/components/pdf/PdfThumbnailGrid';
import { RotateCw, RotateCcw } from 'lucide-react';

export default function RotatePdfPage() {
  const tool = getToolBySlug('rotate')!;

  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageGridItem[]>([]);
  const [rotationAngle, setRotationAngle] = useState<90 | 180 | 270>(90);
  const [targetScope, setTargetScope] = useState<'all' | 'selected'>('all');
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

  const handleRotate = async () => {
    if (!file) return;
    setError(null);

    const selectedPages = targetScope === 'selected'
      ? pages.filter((p) => p.selected).map((p) => p.originalPageNumber)
      : undefined;

    if (targetScope === 'selected' && (!selectedPages || selectedPages.length === 0)) {
      setError('กรุณาเลือกหน้าที่ต้องการหมุนอย่างน้อย 1 หน้า');
      return;
    }

    setStep(3);
    setProgress(20);
    setProgressMsg(`กำลังหมุนเอกสาร ${rotationAngle} องศา...`);

    try {
      const res = await pdfService.rotate(file, {
        angle: rotationAngle,
        pagesToRotate: selectedPages,
        onProgress: (p, msg) => {
          setProgress(p);
          setProgressMsg(msg);
        },
      });

      const url = URL.createObjectURL(res.blob);
      setResultUrl(url);
      setResultSize(res.size);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการหมุนหน้า');
      setStep(2);
    }
  };

  const handleReset = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
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
          title="เลือกไฟล์ PDF เพื่อหมุนหน้า"
          subtitle="หมุนหน้ากระดาษ 90, 180 หรือ 270 องศาให้ตรงแนวอ่าน"
        />
      )}

      {step === 2 && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                1. ทิศทางการหมุน
              </label>
              <div className="flex items-center gap-2">
                {[
                  { angle: 90, label: 'ขวา 90°' },
                  { angle: 180, label: 'กลับหัว 180°' },
                  { angle: 270, label: 'ซ้าย 270°' },
                ].map((item) => (
                  <button
                    key={item.angle}
                    type="button"
                    onClick={() => setRotationAngle(item.angle as 90 | 180 | 270)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition ${
                      rotationAngle === item.angle
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                2. ขอบเขตหน้าที่ต้องการหมุน
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTargetScope('all')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition ${
                    targetScope === 'all'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  ทุกหน้า ({pages.length} หน้า)
                </button>
                <button
                  type="button"
                  onClick={() => setTargetScope('selected')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition ${
                    targetScope === 'selected'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  เฉพาะหน้าที่เลือก ({selectedCount})
                </button>
              </div>
            </div>
          </div>

          {targetScope === 'selected' && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                คลิกเลือกหน้าที่ต้องการหมุน:
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
              onClick={handleRotate}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-500/20 transition"
            >
              <RotateCw size={18} />
              <span>
                หมุน {targetScope === 'all' ? `ทุกหน้า (${pages.length})` : `${selectedCount} หน้า`} ทันที
              </span>
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <>
          {resultUrl ? (
            <PdfResult
              downloadUrl={resultUrl}
              filename="rotated_document.pdf"
              fileSizeBytes={resultSize}
              message="หมุนหน้าเอกสาร PDF เรียบร้อยแล้ว!"
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
