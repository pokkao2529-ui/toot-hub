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
import { Stamp, Sparkles } from 'lucide-react';

export default function WatermarkPage() {
  const tool = getToolBySlug('watermark')!;

  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageGridItem[]>([]);
  const [text, setText] = useState('CONFIDENTIAL');
  const [opacity, setOpacity] = useState<number>(0.25);
  const [rotation, setRotation] = useState<number>(45);
  const [fontSize, setFontSize] = useState<number>(44);
  const [colorHex, setColorHex] = useState<'red' | 'gray' | 'blue'>('red');
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
      const thumbs = await pdfService.renderThumbnails(selectedFile, 100);
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

  const handleApplyWatermark = async () => {
    if (!file) return;
    if (!text.trim()) {
      setError('กรุณาพิมพ์ข้อความลายน้ำที่ต้องการใส่');
      return;
    }

    const selectedPages = targetScope === 'selected'
      ? pages.filter((p) => p.selected).map((p) => p.originalPageNumber)
      : undefined;

    if (targetScope === 'selected' && (!selectedPages || selectedPages.length === 0)) {
      setError('กรุณาเลือกหน้าที่ต้องการใส่ลายน้ำอย่างน้อย 1 หน้า');
      return;
    }

    setError(null);
    setStep(3);
    setProgress(20);
    setProgressMsg('กำลังพิมพ์ลายน้ำลงในเอกสาร PDF...');

    // Color RGB mapping
    const colorMap = {
      red: { r: 0.85, g: 0.1, b: 0.1 },
      gray: { r: 0.4, g: 0.4, b: 0.4 },
      blue: { r: 0.1, g: 0.3, b: 0.85 },
    }[colorHex];

    try {
      const res = await pdfService.watermark(file, {
        text: text.trim(),
        opacity,
        rotation,
        fontSize,
        color: colorMap,
        pages: selectedPages,
        onProgress: (p, msg) => {
          setProgress(p);
          setProgressMsg(msg);
        },
      });

      const url = URL.createObjectURL(res.blob);
      setResultUrl(url);
      setResultSize(res.size);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการใส่ลายน้ำ');
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
          title="เลือกไฟล์ PDF เพื่อใส่ลายน้ำ"
          subtitle="ป้องกันการคัดลอกเอกสารด้วยข้อความลายน้ำคมชัด ปรับความโปร่งแสงได้"
        />
      )}

      {step === 2 && (
        <div className="space-y-6">
          {/* Watermark text and presets */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
              ข้อความลายน้ำ (Watermark Text)
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="เช่น CONFIDENTIAL, สำเนาถูกต้อง, ห้ามเผยแพร่"
              className="w-full text-base px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:border-red-500 font-bold mb-3"
            />

            {/* Presets */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">ข้อความสำเร็จรูป:</span>
              {['CONFIDENTIAL', 'DRAFT', 'SAMPLE', 'สำเนาถูกต้อง', 'ห้ามคัดลอก'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setText(preset)}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-red-500 transition"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Style Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                มุมเอียง (Rotation)
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRotation(45)}
                  className={`flex-1 py-2 rounded-lg font-bold transition ${
                    rotation === 45
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 border text-slate-700 dark:text-slate-300'
                  }`}
                >
                  แนวทแยง 45°
                </button>
                <button
                  type="button"
                  onClick={() => setRotation(0)}
                  className={`flex-1 py-2 rounded-lg font-bold transition ${
                    rotation === 0
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 border text-slate-700 dark:text-slate-300'
                  }`}
                >
                  แนวนอน 0°
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                ความโปร่งใส (Opacity)
              </label>
              <div className="flex gap-2">
                {[
                  { label: 'จางมาก (15%)', val: 0.15 },
                  { label: 'พอดี (25%)', val: 0.25 },
                  { label: 'ชัดเจน (50%)', val: 0.5 },
                ].map((o) => (
                  <button
                    key={o.val}
                    type="button"
                    onClick={() => setOpacity(o.val)}
                    className={`flex-1 py-2 rounded-lg font-semibold transition ${
                      opacity === o.val
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 border text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                สีตัวอักษร (Color)
              </label>
              <div className="flex gap-2">
                {[
                  { label: 'แดง', val: 'red' },
                  { label: 'เทาเข้ม', val: 'gray' },
                  { label: 'น้ำเงิน', val: 'blue' },
                ].map((c) => (
                  <button
                    key={c.val}
                    type="button"
                    onClick={() => setColorHex(c.val as 'red' | 'gray' | 'blue')}
                    className={`flex-1 py-2 rounded-lg font-semibold transition ${
                      colorHex === c.val
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 border text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Scope Selector */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              ขอบเขตหน้า:
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTargetScope('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  targetScope === 'all'
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                }`}
              >
                ทุกหน้า ({pages.length})
              </button>
              <button
                type="button"
                onClick={() => setTargetScope('selected')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  targetScope === 'selected'
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                }`}
              >
                เฉพาะหน้าที่เลือก ({selectedCount})
              </button>
            </div>
          </div>

          {targetScope === 'selected' && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500">
                คลิกเลือกหน้าที่ต้องการประทับลายน้ำ:
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
              onClick={handleApplyWatermark}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-500/20 transition"
            >
              <Stamp size={18} />
              <span>ใส่ลายน้ำทันที</span>
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <>
          {resultUrl ? (
            <PdfResult
              downloadUrl={resultUrl}
              filename="watermarked_document.pdf"
              fileSizeBytes={resultSize}
              message="ใส่ลายน้ำลงในเอกสาร PDF สำเร็จแล้ว!"
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
