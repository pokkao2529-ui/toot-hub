'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Maximize2,
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
  RotateCcw,
  Crop,
  Lock,
  Unlock,
  Layers,
  HelpCircle,
  FileImage,
  Check,
  ChevronDown,
  Info,
} from 'lucide-react';
import {
  RESIZE_PRESETS,
  resizeMultipleImages,
  createResizedImagesZip,
  formatBytes,
  type ImagePreset,
  type ResizeMode,
  type ResizeFit,
  type OutputFormatOption,
  type ResizedResult,
} from '@/services/image';
import { AdBanner } from '@/components/ads/AdBanner';
import { JsonLd } from '@/components/seo/JsonLd';
import { Footer } from '@/components/layout/Footer';

export default function ImageResizePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<{ url: string; width: number; height: number }[]>([]);

  // Resize Configuration State
  const [mode, setMode] = useState<ResizeMode>('preset');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('id-1-5-inch');
  const [customWidth, setCustomWidth] = useState<number>(800);
  const [customHeight, setCustomHeight] = useState<number>(800);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState<boolean>(true);
  const [percent, setPercent] = useState<number>(50);
  const [fit, setFit] = useState<ResizeFit>('cover');
  const [outputFormat, setOutputFormat] = useState<OutputFormatOption>('original');
  const [quality, setQuality] = useState<number>(0.92);

  // Preset Filter
  const [presetCategory, setPresetCategory] = useState<'all' | 'id-photo' | 'social' | 'print'>('all');

  // Execution state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [results, setResults] = useState<ResizedResult[]>([]);
  const [isZipping, setIsZipping] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load preview dimensions when files change
  useEffect(() => {
    if (files.length === 0) {
      setImagePreviews([]);
      return;
    }

    let active = true;
    const loadedPreviews: { url: string; width: number; height: number }[] = [];

    const loadImages = async () => {
      for (const file of files) {
        const url = URL.createObjectURL(file);
        const img = new Image();
        await new Promise<void>((resolve) => {
          img.onload = () => {
            if (active) {
              loadedPreviews.push({
                url,
                width: img.naturalWidth || img.width,
                height: img.naturalHeight || img.height,
              });
            }
            resolve();
          };
          img.onerror = () => {
            if (active) {
              loadedPreviews.push({ url, width: 0, height: 0 });
            }
            resolve();
          };
          img.src = url;
        });
      }

      if (active) {
        setImagePreviews(loadedPreviews);
        // Initialize custom width/height from the first image if in pixel mode
        if (loadedPreviews[0] && loadedPreviews[0].width > 0) {
          setCustomWidth(loadedPreviews[0].width);
          setCustomHeight(loadedPreviews[0].height);
        }
      }
    };

    loadImages();

    return () => {
      active = false;
      loadedPreviews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [files]);

  // Handle Preset selection
  const handleSelectPreset = (preset: ImagePreset) => {
    setSelectedPresetId(preset.id);
    setFit(preset.recommendedFit);
  };

  // Handle File Input
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

  // Aspect ratio recalculator for pixel inputs
  const handleWidthChange = (newWidth: number) => {
    setCustomWidth(newWidth);
    if (maintainAspectRatio && imagePreviews[0] && imagePreviews[0].width > 0) {
      const ratio = imagePreviews[0].height / imagePreviews[0].width;
      setCustomHeight(Math.round(newWidth * ratio));
    }
  };

  const handleHeightChange = (newHeight: number) => {
    setCustomHeight(newHeight);
    if (maintainAspectRatio && imagePreviews[0] && imagePreviews[0].height > 0) {
      const ratio = imagePreviews[0].width / imagePreviews[0].height;
      setCustomWidth(Math.round(newHeight * ratio));
    }
  };

  // Run Resize
  const handleResize = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setProgress({ current: 0, total: files.length });

    let targetWidth = customWidth;
    let targetHeight = customHeight;
    let currentFit = fit;

    if (mode === 'preset') {
      const selected = RESIZE_PRESETS.find((p) => p.id === selectedPresetId);
      if (selected) {
        targetWidth = selected.width;
        targetHeight = selected.height;
        currentFit = selected.recommendedFit;
      }
    }

    try {
      const output = await resizeMultipleImages(
        files,
        {
          mode,
          targetWidth,
          targetHeight,
          percent,
          fit: currentFit,
          quality,
          outputFormat,
        },
        (current, total) => {
          setProgress({ current, total });
        }
      );
      setResults(output);
    } catch (err) {
      alert(`เกิดข้อผิดพลาดในการปรับขนาดรูปภาพ: ${(err as Error).message}`);
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  // Download ZIP
  const handleDownloadZip = async () => {
    if (results.length === 0) return;
    setIsZipping(true);
    try {
      const zipBlob = await createResizedImagesZip(results);
      const filename = `toot-hub-resized-${Date.now()}.zip`;
      
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
      alert(`ไม่สามารถสร้างไฟล์ ZIP ได้: ${(err as Error).message}`);
    } finally {
      setIsZipping(false);
    }
  };

  // Filtered presets
  const filteredPresets = useMemo(() => {
    if (presetCategory === 'all') return RESIZE_PRESETS;
    return RESIZE_PRESETS.filter((p) => p.category === presetCategory);
  }, [presetCategory]);

  const activePreset = RESIZE_PRESETS.find((p) => p.id === selectedPresetId);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between">
      <JsonLd
        title="เครื่องมือปรับขนาดรูปภาพ ย่อรูป ออนไลน์ ฟรี (Resize Image) — TOOL HUB"
        description="ปรับขนาดรูปภาพ ย่อรูป 1 นิ้ว 1.5 นิ้ว 2 นิ้ว สำหรับสมัครงาน ก.พ. ข้าราชการ วีซ่า และรูปสินค้า Shopee Facebook IG คมชัด ไม่เสียสัดส่วน ฟรี 100%"
        url="/tools/image/resize"
      />

      {/* Header Bar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="text-xl font-black bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent"
            >
              TOOL HUB
            </Link>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              Image Suite
            </span>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <Maximize2 size={16} />
              <span>ปรับขนาดรูปภาพ (Resize Image)</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/tools/image/compress"
              className="hidden sm:inline-flex text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
            >
              บีบอัดรูปภาพ
            </Link>
            <Link
              href="/tools/image/convert"
              className="hidden sm:inline-flex text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition"
            >
              แปลงไฟล์รูปภาพ
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
        {/* AdSense Top Banner */}
        <div className="mb-8">
          <AdBanner
            slotId="resize-top-banner"
            format="horizontal"
            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
          />
        </div>

        {/* Hero Title */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mb-3">
            <Sparkles size={14} />
            <span>ปรับขนาดรูปภาพแม่นยำ • มีขนาดรูปติดบัตร 1-2 นิ้ว มาตรฐานไทย</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            ปรับขนาดรูปภาพออนไลน์ (Resize Image)
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
            ย่อ-ขยายรูปภาพ กำหนดขนาดพิกเซล (px), เปอร์เซ็นต์ (%), หรือเลือกขนาดรูปติดบัตร 1 นิ้ว, 1.5 นิ้ว, 2 นิ้ว
            สำหรับสมัครงาน ก.พ. ข้าราชการ และรูปสินค้า Shopee/Lazada ภาพคมชัด ไม่เบี้ยว ปลอดภัย 100%
          </p>
        </div>

        {/* Grid Layout: Controls & Upload */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Upload & Preview (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Upload Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFilesAdded(e.dataTransfer.files);
              }}
              className="border-2 border-dashed border-rose-300 dark:border-rose-900/60 hover:border-rose-500 dark:hover:border-rose-500 rounded-3xl p-8 sm:p-12 text-center bg-rose-50/30 dark:bg-rose-950/10 cursor-pointer transition flex flex-col items-center justify-center group"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/bmp"
                className="hidden"
                onChange={(e) => handleFilesAdded(e.target.files)}
              />

              <div className="h-16 w-16 rounded-2xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Upload size={32} />
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                คลิกเพื่อเลือกรูปภาพ หรือลากไฟล์มาวางที่นี่
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md">
                รองรับไฟล์ JPG, PNG, WebP • เลือกได้พร้อมกันหลายรูป • ประมวลผลในเบราว์เซอร์ปลอดภัย 100%
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-slate-500">
                <span className="px-2.5 py-1 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
                  รูปติดบัตร 1 นิ้ว / 1.5 นิ้ว / 2 นิ้ว
                </span>
                <span className="px-2.5 py-1 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
                  Shopee 800x800
                </span>
                <span className="px-2.5 py-1 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
                  Facebook / IG
                </span>
              </div>
            </div>

            {/* Selected Files List */}
            {files.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileImage size={18} className="text-rose-600" />
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      รูปภาพที่เลือก ({files.length} รายการ)
                    </h3>
                  </div>
                  <button
                    onClick={clearAll}
                    className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition flex items-center gap-1"
                  >
                    <Trash2 size={13} />
                    <span>ล้างทั้งหมด</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {files.map((file, idx) => {
                    const preview = imagePreviews[idx];
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 hover:border-rose-200 dark:hover:border-rose-900/40 transition text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {preview?.url ? (
                            <img
                              src={preview.url}
                              alt={file.name}
                              className="h-10 w-10 object-cover rounded-lg border border-slate-200 dark:border-slate-700 flex-shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-lg flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                              {file.name}
                            </p>
                            <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                              {formatBytes(file.size)}{' '}
                              {preview?.width ? `• ${preview.width} × ${preview.height} px` : ''}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => removeFile(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Results Section */}
            {results.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-emerald-500" />
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        ปรับขนาดรูปภาพเสร็จเรียบร้อย! ({results.length} รูป)
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        ขนาดเป้าหมาย: {results[0]?.resizedWidth} × {results[0]?.resizedHeight} px
                      </p>
                    </div>
                  </div>

                  {results.length > 1 && (
                    <button
                      onClick={handleDownloadZip}
                      disabled={isZipping}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
                    >
                      <Archive size={15} />
                      <span>{isZipping ? 'กำลังบีบอัด ZIP...' : 'ดาวน์โหลดทั้งหมด (.ZIP)'}</span>
                    </button>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {results.map((res) => (
                    <div
                      key={res.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={res.previewUrl}
                          alt={res.outputName}
                          className="h-16 w-16 object-cover rounded-lg border border-slate-200 dark:border-slate-700 flex-shrink-0"
                        />
                        <div className="min-w-0 text-xs">
                          <p className="font-bold text-slate-800 dark:text-slate-200 truncate" title={res.outputName}>
                            {res.outputName}
                          </p>
                          <p className="text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                            {res.resizedWidth} × {res.resizedHeight} px
                          </p>
                          <p className="text-slate-500 text-[11px] mt-0.5">
                            ขนาดไฟล์: {formatBytes(res.resizedSize)}
                          </p>
                        </div>
                      </div>

                      <a
                        href={res.previewUrl}
                        download={res.outputName}
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-800 dark:text-slate-200 hover:text-rose-600 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 transition"
                      >
                        <Download size={14} />
                        <span>ดาวน์โหลดรูปนี้</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Resize Settings & Execution (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Sliders size={18} className="text-rose-600" />
                <span>ตั้งค่าการปรับขนาดรูปภาพ</span>
              </h2>

              {/* Mode Tabs */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setMode('preset')}
                  className={`py-2 px-2 rounded-xl transition ${
                    mode === 'preset'
                      ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  ขนาดมาตรฐาน
                </button>
                <button
                  type="button"
                  onClick={() => setMode('pixel')}
                  className={`py-2 px-2 rounded-xl transition ${
                    mode === 'pixel'
                      ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  กำหนดพิกเซล
                </button>
                <button
                  type="button"
                  onClick={() => setMode('percent')}
                  className={`py-2 px-2 rounded-xl transition ${
                    mode === 'percent'
                      ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  ย่อตาม %
                </button>
              </div>

              {/* MODE 1: Presets (Thai ID & Social) */}
              {mode === 'preset' && (
                <div className="space-y-4">
                  {/* Category Filter */}
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setPresetCategory('all')}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                        presetCategory === 'all'
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      ทั้งหมด
                    </button>
                    <button
                      type="button"
                      onClick={() => setPresetCategory('id-photo')}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                        presetCategory === 'id-photo'
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      รูปติดบัตร / สมัครงาน
                    </button>
                    <button
                      type="button"
                      onClick={() => setPresetCategory('social')}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                        presetCategory === 'social'
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      โซเชียล & Shopee
                    </button>
                    <button
                      type="button"
                      onClick={() => setPresetCategory('print')}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                        presetCategory === 'print'
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      งานพิมพ์ & อัดรูป
                    </button>
                  </div>

                  {/* Preset Items List */}
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {filteredPresets.map((p) => {
                      const isSelected = selectedPresetId === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => handleSelectPreset(p)}
                          className={`p-3 rounded-2xl border cursor-pointer transition text-left ${
                            isSelected
                              ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/40 ring-2 ring-rose-500/20'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/30 dark:bg-slate-900'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                              {p.name}
                            </h4>
                            <span className="text-[11px] font-extrabold text-rose-600 dark:text-rose-400">
                              {p.width} × {p.height} px
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            {p.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Active Preset Summary Banner */}
                  {activePreset && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                      <Info size={16} className="flex-shrink-0 mt-0.5 text-amber-600" />
                      <div>
                        <span className="font-bold">ระบบครอบตัดอัตโนมัติ: </span>
                        รูปภาพจะถูกจัดกึ่งกลางและปรับให้พอดี {activePreset.width} × {activePreset.height} px คมชัด 300 DPI เหมาะสำหรับอัปโหลดส่งระบบราชการ
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* MODE 2: Custom Pixels */}
              {mode === 'pixel' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        ความกว้าง (Width px)
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="10000"
                        value={customWidth}
                        onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        ความสูง (Height px)
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="10000"
                        value={customHeight}
                        onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>

                  {/* Maintain Aspect Ratio Toggle */}
                  <div
                    onClick={() => setMaintainAspectRatio(!maintainAspectRatio)}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 cursor-pointer hover:border-slate-300 transition"
                  >
                    <div className="flex items-center gap-2">
                      {maintainAspectRatio ? (
                        <Lock size={16} className="text-rose-600" />
                      ) : (
                        <Unlock size={16} className="text-slate-400" />
                      )}
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          คงสัดส่วนเดิม (Maintain Aspect Ratio)
                        </p>
                        <p className="text-[11px] text-slate-500">
                          ปรับความกว้างแล้วความสูงจะคำนวณตามรูปจริง ไม่ให้รูปเบี้ยว
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-9 h-5 flex items-center rounded-full p-1 transition ${
                        maintainAspectRatio ? 'bg-rose-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div
                        className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition ${
                          maintainAspectRatio ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Fit Mode Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      วิธีการปรับขนาดภาพ (Fit Mode)
                    </label>
                    <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setFit('cover')}
                        className={`p-2 rounded-xl border text-center transition ${
                          fit === 'cover'
                            ? 'border-rose-500 bg-rose-50 dark:bg-rose-950 text-rose-600'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <Crop size={14} className="mx-auto mb-1" />
                        <span>ครอบตัดกึ่งกลาง</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFit('contain')}
                        className={`p-2 rounded-xl border text-center transition ${
                          fit === 'contain'
                            ? 'border-rose-500 bg-rose-50 dark:bg-rose-950 text-rose-600'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <Maximize2 size={14} className="mx-auto mb-1" />
                        <span>ย่อให้พอดีกรอบ</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFit('fill')}
                        className={`p-2 rounded-xl border text-center transition ${
                          fit === 'fill'
                            ? 'border-rose-500 bg-rose-50 dark:bg-rose-950 text-rose-600'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <RotateCcw size={14} className="mx-auto mb-1" />
                        <span>ยืดภาพให้เต็ม</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* MODE 3: Percentage (%) */}
              {mode === 'percent' && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        สัดส่วนการย่อ/ขยาย:
                      </label>
                      <span className="text-sm font-black text-rose-600">{percent}%</span>
                    </div>

                    <input
                      type="range"
                      min="10"
                      max="200"
                      step="5"
                      value={percent}
                      onChange={(e) => setPercent(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-600"
                    />

                    <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                      <span>10% (จิ๋ว)</span>
                      <span>50% (ครึ่งนึง)</span>
                      <span>100% (เท่าเดิม)</span>
                      <span>200% (2 เท่า)</span>
                    </div>
                  </div>

                  {/* Preset Pills */}
                  <div className="flex flex-wrap gap-2">
                    {[25, 50, 75, 125, 150, 200].map((pVal) => (
                      <button
                        key={pVal}
                        type="button"
                        onClick={() => setPercent(pVal)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          percent === pVal
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {pVal}%
                      </button>
                    ))}
                  </div>

                  {imagePreviews[0] && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-600 dark:text-slate-400">
                      ขนาดโดยประมาณ: {Math.round(imagePreviews[0].width * (percent / 100))} ×{' '}
                      {Math.round(imagePreviews[0].height * (percent / 100))} px
                    </div>
                  )}
                </div>
              )}

              {/* Output Format & Quality */}
              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      นามสกุลไฟล์ส่งออก
                    </label>
                    <select
                      value={outputFormat}
                      onChange={(e) => setOutputFormat(e.target.value as OutputFormatOption)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      <option value="original">คงนามสกุลเดิม (Default)</option>
                      <option value="image/jpeg">JPG / JPEG (มาตรฐาน)</option>
                      <option value="image/png">PNG (ภาพกราฟิก/โปร่งใส)</option>
                      <option value="image/webp">WebP (เว็บสมัยใหม่/ไฟล์เล็ก)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      ความคมชัด (Quality)
                    </label>
                    <select
                      value={quality}
                      onChange={(e) => setQuality(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      <option value={0.92}>คมชัดสูง แนะนำ (92%)</option>
                      <option value={1.0}>สูงสุด ไม่สูญเสีย (100%)</option>
                      <option value={0.8}>บีบอัดลดขนาด (80%)</option>
                      <option value={0.65}>ไฟล์เล็กมาก (65%)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleResize}
                  disabled={files.length === 0 || isProcessing}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-rose-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>
                        กำลังปรับขนาด... ({progress?.current}/{progress?.total})
                      </span>
                    </>
                  ) : (
                    <>
                      <Maximize2 size={18} />
                      <span>
                        {files.length > 0
                          ? `เริ่มปรับขนาดรูปภาพ (${files.length} รูป)`
                          : 'กรุณาเลือกรูปภาพก่อน'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Privacy Guarantee Card */}
            <div className="bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-3">
              <ShieldCheck size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-200">
                  ปลอดภัยสูงสุด 100% ประมวลผลในเบราว์เซอร์ของคุณ:
                </span>
                <p className="mt-0.5">
                  รูปถ่ายส่วนตัว รูปสมัครงาน และรูปสินค้าของคุณจะถูกย่อและแปลงผ่าน HTML5 Canvas ในเครื่องของคุณทันที ไม่มีการอัปโหลดส่งไปยังเซิร์ฟเวอร์ใดๆ ทั้งสิ้น
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AdSense In-content Banner */}
        <div className="my-12">
          <AdBanner
            slotId="resize-middle-banner"
            format="horizontal"
            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
          />
        </div>

        {/* SEO & Knowledge Hub Section: Standard Thai Photo Sizes */}
        <section className="mt-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10">
          <div className="max-w-4xl mx-auto space-y-10">
            <div>
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                คู่มือแนะนำขนาดรูปภาพมาตรฐาน
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                ตารางขนาดรูปติดบัตร และขนาดรูปมาตรฐานในประเทศไทย
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                การยื่นเอกสารสมัครงาน ข้าราชการ ก.พ. หรือสมัครเรียน TCAS จำเป็นต้องใช้รูปถ่ายที่ขนาดถูกต้องและคมชัดระดับ 300 DPI เพื่อให้ระบบตรวจสอบใบหน้าตรวจผ่านอย่างราบรื่น
              </p>
            </div>

            {/* Table of Sizes */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                    <th className="py-3 px-4 font-bold">ประเภทขนาดรูป</th>
                    <th className="py-3 px-4 font-bold">ขนาดเป็นเซนติเมตร (cm)</th>
                    <th className="py-3 px-4 font-bold">ขนาดพิกเซล (300 DPI)</th>
                    <th className="py-3 px-4 font-bold">การใช้งานทั่วไป</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">รูป 1 นิ้ว</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">2.5 × 3.5 cm</td>
                    <td className="py-3 px-4 font-mono font-semibold text-rose-600">295 × 413 px</td>
                    <td className="py-3 px-4 text-slate-500">บัตรนักเรียน, บัตรสมาชิก, สมัครสอบทั่วไป</td>
                  </tr>
                  <tr className="bg-rose-50/40 dark:bg-rose-950/20">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">รูป 1.5 นิ้ว (ยอดนิยม)</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">3.0 × 4.0 cm</td>
                    <td className="py-3 px-4 font-mono font-semibold text-rose-600">354 × 472 px</td>
                    <td className="py-3 px-4 text-slate-500 font-semibold text-rose-600">สอบ ก.พ., ข้าราชการ, วีซ่า, สมัครงานบริษัท</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">รูป 2 นิ้ว</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">4.0 × 5.0 cm</td>
                    <td className="py-3 px-4 font-mono font-semibold text-rose-600">472 × 591 px</td>
                    <td className="py-3 px-4 text-slate-500">พาสปอร์ต (Passport), ใบประกอบวิชาชีพแพทย์/ครู</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">รูปวีซ่าอเมริกา (2x2 นิ้ว)</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">5.1 × 5.1 cm</td>
                    <td className="py-3 px-4 font-mono font-semibold text-rose-600">600 × 600 px</td>
                    <td className="py-3 px-4 text-slate-500">ยื่นแบบฟอร์ม DS-160 ขอวีซ่าสหรัฐอเมริกา</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">รูปสินค้า Shopee / Lazada</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">สี่เหลี่ยมจัตุรัส 1:1</td>
                    <td className="py-3 px-4 font-mono font-semibold text-rose-600">800 × 800 px</td>
                    <td className="py-3 px-4 text-slate-500">ร้านค้าออนไลน์ โหลดเร็ว ลูกค้าซูมดูชัดเจน</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* FAQ Section */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle size={20} className="text-rose-600" />
                <span>คำถามที่พบบ่อยเกี่ยวกับการปรับขนาดรูปภาพ (FAQ)</span>
              </h3>

              <div className="space-y-3 text-xs sm:text-sm">
                <details className="group border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-950">
                  <summary className="font-bold text-slate-900 dark:text-white cursor-pointer list-none flex justify-between items-center">
                    <span>ทำไมต้องใช้เครื่องมือนี้แทนที่จะส่งรูปขนาดเต็ม?</span>
                    <ChevronDown size={16} className="text-slate-400 group-open:rotate-180 transition transform" />
                  </summary>
                  <p className="mt-3 text-slate-600 dark:text-slate-400 leading-relaxed">
                    ระบบรับสมัครงานและเว็บไซต์ราชการส่วนใหญ่จำกัดขนาดไฟล์ไม่เกิน 100 KB หรือ 500 KB และระบุสัดส่วนรูปที่แน่นอน หากส่งรูปขนาดผิด มักจะถูกปฏิเสธหรือใบหน้าบิดเบี้ยว เครื่องมือนี้จะช่วยคำนวณและครอบตัดให้ได้สัดส่วนตรงเป๊ะตามมาตรฐานในคลิกเดียว
                  </p>
                </details>

                <details className="group border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-950">
                  <summary className="font-bold text-slate-900 dark:text-white cursor-pointer list-none flex justify-between items-center">
                    <span>รูปภาพถ่ายติดบัตรจะถูกบันทึกขึ้นอินเทอร์เน็ตหรือไม่?</span>
                    <ChevronDown size={16} className="text-slate-400 group-open:rotate-180 transition transform" />
                  </summary>
                  <p className="mt-3 text-slate-600 dark:text-slate-400 leading-relaxed">
                    ไม่ถูกบันทึก 100% เพราะ TOOL HUB ใช้สถาปัตยกรรม Client-side การประมวลผลทั้งหมดเกิดขึ้นบนแรมและชิปกราฟิกของอุปกรณ์คุณผ่าน HTML5 Canvas ไม่มีข้อมูลใดๆ ส่งออกนอกเครื่อง ปลอดภัยต่อข้อมูลส่วนบุคคล
                  </p>
                </details>

                <details className="group border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-950">
                  <summary className="font-bold text-slate-900 dark:text-white cursor-pointer list-none flex justify-between items-center">
                    <span>ปรับขนาดแล้วอยากลดขนาดไฟล์ KB ต่อ ควรทำอย่างไร?</span>
                    <ChevronDown size={16} className="text-slate-400 group-open:rotate-180 transition transform" />
                  </summary>
                  <p className="mt-3 text-slate-600 dark:text-slate-400 leading-relaxed">
                    คุณสามารถนำรูปที่ปรับขนาดแล้วไปใช้ร่วมกับเครื่องมือ{' '}
                    <Link href="/tools/image/compress" className="text-rose-600 font-bold hover:underline">
                      บีบอัดรูปภาพ (Compress Image)
                    </Link>{' '}
                    ของเรา เพื่อลดขนาดไฟล์ให้ต่ำกว่า 50 KB หรือ 100 KB ตามที่ระบบปลายทางกำหนดได้ทันที
                  </p>
                </details>
              </div>
            </div>

            {/* Related Tools Links */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                เครื่องมือจัดการรูปภาพและไฟล์ยอดนิยมที่เกี่ยวข้อง
              </h4>
              <div className="flex flex-wrap gap-2.5">
                <Link
                  href="/tools/image/compress"
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:border-rose-500 hover:text-rose-600 transition"
                >
                  บีบอัดลดขนาดรูปภาพ (Compress)
                </Link>
                <Link
                  href="/tools/image/convert"
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:border-purple-500 hover:text-purple-600 transition"
                >
                  แปลงไฟล์รูปภาพ JPG ↔ PNG ↔ WebP
                </Link>
                <Link
                  href="/tools/pdf/jpg-to-pdf"
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:border-blue-500 hover:text-blue-600 transition"
                >
                  รวมรูปภาพเป็น PDF (JPG to PDF)
                </Link>
                <Link
                  href="/tools/pdf/compress"
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:border-amber-500 hover:text-amber-600 transition"
                >
                  บีบอัดลดขนาด PDF
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
