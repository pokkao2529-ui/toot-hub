'use client';

import React, { useState, useEffect } from 'react';
import { getToolBySlug } from '@/config/pdf-tools';
import { pdfService } from '@/services/pdf';
import { PdfToolLayout } from '@/components/pdf/PdfToolLayout';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import { PdfProgress } from '@/components/pdf/PdfProgress';
import { PdfResult } from '@/components/pdf/PdfResult';
import { PdfError } from '@/components/pdf/PdfError';
import { Unlock, ShieldCheck, FileText } from 'lucide-react';

export default function UnlockPdfPage() {
  const tool = getToolBySlug('unlock')!;

  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
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
  };

  const handleUnlock = async () => {
    if (!file) return;
    setError(null);
    setStep(3);
    setProgress(20);
    setProgressMsg('กำลังปลดล็อกรหัสผ่านและข้อจำกัดในเอกสาร...');

    try {
      const res = await pdfService.unlock(file, {
        password: password.trim() || undefined,
        onProgress: (p, msg) => {
          setProgress(p);
          setProgressMsg(msg);
        },
      });

      const url = URL.createObjectURL(res.blob);
      setResultUrl(url);
      setResultSize(res.size);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถปลดล็อกไฟล์นี้ได้');
      setStep(2);
    }
  };

  const handleReset = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
    setFile(null);
    setPassword('');
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
          title="เลือกไฟล์ PDF เพื่อปลดล็อกรหัสผ่าน"
          subtitle="ลบรหัสผ่านและข้อจำกัดการพิมพ์/แก้ไข เพื่อให้เปิดอ่านได้สะดวกทุกที่"
        />
      )}

      {step === 2 && file && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-sm">
            <div className="flex items-center space-x-3 truncate">
              <div className="p-2.5 rounded-lg bg-red-100 text-red-600 dark:bg-red-950">
                <FileText size={22} />
              </div>
              <div className="truncate">
                <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{file.name}</p>
                <p className="text-xs text-slate-500">
                  ขนาด {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-red-600 underline"
            >
              เปลี่ยนไฟล์
            </button>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-start space-x-3 mb-4">
              <div className="p-2 rounded-xl bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">
                  ปลดล็อกรหัสผ่านอย่างปลอดภัย
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  ระบบจะทำการถอดรหัสและปลดล็อกข้อจำกัด (Permissions) ทั้งหมด ทำให้คุณสามารถเปิดอ่าน คัดลอกข้อความ และสั่งพิมพ์เอกสารฉบับใหม่ได้โดยไม่ต้องกรอกรหัสผ่านอีกต่อไป
                </p>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                รหัสผ่านเดิมของไฟล์ (ถ้ามี):
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="กรอกรหัสผ่าน (หากไฟล์มีการตั้งรหัสเปิดอ่านไว้)"
                className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:border-red-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                * สำหรับไฟล์ที่มีเพียงการจำกัดสิทธิ์แก้ไข/พิมพ์ สามารถกดปุ่มปลดล็อกได้ทันทีโดยไม่ต้องกรอกรหัส
              </p>
            </div>
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
              onClick={handleUnlock}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-500/20 transition"
            >
              <Unlock size={18} />
              <span>ปลดล็อกไฟล์ PDF ทันที</span>
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <>
          {resultUrl ? (
            <PdfResult
              downloadUrl={resultUrl}
              filename="unlocked_document.pdf"
              fileSizeBytes={resultSize}
              message="ปลดล็อกรหัสผ่านและข้อจำกัดของเอกสารเรียบร้อยแล้ว!"
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
