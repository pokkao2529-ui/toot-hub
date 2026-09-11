'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  RefreshCw,
  Upload,
  Download,
  Trash2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Archive,
  ArrowRight,
  ImageIcon,
  RotateCcw,
  HelpCircle,
  Zap,
} from 'lucide-react';
import {
  convertMultipleImages,
  createConvertedImagesZip,
  formatBytes,
  type TargetImageFormat,
  type ConvertedImageResult,
} from '@/services/image';
import { AdBanner } from '@/components/ads/AdBanner';
import { JsonLd } from '@/components/seo/JsonLd';
import { Footer } from '@/components/layout/Footer';

export default function ImageConverterPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [targetFormat, setTargetFormat] = useState<TargetImageFormat>('image/webp');
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [results, setResults] = useState<ConvertedImageResult[]>([]);
  const [isZipping, setIsZipping] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFilesAdded = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const validImages = Array.from(newFiles).filter((f) => f.type.startsWith('image/'));
    if (validImages.length === 0) return;

    setFiles((prev) => [...prev, ...validImages]);
    setResults([]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setFiles([]);
    setResults([]);
    setProgress(null);
  };

  const handleConvert = async () => {
    if (files.length === 0) return;

    setIsConverting(true);
    setProgress({ current: 0, total: files.length });

    try {
      const convertedList = await convertMultipleImages(
        files,
        {
          targetFormat,
          quality: 0.92,
        },
        (current, total) => {
          setProgress({ current, total });
        }
      );
      setResults(convertedList);
    } catch (err) {
      console.error('Conversion failed:', err);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownloadSingle = (item: ConvertedImageResult) => {
    const isMobile =
      typeof window !== 'undefined' &&
      (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
        (navigator.maxTouchPoints && navigator.maxTouchPoints > 2));

    if (isMobile && typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
      try {
        const file = new File([item.convertedBlob], item.outputName, {
          type: item.targetFormat,
        });
        if (navigator.canShare({ files: [file] })) {
          navigator.share({
            files: [file],
            title: item.outputName,
          });
          return;
        }
      } catch (e) {}
    }

    const a = document.createElement('a');
    a.href = item.previewUrl;
    a.download = item.outputName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadAllZip = async () => {
    if (results.length === 0) return;

    setIsZipping(true);
    try {
      const zipBlob = await createConvertedImagesZip(results);
      const filename = `converted-images-toolhub-${Date.now()}.zip`;
      
      const isMobile =
        typeof window !== 'undefined' &&
        (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
          (navigator.maxTouchPoints && navigator.maxTouchPoints > 2));
      const isInApp = typeof navigator !== 'undefined' && /Line|FBAN|FBAV|Instagram|MicroMessenger/i.test(navigator.userAgent);

      if ((isMobile || isInApp) && typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
        try {
          const file = new File([zipBlob], filename, { type: 'application/zip' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: filename,
            });
            return;
          }
        } catch (e) {
          console.warn('Native share failed', e);
        }
      }

      if (isInApp) {
        alert('⚠️ ไม่สามารถดาวน์โหลดไฟล์ ZIP ในแอปนี้ได้โดยตรง\n\n👉 กรุณากดปุ่มเมนู (จุด 3 จุด) มุมขวาบน\n👉 เลือก "เปิดในเบราว์เซอร์" (Open in Browser) เพื่อดาวน์โหลดไฟล์ของคุณครับ');
        return;
      }

      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 3000);
    } catch (err) {
      console.error('Failed to create ZIP:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const getFormatLabel = (mime: string) => {
    if (mime === 'image/webp') return 'WebP';
    if (mime === 'image/png') return 'PNG';
    return 'JPG';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <JsonLd
        title="แปลงไฟล์รูปภาพออนไลน์ฟรี (JPG ↔ PNG ↔ WebP) — TOOL HUB"
        description="เครื่องมือแปลงไฟล์รูปภาพออนไลน์ฟรี ไม่จำกัดไฟล์ แปลง JPG เป็น PNG, PNG เป็น JPG, หรือแปลงเป็น WebP ในเครื่องผู้ใช้ทันที ไม่ต้องรอคิวเซิร์ฟเวอร์"
        url="/tools/image/convert"
      />

      {/* Header */}
      <header className="w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="text-2xl font-black bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 bg-clip-text text-transparent"
            >
              TOOL HUB
            </Link>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <Link
              href="/tools/image/compress"
              className="text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-rose-600 flex items-center gap-1.5 transition"
            >
              <ImageIcon size={18} className="text-rose-600" />
              <span>Image Suite</span>
            </Link>
          </div>

          <div className="flex items-center space-x-3 text-xs font-semibold">
            <Link
              href="/tools/image/compress"
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              ⚡ บีบอัดรูปภาพ
            </Link>
            <Link
              href="/tools/qrcode"
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              🔳 QR Code
            </Link>
          </div>
        </div>
      </header>

      {/* Top Banner Ad Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-4">
        <AdBanner slotId="top-banner-image-convert" format="horizontal" />
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Title Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 dark:bg-rose-950/60 px-4 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 mb-3">
            <Sparkles size={14} />
            <span>แปลงไฟล์ในเครื่องทันที • ไม่ต้องรอคิวเซิร์ฟเวอร์ • ฟรี 100%</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-3">
            แปลงไฟล์รูปภาพออนไลน์ (Image Converter)
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            แปลงไฟล์ภาพ JPG เป็น PNG, PNG เป็น JPG, หรือแปลงเป็น WebP ยุคใหม่ได้พร้อมกันหลายไฟล์ คมชัดสูง ปลอดภัย ไม่ต้องอัปโหลดข้อมูล
          </p>
        </div>

        {/* Upload Dropzone */}
        {results.length === 0 && (
          <div className="max-w-3xl mx-auto mb-10">
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFilesAdded(e.dataTransfer.files);
              }}
              className="border-2 border-dashed border-rose-300 dark:border-rose-900/60 hover:border-rose-500 dark:hover:border-rose-500 rounded-3xl p-8 sm:p-12 text-center bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition cursor-pointer group"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => handleFilesAdded(e.target.files)}
              />

              <div className="h-16 w-16 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <RefreshCw size={32} />
              </div>

              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">
                ลากและวางรูปภาพที่นี่ หรือ <span className="text-rose-600 underline">คลิกเพื่อเลือกไฟล์</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                รองรับไฟล์ JPG, PNG, WebP, GIF (เลือกพร้อมกันได้หลายไฟล์ ไม่จำกัดจำนวน)
              </p>
            </div>
          </div>
        )}

        {/* File Queue & Format Settings */}
        {files.length > 0 && results.length === 0 && (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Target Format Selector */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                เลือกรูปแบบไฟล์ที่ต้องการแปลง:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'image/webp',
                    name: 'แปลงเป็น WebP (แนะนำ ⭐️)',
                    desc: 'ไฟล์เล็กที่สุด โหลดเว็บเร็ว รองรับโปร่งใส',
                  },
                  {
                    id: 'image/jpeg',
                    name: 'แปลงเป็น JPG / JPEG',
                    desc: 'มาตรฐานสากล ใช้งานได้ทุกอุปกรณ์และระบบ',
                  },
                  {
                    id: 'image/png',
                    name: 'แปลงเป็น PNG',
                    desc: 'คมชัดสูงสุด รักษาพื้นหลังโปร่งใส',
                  },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setTargetFormat(fmt.id as TargetImageFormat)}
                    className={`p-4 rounded-2xl border text-left transition ${
                      targetFormat === fmt.id
                        ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 ring-2 ring-rose-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                      {fmt.name}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{fmt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Files Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                รายการไฟล์ ({files.length} รูป)
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                >
                  + เพิ่มรูปภาพอีก
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs font-semibold text-slate-400 hover:text-red-500"
                >
                  ล้างทั้งหมด
                </button>
              </div>
            </div>

            {/* Files Grid Preview */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {files.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  className="relative group p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                  <button
                    onClick={() => removeFile(idx)}
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"
                    title="ลบไฟล์นี้"
                  >
                    <Trash2 size={13} />
                  </button>
                  <div className="aspect-video bg-slate-100 dark:bg-slate-950 rounded-xl flex items-center justify-center overflow-hidden mb-2">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs font-bold truncate text-slate-800 dark:text-slate-200">
                    {file.name}
                  </p>
                  <p className="text-[10px] text-slate-400">{formatBytes(file.size)}</p>
                </div>
              ))}
            </div>

            {/* Action Convert Button */}
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={handleConvert}
                disabled={isConverting}
                className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 disabled:opacity-50 text-white font-bold text-base shadow-lg shadow-rose-500/25 transition flex items-center justify-center gap-2 mx-auto"
              >
                {isConverting ? (
                  <>
                    <RotateCcw size={20} className="animate-spin" />
                    <span>กำลังแปลง ({progress?.current}/{progress?.total})...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={20} />
                    <span>แปลงเป็น {getFormatLabel(targetFormat)} ทันที ({files.length} รูป)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Completed Results View */}
        {results.length > 0 && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
            {/* Header Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-rose-600 to-red-700 text-white shadow-xl shadow-rose-600/20 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-2">
                  <CheckCircle2 size={14} />
                  <span>แปลงไฟล์สำเร็จทั้งหมด {results.length} รูปภาพ!</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-black">
                  เป็นฟอร์แมต {getFormatLabel(targetFormat)} เรียบร้อย
                </h2>
                <p className="text-xs sm:text-sm text-rose-100 mt-1">
                  ดาวน์โหลดไฟล์ไปใช้งานได้ทันที คมชัด คุณภาพระดับต้นฉบับ
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                {results.length > 1 && (
                  <button
                    type="button"
                    onClick={handleDownloadAllZip}
                    disabled={isZipping}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white text-rose-600 hover:bg-rose-50 font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                  >
                    <Archive size={18} />
                    <span>{isZipping ? 'กำลังแพ็ค ZIP...' : 'ดาวน์โหลดทั้งหมดเป็น .ZIP'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={clearAll}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-rose-800/60 hover:bg-rose-800 text-white font-semibold text-xs border border-white/20 transition flex items-center justify-center gap-1.5"
                >
                  <RotateCcw size={15} />
                  <span>แปลงไฟล์ชุดใหม่</span>
                </button>
              </div>
            </div>

            {/* Results Grid List */}
            <div className="space-y-3">
              {results.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-14 w-14 rounded-xl bg-slate-100 dark:bg-slate-950 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800">
                      <img
                        src={item.previewUrl}
                        alt={item.outputName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate text-slate-900 dark:text-white">
                        {item.outputName}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>เดิม {formatBytes(item.originalSize)}</span>
                        <span>→</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {formatBytes(item.convertedSize)}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold text-[11px] border border-rose-200 dark:border-rose-900">
                          {getFormatLabel(item.targetFormat)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownloadSingle(item)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-700 dark:text-slate-200 font-bold text-xs transition flex items-center gap-1.5 self-end sm:self-center"
                  >
                    <Download size={15} />
                    <span>ดาวน์โหลด</span>
                  </button>
                </div>
              ))}
            </div>

            {/* High CTR AdSense Placement */}
            <div className="pt-4">
              <AdBanner slotId="image-convert-download-bottom" format="horizontal" />
            </div>
          </div>
        )}

        {/* SEO FAQ Section */}
        <section className="mt-20 pt-12 border-t border-slate-200 dark:border-slate-800 max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 text-center">
            คำถามที่พบบ่อยเกี่ยวกับการแปลงไฟล์รูปภาพ (FAQ)
          </h2>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
                <HelpCircle size={16} className="text-rose-600" />
                <span>การแปลงภาพเป็น PNG กับ JPG ต่างกันอย่างไร เมื่อไหร่ควรใช้แบบไหน?</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                ไฟล์ PNG เหมาะกับงานโลโก้ ไอคอน หรือกราฟิกที่ต้องการพื้นหลังโปร่งใสและรักษาความคมชัดของเส้นขอบ ส่วน JPG เหมาะกับภาพถ่ายทั่วไปที่มีรายละเอียดสีซับซ้อนและต้องการขนาดไฟล์ที่กะทัดรัด
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
                <HelpCircle size={16} className="text-rose-600" />
                <span>ทำไมการแปลงไฟล์ใน TOOL HUB ถึงเร็วกว่าเว็บอื่นๆ มาก?</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                เพราะ TOOL HUB ใช้เทคโนโลยีประมวลผลบนเบราว์เซอร์ของเครื่องคุณโดยตรง (Client-side HTML5 Canvas) ไม่ต้องเสียเวลาอัปโหลดภาพขนาดใหญ่ขึ้นเซิร์ฟเวอร์ และไม่ต้องรอคิวประมวลผลร่วมกับคนอื่น แปลงเสร็จได้ในเสี้ยววินาที
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
