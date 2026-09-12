'use client';

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  ImageIcon,
  Upload,
  Download,
  Trash2,
  Sparkles,
  ShieldCheck,
  Zap,
  Sliders,
  CheckCircle2,
  Archive,
  ArrowRight,
  FileText,
  RotateCcw,
  Share2,
  HelpCircle,
  Layers,
} from 'lucide-react';
import {
  compressMultipleImages,
  createCompressedImagesZip,
  formatBytes,
  type CompressedResult,
} from '@/services/image';
import { AdBanner } from '@/components/ads/AdBanner';
import { JsonLd } from '@/components/seo/JsonLd';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';

type CompressionPreset = 'balanced' | 'high' | 'small' | 'custom';
type OutputFormatOption = 'original' | 'image/webp' | 'image/jpeg';

export default function ImageCompressPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [preset, setPreset] = useState<CompressionPreset>('balanced');
  const [quality, setQuality] = useState<number>(0.8);
  const [outputFormat, setOutputFormat] = useState<OutputFormatOption>('image/webp');
  const [maxWidth, setMaxWidth] = useState<number | undefined>(undefined);

  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [results, setResults] = useState<CompressedResult[]>([]);
  const [isZipping, setIsZipping] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle Preset Change
  const handlePresetChange = (newPreset: CompressionPreset) => {
    setPreset(newPreset);
    if (newPreset === 'balanced') setQuality(0.8);
    else if (newPreset === 'high') setQuality(0.9);
    else if (newPreset === 'small') setQuality(0.6);
  };

  // Handle File Drop / Select
  const handleFilesAdded = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const validImages = Array.from(newFiles).filter((f) =>
      f.type.startsWith('image/')
    );
    if (validImages.length === 0) return;

    setFiles((prev) => [...prev, ...validImages]);
    setResults([]); // Reset previous results if new files added
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setFiles([]);
    setResults([]);
    setProgress(null);
  };

  // Run Compression
  const handleCompress = async () => {
    if (files.length === 0) return;

    setIsCompressing(true);
    setProgress({ current: 0, total: files.length });

    try {
      const compressedList = await compressMultipleImages(
        files,
        {
          quality,
          maxWidth,
          outputFormat,
        },
        (current, total) => {
          setProgress({ current, total });
        }
      );
      setResults(compressedList);
    } catch (err) {
      console.error('Compression failed:', err);
    } finally {
      setIsCompressing(false);
    }
  };

  // Download Single File
  const handleDownloadSingle = (item: CompressedResult) => {
    const isMobile =
      typeof window !== 'undefined' &&
      (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
        (navigator.maxTouchPoints && navigator.maxTouchPoints > 2));

    if (isMobile && typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
      try {
        const file = new File([item.compressedBlob], item.outputName, {
          type: item.mimeType,
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

  // Download All as ZIP
  const handleDownloadAllZip = async () => {
    if (results.length === 0) return;

    setIsZipping(true);
    try {
      const zipBlob = await createCompressedImagesZip(results);
      const filename = `compressed-images-toolhub-${Date.now()}.zip`;
      
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

  // Calculate Overall Statistics
  const totalOriginalSize = results.reduce((acc, r) => acc + r.originalSize, 0);
  const totalCompressedSize = results.reduce((acc, r) => acc + r.compressedSize, 0);
  const totalSavedBytes = totalOriginalSize - totalCompressedSize;
  const overallReduction =
    totalOriginalSize > 0
      ? Math.max(0, Math.round((totalSavedBytes / totalOriginalSize) * 100))
      : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <JsonLd
        title="บีบอัดรูปภาพออนไลน์ฟรี (Compress Image JPG/PNG/WebP) — TOOL HUB"
        description="ลดขนาดรูปภาพออนไลน์ฟรี ไม่จำกัดจำนวนไฟล์ บีบอัดไฟล์ JPG, PNG, WebP ให้เล็กลงสูงสุด 80% คมชัดเหมือนเดิม ปลอดภัยในเครื่องคุณ 100%"
        url="/tools/image/compress"
      />

      {/* Header */}
      <Header />

      {/* Top Banner Ad Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-4">
        <AdBanner slotId="top-banner-image-compress" format="horizontal" />
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Title Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 dark:bg-rose-950/60 px-4 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 mb-3">
            <Sparkles size={14} />
            <span>ฟรี 100% • บีบอัดในเครื่อง ไม่ต้องอัปโหลดขึ้นเซิร์ฟเวอร์</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-3">
            บีบอัดรูปภาพออนไลน์ (Compress Image)
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            ลดขนาดไฟล์ภาพ JPG, PNG, WebP ให้เล็กลงสูงสุด 80% โดยยังคงความคมชัดสูง บีบอัดได้ทีละหลายรูปพร้อมกัน ดาวน์โหลดไฟล์เดี่ยวหรือไฟล์ ZIP ได้ทันที
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
                <Upload size={32} />
              </div>

              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">
                ลากและวางรูปภาพที่นี่ หรือ <span className="text-rose-600 underline">คลิกเพื่อเลือกไฟล์</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                รองรับไฟล์ JPG, PNG, WebP (เลือกพร้อมกันได้หลายไฟล์ ไม่จำกัดขนาด)
              </p>
            </div>
          </div>
        )}

        {/* File Queue & Compression Settings (When files are chosen) */}
        {files.length > 0 && results.length === 0 && (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Compression Settings Card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <Sliders size={18} className="text-rose-600" />
                <span>ตั้งค่าระดับการบีบอัด</span>
              </div>

              {/* Presets Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'balanced',
                    title: 'สมดุล (แนะนำ ⭐️)',
                    desc: 'ลดขนาด 60-80% คมชัดสวยงาม',
                    q: '80%',
                  },
                  {
                    id: 'high',
                    title: 'คุณภาพสูง',
                    desc: 'ลดขนาด 30-50% เน้นรายละเอียด',
                    q: '90%',
                  },
                  {
                    id: 'small',
                    title: 'ไฟล์เล็กพิเศษ',
                    desc: 'ลดขนาด 80-90% เหมาะส่งอีเมล',
                    q: '60%',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handlePresetChange(item.id as CompressionPreset)}
                    className={`p-4 rounded-2xl border text-left transition ${
                      preset === item.id
                        ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 ring-2 ring-rose-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {item.title}
                      </span>
                      <span className="text-xs font-mono font-bold text-rose-600">
                        {item.q}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                  </button>
                ))}
              </div>

              {/* Custom Quality Slider */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600 dark:text-slate-400">
                    ปรับเปอร์เซ็นต์คุณภาพเอง (Custom Quality):
                  </span>
                  <span className="font-mono font-bold text-rose-600">
                    {Math.round(quality * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.95"
                  step="0.05"
                  value={quality}
                  onChange={(e) => {
                    setQuality(parseFloat(e.target.value));
                    setPreset('custom');
                  }}
                  className="w-full accent-rose-600 cursor-pointer"
                />
              </div>

              {/* Format & Scaling Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    รูปแบบไฟล์ผลลัพธ์:
                  </label>
                  <select
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value as OutputFormatOption)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                  >
                    <option value="image/webp">WebP (แนะนำ! ขนาดเล็กที่สุด โหลดเว็บเร็ว)</option>
                    <option value="image/jpeg">JPG / JPEG (มาตรฐานทั่วไป)</option>
                    <option value="original">คงฟอร์แมตเดิมของไฟล์</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    จำกัดความกว้างสูงสุด (Max Width):
                  </label>
                  <select
                    value={maxWidth || ''}
                    onChange={(e) =>
                      setMaxWidth(e.target.value ? parseInt(e.target.value, 10) : undefined)
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                  >
                    <option value="">คงขนาดพิกเซลเดิม (ไม่ลดขนาดความกว้าง)</option>
                    <option value="1920">1920 px (Full HD)</option>
                    <option value="1280">1280 px (HD - ขนาดเหมาะลงเว็บ)</option>
                    <option value="800">800 px (สำหรับ Thumbnail หรือบล็อก)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Selected Files List Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                รายการไฟล์ที่เลือก ({files.length} รูป)
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

            {/* Action Compress Button */}
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={handleCompress}
                disabled={isCompressing}
                className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 disabled:opacity-50 text-white font-bold text-base shadow-lg shadow-rose-500/25 transition flex items-center justify-center gap-2 mx-auto"
              >
                {isCompressing ? (
                  <>
                    <RotateCcw size={20} className="animate-spin" />
                    <span>กำลังบีบอัด ({progress?.current}/{progress?.total})...</span>
                  </>
                ) : (
                  <>
                    <Zap size={20} />
                    <span>เริ่มบีบอัด {files.length} รูปภาพทันที</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Compression Completed Results View */}
        {results.length > 0 && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
            {/* Big Statistics Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-rose-600 to-red-700 text-white shadow-xl shadow-rose-600/20">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-2">
                    <CheckCircle2 size={14} />
                    <span>บีบอัดสำเร็จทั้งหมด {results.length} รูปภาพ!</span>
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black">
                    ประหยัดพื้นที่ได้ {overallReduction}%
                  </h2>
                  <p className="text-xs sm:text-sm text-rose-100 mt-1">
                    จากเดิม {formatBytes(totalOriginalSize)} เหลือเพียง{' '}
                    <span className="font-bold underline text-white">
                      {formatBytes(totalCompressedSize)}
                    </span>{' '}
                    (ลดขนาดลงไป {formatBytes(totalSavedBytes)})
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
                    <span>บีบอัดรูปชุดใหม่</span>
                  </button>
                </div>
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
                        <span className="line-through">{formatBytes(item.originalSize)}</span>
                        <span>→</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {formatBytes(item.compressedSize)}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] border border-emerald-200 dark:border-emerald-900">
                          ลดลง {item.reductionPercentage}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleDownloadSingle(item)}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-700 dark:text-slate-200 font-bold text-xs transition flex items-center gap-1.5"
                    >
                      <Download size={15} />
                      <span>ดาวน์โหลด</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* High CTR AdSense Placement below Results */}
            <div className="pt-4">
              <AdBanner slotId="image-compress-download-bottom" format="horizontal" />
            </div>
          </div>
        )}

        {/* SEO & FAQ Section */}
        <section className="mt-20 pt-12 border-t border-slate-200 dark:border-slate-800 max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 text-center">
            คำถามที่พบบ่อยเกี่ยวกับการบีบอัดรูปภาพ (FAQ)
          </h2>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
                <HelpCircle size={16} className="text-rose-600" />
                <span>บีบอัดรูปภาพแล้ว ความชัดจะลดลงจนมองเห็นได้ชัดหรือไม่?</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                ไม่เลยครับ! โหมดสมดุล (80%) ใช้อัลกอริทึมการบีบอัดที่ตัดข้อมูลสีที่สายตามนุษย์แยกไม่ออกออกไป ทำให้ไฟล์ภาพเล็กลง 60-80% แต่ตายังมองเห็นภาพคมชัดสวยงามเหมือนเดิม เหมาะกับการใช้งานบนโซเชียล เว็บไซต์ และเอกสารทั่วไป
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
                <HelpCircle size={16} className="text-rose-600" />
                <span>รูปภาพที่บีบอัดปลอดภัยหรือไม่ ไฟล์ถูกส่งไปเก็บที่ไหน?</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                ปลอดภัย 100% ครับ ระบบของ TOOL HUB ทำงานแบบ Client-Side ภายในเบราว์เซอร์ของเครื่องคุณทั้งหมด รูปภาพไม่เคยถูกอัปโหลดขึ้นเซิร์ฟเวอร์ใดๆ แม้แต่กิโลไบต์เดียว จึงมั่นใจในความเป็นส่วนตัวได้อย่างสมบูรณ์
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
                <HelpCircle size={16} className="text-rose-600" />
                <span>ทำไมถึงแนะนำให้แปลงเป็นฟอร์แมต WebP?</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                WebP เป็นมาตรฐานไฟล์ภาพสมัยใหม่ที่พัฒนาโดย Google มีประสิทธิภาพการบีบอัดดีกว่า JPG เดิมถึง 30-50% และรองรับพื้นหลังโปร่งใสได้เหมือน PNG ปัจจุบันเบราว์เซอร์และโทรศัพท์มือถือทุกรุ่นสามารถเปิดดูไฟล์ WebP ได้อย่างราบรื่น
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
