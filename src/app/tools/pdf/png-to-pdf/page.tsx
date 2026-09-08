'use client';

import React, { useState, useEffect } from 'react';
import { getToolBySlug } from '@/config/pdf-tools';
import { pdfService } from '@/services/pdf';
import { PdfToolLayout } from '@/components/pdf/PdfToolLayout';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import { PdfProgress } from '@/components/pdf/PdfProgress';
import { PdfResult } from '@/components/pdf/PdfResult';
import { PdfError } from '@/components/pdf/PdfError';
import { ArrowLeft, ArrowRight, Trash2, Image as ImageIcon, Sparkles, Layers } from 'lucide-react';

interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
}

export default function PngToPdfPage() {
  const tool = getToolBySlug('png-to-pdf')!;

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
      const isImg = f.type === 'image/png' || f.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(f.name);
      return isImg && f.size <= tool.maxFileSize;
    });

    if (validImages.length === 0) {
      setError('กรุณาเลือกไฟล์ภาพ PNG (หรือ JPG/WebP) ที่มีขนาดไม่เกิน 25 MB');
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
    setProgressMsg('กำลังเตรียมการแปลงรูปภาพ PNG เป็นเอกสาร PDF...');

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
      setProgress(100);
      setProgressMsg('แปลงภาพ PNG เป็น PDF สำเร็จแล้ว!');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการแปลงไฟล์');
      setStep(2);
    }
  };

  const handleReset = () => {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setImages([]);
    setResultUrl(null);
    setResultSize(0);
    setProgress(0);
    setError(null);
    setStep(1);
  };

  const faqs = [
    {
      question: 'แปลงไฟล์ PNG ที่มีพื้นหลังโปร่งใสแล้วจะเกิดขอบดำหรือพื้นหลังสีดำไหม?',
      answer:
        'ไม่เกิดแน่นอนครับ ระบบจัดการความโปร่งใส (Alpha Transparency) อย่างถูกต้อง โดยจัดวางลงบนหน้ากระดาษเอกสารสีขาวอย่างเรียบเนียน คมชัด สวยงามตรงตามภาพต้นฉบับ',
    },
    {
      question: 'สามารถเลือกขนาดหน้ากระดาษเป็นแบบไหนได้บ้าง?',
      answer:
        'คุณสามารถเลือกได้ 2 แบบคือ "ขนาดมาตรฐาน A4" (เหมาะกับการพิมพ์เอกสารหรือส่งงาน) หรือ "ขนาดพอดีรูปภาพ (Fit to Image)" เพื่อคงสัดส่วนเดิมของรูปภาพไว้โดยไม่มีขอบขาว',
    },
    {
      question: 'ไฟล์ที่อัปโหลดปลอดภัยหรือไม่ มีการเก็บข้อมูลบนเซิร์ฟเวอร์ไหม?',
      answer:
        'ปลอดภัย 100% ครับ ระบบของ TOOL HUB ทำงานแบบ Client-Side ภายในเว็บเบราว์เซอร์ของเครื่องคุณทั้งหมด รูปภาพไม่เคยถูกอัปโหลดขึ้นเซิร์ฟเวอร์ภายนอก จึงมั่นใจในความเป็นส่วนตัวได้เต็มที่',
    },
  ];

  return (
    <PdfToolLayout tool={tool} currentStep={step} faqs={faqs}>
      {/* Error Alert */}
      {error && (
        <div className="mb-6">
          <PdfError message={error} onReset={handleReset} />
        </div>
      )}

      {/* Step 1: Upload */}
      {step === 1 && (
        <div>
          <PdfDropzone
            onFilesSelected={handleFilesSelected}
            accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
            maxFiles={tool.maxFiles}
            maxFileSizeMb={Math.round(tool.maxFileSize / (1024 * 1024))}
            multiple={true}
            title="เลือกหรือลากรูปภาพ PNG มาวางที่นี่"
            subtitle="รองรับภาพ PNG พื้นหลังโปร่งใส และภาพถ่ายทั่วไป (สูงสุด 30 รูป)"
          />
        </div>
      )}

      {/* Step 2: Settings & Reorder */}
      {step === 2 && (
        <div className="space-y-8">
          {/* Controls Bar */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Page Size */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                ขนาดหน้าเอกสาร
              </label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as 'A4' | 'fit-image')}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-red-500 outline-none"
              >
                <option value="A4">มาตรฐานกระดาษ A4</option>
                <option value="fit-image">ขนาดพอดีรูปภาพ (Fit to Image)</option>
              </select>
            </div>

            {/* Orientation */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                ทิศทางหน้ากระดาษ
              </label>
              <select
                disabled={pageSize === 'fit-image'}
                value={orientation}
                onChange={(e) => setOrientation(e.target.value as 'portrait' | 'landscape')}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-red-500 outline-none disabled:opacity-50"
              >
                <option value="portrait">แนวตั้ง (Portrait)</option>
                <option value="landscape">แนวนอน (Landscape)</option>
              </select>
            </div>

            {/* Margins */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                ระยะขอบกระดาษ (Margin)
              </label>
              <select
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-red-500 outline-none"
              >
                <option value={0}>ไม่มีขอบ (0 px)</option>
                <option value={20}>ขอบขนาดเล็ก (20 px)</option>
                <option value={40}>ขอบมาตรฐาน (40 px)</option>
              </select>
            </div>
          </div>

          {/* Image Grid with Reordering */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ImageIcon size={15} className="text-red-600" />
                <span>รูปภาพที่เลือก ({images.length} รูป) — สามารถคลิกเลื่อนลำดับหน้าได้</span>
              </span>
              <label className="text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer flex items-center gap-1">
                <span>+ เพิ่มรูปภาพอีก</span>
                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => handleFilesSelected(Array.from(e.target.files || []))}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {images.map((item, idx) => (
                <div
                  key={item.id}
                  className="relative group p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-between"
                >
                  <div className="w-full h-28 relative rounded-lg overflow-hidden bg-white dark:bg-slate-900 flex items-center justify-center mb-2 border border-slate-100 dark:border-slate-800">
                    <img
                      src={item.previewUrl}
                      alt={item.file.name}
                      className="max-h-full max-w-full object-contain"
                    />
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white font-bold text-[10px]">
                      หน้า {idx + 1}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-500 truncate w-full text-center mb-2">
                    {item.file.name}
                  </p>

                  <div className="flex items-center gap-1 w-full justify-between">
                    <button
                      onClick={() => handleMove(idx, 'left')}
                      disabled={idx === 0}
                      className="p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 text-[10px]"
                      title="เลื่อนไปซ้าย"
                    >
                      <ArrowLeft size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 rounded bg-red-50 dark:bg-red-950/40 text-red-600 hover:bg-red-100 transition"
                      title="ลบรูปนี้"
                    >
                      <Trash2 size={12} />
                    </button>
                    <button
                      onClick={() => handleMove(idx, 'right')}
                      disabled={idx === images.length - 1}
                      className="p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 text-[10px]"
                      title="เลื่อนไปขวา"
                    >
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={handleReset}
              className="text-xs font-semibold text-slate-500 hover:text-red-600 transition"
            >
              ยกเลิกและเลือกรูปใหม่
            </button>
            <button
              onClick={handleConvert}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-500/20 transition flex items-center justify-center gap-2"
            >
              <span>แปลงเป็น PDF เดี๋ยวนี้ ({images.length} หน้า)</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Progress & Result */}
      {step === 3 && (
        <div>
          {progress < 100 ? (
            <PdfProgress progress={progress} message={progressMsg} />
          ) : (
            <PdfResult
              downloadUrl={resultUrl!}
              filename="converted-images.pdf"
              fileSizeBytes={resultSize}
              message="แปลงรูปภาพ PNG เป็นเอกสาร PDF สำเร็จแล้ว!"
              onReset={handleReset}
            />
          )}
        </div>
      )}
    </PdfToolLayout>
  );
}
