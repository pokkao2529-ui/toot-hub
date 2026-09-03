'use client';

import React, { useState, useEffect } from 'react';
import { getToolBySlug } from '@/config/pdf-tools';
import { pdfService, type ExtractResult } from '@/services/pdf';
import { PdfToolLayout } from '@/components/pdf/PdfToolLayout';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import { PdfThumbnailGrid, type PageGridItem } from '@/components/pdf/PdfThumbnailGrid';
import { PdfProgress } from '@/components/pdf/PdfProgress';
import { PdfResult } from '@/components/pdf/PdfResult';
import { PdfError } from '@/components/pdf/PdfError';
import { FileOutput, Layers } from 'lucide-react';

export default function ExtractPagesPage() {
  const tool = getToolBySlug('extract-pages')!;

  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageGridItem[]>([]);
  const [extractMode, setExtractMode] = useState<'single-pdf' | 'separate-files'>('single-pdf');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractResult | null>(null);
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

  const handleSelectAll = () => {
    setPages((prev) => prev.map((item) => ({ ...item, selected: true })));
  };

  const handleDeselectAll = () => {
    setPages((prev) => prev.map((item) => ({ ...item, selected: false })));
  };

  const handleExtract = async () => {
    if (!file) return;
    const toExtract = pages.filter((p) => p.selected).map((p) => p.originalPageNumber);

    if (toExtract.length === 0) {
      setError('กรุณาเลือกหน้าที่ต้องการดึงออกอย่างน้อย 1 หน้า');
      return;
    }

    setError(null);
    setStep(3);
    setProgress(15);
    setProgressMsg('กำลังดึงหน้าที่เลือก...');

    try {
      const res = await pdfService.extractPages(file, {
        pagesToExtract: toExtract,
        mode: extractMode,
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
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการดึงหน้า');
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
          title="เลือกไฟล์ PDF เพื่อดึงหน้าที่ต้องการ"
          subtitle="ลากและวางไฟล์ PDF หรือคลิกเพื่อเปิดไฟล์"
        />
      )}

      {step === 2 && (
        <div className="space-y-6">
          {/* Options mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setExtractMode('single-pdf')}
              className={`p-4 rounded-xl border cursor-pointer transition ${
                extractMode === 'single-pdf'
                  ? 'border-red-500 bg-red-50/40 ring-2 ring-red-400 dark:bg-red-950/30'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2 text-red-600 mb-1">
                <FileOutput size={18} />
                <span className="font-bold text-sm">รวมหน้าที่เลือกเป็นไฟล์ PDF เดียว</span>
              </div>
              <p className="text-xs text-slate-500">สร้างเอกสาร PDF ฉบับใหม่จากหน้าที่เลือก</p>
            </div>

            <div
              onClick={() => setExtractMode('separate-files')}
              className={`p-4 rounded-xl border cursor-pointer transition ${
                extractMode === 'separate-files'
                  ? 'border-red-500 bg-red-50/40 ring-2 ring-red-400 dark:bg-red-950/30'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2 text-red-600 mb-1">
                <Layers size={18} />
                <span className="font-bold text-sm">แยกแต่ละหน้าเป็นไฟล์เดี่ยว (ZIP)</span>
              </div>
              <p className="text-xs text-slate-500">แต่ละหน้าที่เลือกจะถูกเซฟเป็นไฟล์แยกกัน</p>
            </div>
          </div>

          <PdfThumbnailGrid
            items={pages}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            selectable={true}
          />

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
              onClick={handleExtract}
              disabled={selectedCount === 0}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold shadow-md shadow-red-500/20 transition"
            >
              <FileOutput size={18} />
              <span>ดึง {selectedCount} หน้าที่เลือก</span>
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
              message={`ดึง ${result.pageCount} หน้าที่เลือกสำเร็จแล้ว!`}
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
