'use client';

import React, { useState, useEffect } from 'react';
import { getToolBySlug } from '@/config/pdf-tools';
import { pdfService } from '@/services/pdf';
import { PdfToolLayout } from '@/components/pdf/PdfToolLayout';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import { PdfThumbnailGrid, type PageGridItem } from '@/components/pdf/PdfThumbnailGrid';
import { PdfProgress } from '@/components/pdf/PdfProgress';
import { PdfResult } from '@/components/pdf/PdfResult';
import { PdfError } from '@/components/pdf/PdfError';
import { Trash2 } from 'lucide-react';

export default function RemovePagesPage() {
  const tool = getToolBySlug('remove-pages')!;

  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageGridItem[]>([]);
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
        selected: false, // marked for removal
      }));
      setPages(items);
    } catch {
      // Fallback: render dummy page numbers if thumbnail render fails
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

  const handleRemovePages = async () => {
    if (!file) return;
    const toRemove = pages.filter((p) => p.selected).map((p) => p.originalPageNumber);

    if (toRemove.length === 0) {
      setError('กรุณาเลือกหน้าที่ต้องการลบอย่างน้อย 1 หน้า');
      return;
    }

    if (toRemove.length === pages.length) {
      setError('ไม่สามารถลบทุกหน้าออกจากเอกสารได้ ต้องคงเหลืออย่างน้อย 1 หน้า');
      return;
    }

    setError(null);
    setStep(3);
    setProgress(15);
    setProgressMsg('กำลังลบหน้าที่เลือก...');

    try {
      const res = await pdfService.removePages(file, {
        pagesToRemove: toRemove,
        onProgress: (p, msg) => {
          setProgress(p);
          setProgressMsg(msg);
        },
      });

      const url = URL.createObjectURL(res.blob);
      setResultUrl(url);
      setResultSize(res.size);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการลบหน้า');
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
          title="เลือกไฟล์ PDF เพื่อลบหน้าที่ไม่ต้องการ"
          subtitle="ลากและวางไฟล์ PDF หรือคลิกเพื่อเปิดไฟล์"
        />
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <div>
              <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                คลิกเลือกหน้าที่ต้องการลบออก (เลือกแล้ว {selectedCount} หน้า)
              </p>
              <p className="text-xs text-slate-500">
                หน้าที่มีเครื่องหมายถูกสีแดงจะถูกลบออกจากเอกสารฉบับใหม่
              </p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-red-600 underline"
            >
              เปลี่ยนไฟล์
            </button>
          </div>

          <PdfThumbnailGrid
            items={pages}
            onToggleSelect={handleToggleSelect}
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
              onClick={handleRemovePages}
              disabled={selectedCount === 0 || selectedCount === pages.length}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold shadow-md shadow-red-500/20 transition"
            >
              <Trash2 size={18} />
              <span>ลบ {selectedCount} หน้าที่เลือก</span>
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <>
          {resultUrl ? (
            <PdfResult
              downloadUrl={resultUrl}
              filename="cleaned_document.pdf"
              fileSizeBytes={resultSize}
              message={`ลบ ${selectedCount} หน้าเรียบร้อยแล้ว คงเหลือ ${pages.length - selectedCount} หน้า`}
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
