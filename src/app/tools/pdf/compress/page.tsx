'use client';

import React, { useState, useEffect } from 'react';
import { getToolBySlug } from '@/config/pdf-tools';
import { pdfService, type CompressionPreset, type CompressPdfResult } from '@/services/pdf';
import { formatBytes } from '@/services/image';
import { PdfToolLayout } from '@/components/pdf/PdfToolLayout';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import { PdfProgress } from '@/components/pdf/PdfProgress';
import { PdfError } from '@/components/pdf/PdfError';
import {
  Minimize2,
  Download,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  FileText,
  Zap,
  CheckCircle2,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';

export default function CompressPdfPage() {
  const tool = getToolBySlug('compress')!;

  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [preset, setPreset] = useState<CompressionPreset>('recommended');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompressPdfResult | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  const handleFilesSelected = async (files: File[]) => {
    setError(null);
    if (!files || files.length === 0) return;

    const selected = files[0];
    if (selected.size > tool.maxFileSize) {
      setError(`ขนาดไฟล์เกินกำหนด (สูงสุด ${Math.round(tool.maxFileSize / (1024 * 1024))} MB)`);
      return;
    }

    setFile(selected);

    try {
      const count = await pdfService.getPageCount(selected);
      setPageCount(count);
    } catch {
      setPageCount(null);
    }

    setStep(2);
  };

  const handleCompress = async () => {
    if (!file) return;
    setError(null);
    setStep(3);
    setProgress(5);
    setProgressMsg('กำลังเตรียมการบีบอัดเอกสาร PDF...');

    try {
      const res = await pdfService.compress(file, {
        preset,
        onProgress: (p, msg) => {
          setProgress(p);
          setProgressMsg(msg);
        },
      });

      const url = URL.createObjectURL(res.blob);
      setResultUrl(url);
      setResult(res);
      setProgress(100);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบีบอัดเอกสาร PDF');
      setStep(2);
    }
  };

  const handleReset = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null);
    setPageCount(null);
    setResult(null);
    setResultUrl(null);
    setProgress(0);
    setError(null);
    setStep(1);
  };

  const faqs = [
    {
      question: 'บีบอัดไฟล์ PDF แล้วข้อความหรือรูปภาพจะแตกจนอ่านไม่ออกไหม?',
      answer:
        'ไม่แตกแน่นอนครับ! หากเลือกโหมด "สมดุล (แนะนำ)" อัลกอริทึมจะปรับลดเฉพาะข้อมูลส่วนเกินที่สายตามนุษย์มองไม่เห็น ทำให้ขนาดไฟล์ลดลง 60-80% แต่ตัวหนังสือ ลายเซ็น และรูปภาพยังคงคมชัด อ่านง่าย สบายตาเหมือนเดิมทุกประการ',
    },
    {
      question: 'เอกสารประเภทไหนที่บีบอัดแล้วจะลดขนาดได้มากที่สุด?',
      answer:
        'เอกสารที่มีรูปภาพประกอบ, เอกสารที่เกิดจากการสแกน (Scanned PDF), หรือเอกสารที่ถ่ายจากกล้องมือถือ จะสามารถบีบอัดลดขนาดลงได้มากที่สุดถึง 80-90% เลยครับ',
    },
    {
      question: 'ไฟล์เอกสารที่นำมาบีบอัด ปลอดภัยต่อข้อมูลความลับหรือไม่?',
      answer:
        'ปลอดภัยระดับสูงสุด 100% ครับ ระบบของ TOOL HUB ใช้เทคโนโลยี Client-Side ประมวลผลบนหน่วยความจำ RAM ของเบราว์เซอร์ในเครื่องคุณโดยตรง ไฟล์เอกสารจะไม่ถูกอัปโหลดขึ้นเซิร์ฟเวอร์ใดๆ แม้แต่กิโลไบต์เดียว มั่นใจได้ทั้งเอกสารราชการ สัญญา และข้อมูลส่วนตัว',
    },
    {
      question: 'จำกัดจำนวนไฟล์ต่อวันเหมือนเว็บอื่นๆ หรือไม่?',
      answer:
        'ไม่มีการจำกัดเลยครับ! TOOL HUB ให้คุณใช้งานได้ฟรี 100% ไม่จำกัดจำนวนไฟล์ต่อวัน ไม่ต้องต่อคิวเซิร์ฟเวอร์ และไม่ต้องสมัครสมาชิกตลอดชีพครับ',
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
        <PdfDropzone
          onFilesSelected={handleFilesSelected}
          accept="application/pdf,.pdf"
          maxFiles={1}
          maxFileSizeMb={Math.round(tool.maxFileSize / (1024 * 1024))}
          title="เลือกหรือลากไฟล์ PDF มาวางที่นี่เพื่อลดขนาด"
          subtitle="รองรับไฟล์ PDF ทุกประเภท ขนาดสูงสุด 100 MB ประมวลผลในเครื่อง 100%"
        />
      )}

      {/* Step 2: Settings */}
      {step === 2 && file && (
        <div className="space-y-8">
          {/* File Overview Card */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="h-12 w-12 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center font-bold shrink-0">
                <FileText size={24} />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {file.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  ขนาดไฟล์เดิม: <strong>{formatBytes(file.size)}</strong>
                  {pageCount && ` • จำนวน ${pageCount} หน้า`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold text-slate-500 hover:text-red-600 transition shrink-0"
            >
              เปลี่ยนไฟล์ใหม่
            </button>
          </div>

          {/* Compression Presets */}
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Zap size={16} className="text-red-600" />
              <span>เลือกระดับการบีบอัดเอกสาร PDF</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Preset: Recommended */}
              <button
                type="button"
                onClick={() => setPreset('recommended')}
                className={`p-5 rounded-2xl border text-left transition relative ${
                  preset === 'recommended'
                    ? 'border-red-600 bg-red-50/40 dark:bg-red-950/20 ring-2 ring-red-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-[10px] font-bold text-red-600">
                  แนะนำ ⭐️
                </span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                  สมดุล (Recommended)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                  ลดขนาดไฟล์ลง 60-80% คมชัดเหมือนเดิม เหมาะกับเอกสารส่วนใหญ่
                </p>
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  <span>คุณภาพและขนาดสมดุลที่สุด</span>
                </span>
              </button>

              {/* Preset: Extreme */}
              <button
                type="button"
                onClick={() => setPreset('extreme')}
                className={`p-5 rounded-2xl border text-left transition relative ${
                  preset === 'extreme'
                    ? 'border-red-600 bg-red-50/40 dark:bg-red-950/20 ring-2 ring-red-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                  บีบอัดขั้นสุด (Extreme)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                  ลดขนาดไฟล์สูงสุด 85-90% เพื่อให้ไฟล์มีขนาดเล็กจิ๋ว
                </p>
                <span className="text-[11px] font-bold text-blue-600 flex items-center gap-1">
                  <TrendingDown size={13} />
                  <span>เหมาะสำหรับส่งอีเมล หรือระบบที่จำกัด &lt; 1MB</span>
                </span>
              </button>

              {/* Preset: High Quality */}
              <button
                type="button"
                onClick={() => setPreset('high')}
                className={`p-5 rounded-2xl border text-left transition relative ${
                  preset === 'high'
                    ? 'border-red-600 bg-red-50/40 dark:bg-red-950/20 ring-2 ring-red-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                  คุณภาพสูง (High Quality)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                  ลดขนาดไฟล์ลง 30-50% เน้นรักษาความละเอียดของภาพถ่ายสูงสุด
                </p>
                <span className="text-[11px] font-bold text-purple-600 flex items-center gap-1">
                  <Sparkles size={13} />
                  <span>เหมาะกับเอกสารที่มีภาพกราฟิกละเอียด</span>
                </span>
              </button>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white"
            >
              ยกเลิก
            </button>

            <button
              type="button"
              onClick={handleCompress}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-500/20 transition flex items-center justify-center gap-2"
            >
              <Minimize2 size={16} />
              <span>เริ่มบีบอัดลดขนาด PDF ทันที</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Progress & Result */}
      {step === 3 && (
        <div>
          {progress < 100 || !result ? (
            <PdfProgress progress={progress} message={progressMsg} />
          ) : (
            <div className="text-center py-6 space-y-6 animate-in fade-in duration-300">
              {/* Success Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-xs font-bold border border-emerald-200 dark:border-emerald-900">
                <CheckCircle2 size={16} />
                <span>
                  {result.savedPercentage > 0
                    ? `บีบอัดสำเร็จ! ประหยัดพื้นที่ได้ ${result.savedPercentage}%`
                    : 'บีบอัดสำเร็จ! เอกสารมีความกะทัดรัดสมบูรณ์แล้ว'}
                </span>
              </div>

              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                เอกสาร PDF ของคุณพร้อมดาวน์โหลดแล้ว
              </h2>

              {/* Comparison Metric Box */}
              <div className="max-w-md mx-auto p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-4 text-center">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">ขนาดไฟล์เดิม</span>
                  <span className="text-base font-bold text-slate-700 dark:text-slate-300 line-through">
                    {formatBytes(result.originalSize)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block mb-1 font-semibold">
                    ขนาดใหม่หลังบีบอัด
                  </span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    {formatBytes(result.compressedSize)}
                  </span>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href={resultUrl!}
                  download={`compressed-${file?.name || 'document.pdf'}`}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-500/20 transition flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  <span>ดาวน์โหลดไฟล์ PDF ที่บีบอัดแล้ว</span>
                </a>

                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-200 font-bold text-xs transition flex items-center justify-center gap-1.5"
                >
                  <RotateCcw size={14} />
                  <span>บีบอัดไฟล์อื่นเพิ่มเติม</span>
                </button>
              </div>

              {/* Security reassurance */}
              <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5 pt-2">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>ไฟล์ได้รับการประมวลผลอย่างปลอดภัยในเบราว์เซอร์ ไม่มีการส่งข้อมูลขึ้นเซิร์ฟเวอร์</span>
              </p>
            </div>
          )}
        </div>
      )}
    </PdfToolLayout>
  );
}
