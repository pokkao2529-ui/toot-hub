'use client';

import React, { useState, useEffect } from 'react';
import { getToolBySlug } from '@/config/pdf-tools';
import { pdfService } from '@/services/pdf';
import { PdfToolLayout } from '@/components/pdf/PdfToolLayout';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import { PdfProgress } from '@/components/pdf/PdfProgress';
import { PdfResult } from '@/components/pdf/PdfResult';
import { PdfError } from '@/components/pdf/PdfError';
import { ArrowLeft, ArrowRight, RotateCw, Trash2, CheckCircle2 } from 'lucide-react';

interface OrganizePageItem {
  id: string;
  originalPageNumber: number;
  rotation: number;
  thumbnailUrl?: string;
}

export default function OrganizePdfPage() {
  const tool = getToolBySlug('organize')!;

  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<OrganizePageItem[]>([]);
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
      const items: OrganizePageItem[] = thumbs.map((t) => ({
        id: `p_${t.pageNumber}_${Date.now()}`,
        originalPageNumber: t.pageNumber,
        rotation: 0,
        thumbnailUrl: t.dataUrl,
      }));
      setPages(items);
    } catch {
      const total = await pdfService.getPageCount(selectedFile);
      const items: OrganizePageItem[] = Array.from({ length: total }, (_, i) => ({
        id: `p_${i + 1}_${Date.now()}`,
        originalPageNumber: i + 1,
        rotation: 0,
      }));
      setPages(items);
    }
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= pages.length) return;

    const updated = [...pages];
    const temp = updated[targetIdx];
    updated[targetIdx] = updated[index];
    updated[index] = temp;
    setPages(updated);
  };

  const handleRotate = (id: string) => {
    setPages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p))
    );
  };

  const handleDelete = (id: string) => {
    if (pages.length <= 1) {
      setError('ต้องคงเหลืออย่างน้อย 1 หน้าในเอกสาร');
      return;
    }
    setPages((prev) => prev.filter((p) => p.id !== id));
  };

  const handleOrganize = async () => {
    if (!file || pages.length === 0) return;
    setError(null);
    setStep(3);
    setProgress(15);
    setProgressMsg('กำลังจัดระเบียบหน้า PDF ตามลำดับใหม่...');

    try {
      const res = await pdfService.organize(file, {
        pages: pages.map((p) => ({
          originalPageNumber: p.originalPageNumber,
          rotation: p.rotation,
        })),
        onProgress: (p, msg) => {
          setProgress(p);
          setProgressMsg(msg);
        },
      });

      const url = URL.createObjectURL(res.blob);
      setResultUrl(url);
      setResultSize(res.size);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการจัดระเบียบหน้า');
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
          title="เลือกไฟล์ PDF เพื่อจัดเรียงหน้า"
          subtitle="สลับตำแหน่ง ลบ หรือหมุนหน้าเอกสารได้อย่างอิสระ"
        />
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-sm">
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">
                จัดการลำดับหน้า (มีทั้งหมด {pages.length} หน้า)
              </p>
              <p className="text-xs text-slate-500">
                ใช้ปุ่มลูกศรเพื่อสลับตำแหน่งซ้าย-ขวา หมุนหน้า หรือกดถังขยะเพื่อลบหน้าที่ไม่ต้องการ
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

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {pages.map((p, idx) => (
              <div
                key={p.id}
                className="flex flex-col items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 shadow-sm"
              >
                <div className="flex w-full items-center justify-between px-1 mb-2 text-xs">
                  <span className="font-bold text-red-600">ลำดับที่ {idx + 1}</span>
                  <span className="text-slate-400">(หน้าเดิม {p.originalPageNumber})</span>
                </div>

                <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800 mb-3">
                  {p.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.thumbnailUrl}
                      alt={`Page ${p.originalPageNumber}`}
                      style={{ transform: `rotate(${p.rotation}deg)` }}
                      className="max-h-full max-w-full object-contain shadow transition-transform duration-200"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">หน้า {p.originalPageNumber}</span>
                  )}
                </div>

                <div className="flex items-center justify-between w-full px-1">
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, 'left')}
                      className="p-1 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20"
                      title="เลื่อนไปซ้าย"
                    >
                      <ArrowLeft size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === pages.length - 1}
                      onClick={() => handleMove(idx, 'right')}
                      className="p-1 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20"
                      title="เลื่อนไปขวา"
                    >
                      <ArrowRight size={14} />
                    </button>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleRotate(p.id)}
                      className="p-1 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900"
                      title="หมุน 90°"
                    >
                      <RotateCw size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                      title="ลบหน้านี้"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
              onClick={handleOrganize}
              className="px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-500/20 transition"
            >
              บันทึกโครงสร้าง PDF ฉบับใหม่
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <>
          {resultUrl ? (
            <PdfResult
              downloadUrl={resultUrl}
              filename="organized_document.pdf"
              fileSizeBytes={resultSize}
              message="จัดระเบียบและบันทึกหน้า PDF เรียบร้อยแล้ว!"
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
