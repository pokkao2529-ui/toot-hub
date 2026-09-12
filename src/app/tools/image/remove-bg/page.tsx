'use client';

import React, { useState, useRef } from 'react';
import {
  ImageIcon,
  Upload,
  Download,
  Sparkles,
  RefreshCw,
  Scissors
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AdBanner } from '@/components/ads/AdBanner';
import { JsonLd } from '@/components/seo/JsonLd';

export default function RemoveBgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [error, setError] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);

    setFile(selected);
    setOriginalUrl(URL.createObjectURL(selected));
    setResultUrl(null);
    setProgress('');
    setError('');
  };

  const processImage = async () => {
    if (!file || !originalUrl) return;

    setIsProcessing(true);
    setError('');
    setProgress('กำลังโหลดโมเดล AI...');

    try {
      // Dynamically import the library (works in browser only)
      const { removeBackground } = await import('@imgly/background-removal');

      const config = {
        progress: (key: string, current: number, total: number) => {
          if (total > 0) {
            setProgress(`กำลังดาวน์โหลดไฟล์ AI... ${Math.round((current / total) * 100)}%`);
          } else if (key === 'compute:inference') {
            setProgress('กำลังประมวลผลลบพื้นหลัง...');
          }
        },
      };

      const blob = await removeBackground(originalUrl, config);
      const newUrl = URL.createObjectURL(blob);
      setResultUrl(newUrl);
      setProgress('');
    } catch (err: any) {
      console.error('Error removing background:', err);
      setError('เกิดข้อผิดพลาด: ' + (err?.message || 'ลองใหม่อีกครั้ง'));
    } finally {
      setIsProcessing(false);
    }
  };

  const clearAll = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null);
    setOriginalUrl(null);
    setResultUrl(null);
    setProgress('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadResult = () => {
    if (!resultUrl || !file) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    const originalName = file.name.split('.')[0];
    a.download = `${originalName}_transparent.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <JsonLd
        title="ไดคัทรูปภาพ ลบพื้นหลังฟรี ทำพื้นโปร่งใส (Remove Background) — TOOL HUB"
        description="ลบพื้นหลังรูปภาพออนไลน์ ไดคัทรูปคน ลายเซ็น สินค้า ฟรี 100% ไม่ติดลายน้ำ ดาวน์โหลดเป็น PNG พื้นใสได้ทันที ปลอดภัยประมวลผลในเครื่อง"
        url="/tools/image/remove-bg"
      />

      <Header />

      {/* Top Banner Ad Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-4">
        <AdBanner slotId="top-banner-remove-bg" format="horizontal" />
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 dark:bg-amber-950/60 px-4 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900 mb-3">
            <Scissors size={14} />
            <span>ฟรี 100% • AI ประมวลผลบนเบราว์เซอร์ ไม่ต้องอัปโหลดขึ้นเซิร์ฟเวอร์</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-3">
            ลบพื้นหลังรูปภาพ ไดคัทรูปฟรี
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            ใช้ AI ไดคัทรูปคน ลบพื้นหลังลายเซ็น หรือสินค้าอัตโนมัติ โหลดรูปเก็บเป็นพื้นใส (PNG) ได้ทันที
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 p-6 sm:p-8">

          {/* File Upload Area */}
          {!file && (
            <div
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition group"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Upload size={32} className="text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">อัปโหลดรูปภาพเพื่อลบพื้นหลัง</h3>
              <p className="text-sm text-slate-500 mb-6 text-center">
                รองรับไฟล์ JPG, PNG, WebP
              </p>
              <button className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-amber-600/30 transition">
                <ImageIcon size={18} /> เลือกรูปภาพ
              </button>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/jpeg,image/png,image/webp"
          />

          {/* Processing Area */}
          {file && originalUrl && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Original Image */}
                <div className="flex flex-col border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950">
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 font-semibold text-sm bg-white dark:bg-slate-900">
                    <span>ภาพต้นฉบับ</span>
                  </div>
                  <div className="p-4 flex-1 flex items-center justify-center">
                    <img src={originalUrl} alt="Original" className="max-h-80 object-contain rounded-lg" />
                  </div>
                </div>

                {/* Result Image */}
                <div
                  className="flex flex-col border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden checkered-bg"
                >
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 font-semibold text-sm bg-white dark:bg-slate-900">
                    <span>ภาพพื้นหลังโปร่งใส</span>
                  </div>
                  <div className="p-4 flex-1 flex items-center justify-center relative min-h-[200px]">
                    {resultUrl ? (
                      <img src={resultUrl} alt="Result" className="max-h-80 object-contain rounded-lg shadow-sm" />
                    ) : (
                      <div className="text-center p-8">
                        {isProcessing ? (
                          <div className="flex flex-col items-center">
                            <RefreshCw className="animate-spin text-amber-500 mb-4" size={32} />
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{progress}</p>
                          </div>
                        ) : error ? (
                          <div className="text-center">
                            <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
                            <p className="text-xs text-slate-400 mt-2">หมายเหตุ: ฟีเจอร์นี้ต้องใช้ RAM พอสมควร บนมือถือรุ่นเก่าอาจทำงานไม่ได้</p>
                          </div>
                        ) : (
                          <div className="text-slate-400 dark:text-slate-600 flex flex-col items-center">
                            <ImageIcon size={48} className="mb-4 opacity-50" />
                            <p>รอกดปุ่ม &ldquo;เริ่มลบพื้นหลัง&rdquo;</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                {!resultUrl && !isProcessing && (
                  <button
                    onClick={processImage}
                    className="px-8 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-amber-600/30 transition text-lg"
                  >
                    <Sparkles size={20} />
                    เริ่มลบพื้นหลัง (AI)
                  </button>
                )}

                {resultUrl && (
                  <button
                    onClick={downloadResult}
                    className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition text-lg"
                  >
                    <Download size={20} />
                    ดาวน์โหลด PNG (พื้นใส)
                  </button>
                )}

                <button
                  onClick={clearAll}
                  disabled={isProcessing}
                  className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl flex items-center gap-2 transition disabled:opacity-50"
                >
                  <RefreshCw size={20} />
                  ล้างข้อมูล
                </button>
              </div>
              
              {/* Note for mobile */}
              <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-2">
                ⚠️ ฟีเจอร์ AI ลบพื้นหลัง ต้องโหลดโมเดล ~30-50MB ครั้งแรกอาจใช้เวลา 30 วินาที ขึ้นอยู่กับความเร็วเน็ต
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
