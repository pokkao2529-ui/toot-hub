'use client';

import React, { useState, useEffect } from 'react';
import { getToolBySlug } from '@/config/pdf-tools';
import { pdfService } from '@/services/pdf';
import { PdfToolLayout } from '@/components/pdf/PdfToolLayout';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import { PdfProgress } from '@/components/pdf/PdfProgress';
import { PdfResult } from '@/components/pdf/PdfResult';
import { PdfError } from '@/components/pdf/PdfError';
import { ArrowLeft, ArrowRight, Trash2, Image as ImageIcon } from 'lucide-react';

interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
}

export default function JpgToPdfPage() {
  const tool = getToolBySlug('jpg-to-pdf')!;

  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<'A4' | 'fit-image'>('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margin, setMargin] = useState<number>(20);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number>(0);

  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [images, resultUrl]);

  const handleFilesSelected = (newFiles: File[]) => {
    setError(null);
    const validImages = newFiles.filter((f) => {
      const isImg = f.type.startsWith('image/') || /\.(jpe?g|png|webp)$/i.test(f.name);
      return isImg && f.size <= tool.maxFileSize;
    });

    if (validImages.length === 0) {
      setError('กรุณาเลือกไฟล์ภาพ JPG, PNG หรือ WebP ที่มีขนาดไม่เกิน 25 MB');
      return;
    }

    const items: ImageItem[] = validImages.map((file) => ({
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...items]);
    setStep(2);
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= images.length) return;

    const updated = [...images];
    const temp = updated[targetIdx];
    updated[targetIdx] = updated[index];
    updated[index] = temp;
    setImages(updated);
  };

  const handleDelete = (id: string) => {
    const toDelete = images.find((img) => img.id === id);
    if (toDelete) URL.revokeObjectURL(toDelete.previewUrl);

    const updated = images.filter((img) => img.id !== id);
    setImages(updated);
    if (updated.length === 0) setStep(1);
  };

  const handleConvert = async () => {
    if (images.length === 0) return;
    setError(null);
    setStep(3);
    setProgress(15);
    setProgressMsg('กำลังเตรียมการแปลงรูปภาพเป็นเอกสาร PDF...');

    try {
      const rawFiles = images.map((img) => img.file);
      const res = await pdfService.jpgToPdf(rawFiles, {
        pageSize,
        orientation,
        margin,
        onProgress: (p, msg) => {
          setProgress(p);
          setProgressMsg(msg);
        },
      });

      const url = URL.createObjectURL(res.blob);
      setResultUrl(url);
      setResultSize(res.size);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการแปลงรูปภาพเป็น PDF');
      setStep(2);
    }
  };

  const handleReset = () => {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
    setImages([]);
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
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          multiple={true}
          maxFiles={tool.maxFiles}
          maxFileSizeMb={Math.round(tool.maxFileSize / (1024 * 1024))}
          title="เลือกหรือลากรูปภาพมาวางที่นี่"
          subtitle="รองรับ JPG, JPEG, PNG, WebP (สามารถเลือกได้หลายรูปพร้อมกัน)"
        />
      )}

      {step === 2 && (
        <div className="space-y-6">
          {/* Settings panel */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                ขนาดหน้ากระดาษ
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPageSize('A4')}
                  className={`flex-1 py-2 rounded-lg font-semibold transition ${
                    pageSize === 'A4'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 border text-slate-700 dark:text-slate-300'
                  }`}
                >
                  ขนาด A4
                </button>
                <button
                  type="button"
                  onClick={() => setPageSize('fit-image')}
                  className={`flex-1 py-2 rounded-lg font-semibold transition ${
                    pageSize === 'fit-image'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 border text-slate-700 dark:text-slate-300'
                  }`}
                >
                  พอดีกับรูปภาพ
                </button>
              </div>
            </div>

            {pageSize === 'A4' && (
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                  แนวหน้ากระดาษ
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOrientation('portrait')}
                    className={`flex-1 py-2 rounded-lg font-semibold transition ${
                      orientation === 'portrait'
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 border text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    แนวตั้ง
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrientation('landscape')}
                    className={`flex-1 py-2 rounded-lg font-semibold transition ${
                      orientation === 'landscape'
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 border text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    แนวนอน
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                ระยะขอบขาว (Margin)
              </label>
              <div className="flex gap-2">
                {[
                  { label: 'ไม่มีขอบ', val: 0 },
                  { label: 'พอดี', val: 20 },
                  { label: 'ขอบกว้าง', val: 40 },
                ].map((m) => (
                  <button
                    key={m.val}
                    type="button"
                    onClick={() => setMargin(m.val)}
                    className={`flex-1 py-2 rounded-lg font-semibold transition ${
                      margin === m.val
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 border text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Image grid */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              รูปภาพที่เลือก ({images.length} รูป)
            </span>
            <button
              type="button"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.multiple = true;
                input.onchange = (e) => {
                  const target = e.target as HTMLInputElement;
                  if (target.files) handleFilesSelected(Array.from(target.files));
                };
                input.click();
              }}
              className="text-xs text-red-600 font-bold hover:underline"
            >
              + เพิ่มรูปภาพอีก
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((img, idx) => (
              <div
                key={img.id}
                className="flex flex-col items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 shadow-sm"
              >
                <div className="flex w-full items-center justify-between px-1 mb-2 text-xs">
                  <span className="font-bold text-red-600">รูปที่ {idx + 1}</span>
                  <span className="text-slate-400 truncate max-w-[80px]">{img.file.name}</span>
                </div>

                <div className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800 mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.previewUrl}
                    alt={img.file.name}
                    className="max-h-full max-w-full object-contain shadow"
                  />
                </div>

                <div className="flex items-center justify-between w-full px-1">
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, 'left')}
                      className="p-1 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20"
                      title="สลับไปซ้าย"
                    >
                      <ArrowLeft size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === images.length - 1}
                      onClick={() => handleMove(idx, 'right')}
                      className="p-1 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20"
                      title="สลับไปขวา"
                    >
                      <ArrowRight size={14} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(img.id)}
                    className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                    title="ลบรูปนี้"
                  >
                    <Trash2 size={14} />
                  </button>
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
              onClick={handleConvert}
              className="px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-500/20 transition"
            >
              แปลง {images.length} รูปเป็น PDF ทันที
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <>
          {resultUrl ? (
            <PdfResult
              downloadUrl={resultUrl}
              filename="converted_images.pdf"
              fileSizeBytes={resultSize}
              message="แปลงรูปภาพเป็นเอกสาร PDF สำเร็จแล้ว!"
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
