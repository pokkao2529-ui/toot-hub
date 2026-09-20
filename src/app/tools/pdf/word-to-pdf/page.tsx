'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PdfToolLayout } from '@/components/pdf/PdfToolLayout';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import { PdfResult } from '@/components/pdf/PdfResult';
import { PdfError } from '@/components/pdf/PdfError';
import { PDF_TOOLS } from '@/config/pdf-tools';
import { trackFileSelected, trackToolStart, trackToolSuccess, trackToolError, trackToolDownload } from '@/lib/analytics';
import mammoth from 'mammoth';

const tool = PDF_TOOLS.find((t) => t.id === 'word-to-pdf')!;

export default function WordToPdfPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number>(0);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setStep(2);
    trackFileSelected({ tool_name: 'word_to_pdf', tool_category: 'pdf' });
  };

  const handleConvert = async () => {
    if (!file) return;
    try {
      setStep(3);
      setProgress(10);
      setProgressMsg('กำลังอ่านไฟล์ Word...');
      trackToolStart({ tool_name: 'word_to_pdf', tool_category: 'pdf' });

      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const htmlContent = result.value;

      setProgress(40);
      setProgressMsg('กำลังสร้างโครงสร้างเอกสาร...');

      const finalHtml = `
        <div style="padding: 40px; font-family: 'Sarabun', 'Prompt', sans-serif; font-size: 16px; line-height: 1.6; color: #000;">
          ${htmlContent}
        </div>
      `;

      // @ts-ignore
      const html2pdf = (await import('html2pdf.js')).default;
      
      const element = document.createElement('div');
      element.innerHTML = finalHtml;
      
      setProgress(70);
      setProgressMsg('กำลังแปลงเป็น PDF...');

      const opt = {
        margin:       [0.5, 0.5, 0.5, 0.5] as [number, number, number, number],
        filename:     file.name.replace(/\.docx?$/i, '.pdf'),
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' as const }
      };

      const pdfWorker = html2pdf().set(opt).from(element);
      const pdfBlob = await pdfWorker.output('blob');

      const url = URL.createObjectURL(pdfBlob);
      setResultUrl(url);
      setResultSize(pdfBlob.size);
      
      trackToolSuccess({ tool_name: 'word_to_pdf', tool_category: 'pdf' });
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการแปลงไฟล์ Word');
      setStep(2);
      trackToolError({ tool_name: 'word_to_pdf', tool_category: 'pdf', error_type: 'process_failed' });
    }
  };

  const handleReset = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
    setFile(null);
    setStep(1);
    setProgress(0);
    setError(null);
  };

  const handleDownload = () => {
    if (file) {
      trackToolDownload({ tool_name: 'word_to_pdf', tool_category: 'pdf', output_type: 'pdf' });
    }
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
          accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          multiple={false}
          maxFileSizeMb={Math.round(tool.maxFileSize / (1024 * 1024))}
          title="เลือกไฟล์ Word"
          subtitle="แปลงไฟล์ DOC หรือ DOCX เป็น PDF ในเบราว์เซอร์ของคุณ ปลอดภัย 100%"
        />
      )}

      {step === 2 && file && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <div className="text-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              ไฟล์พร้อมสำหรับแปลง
            </h3>
            <p className="text-slate-500 mb-6">{file.name}</p>
            <button
              onClick={handleConvert}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition"
            >
              เริ่มแปลงเป็น PDF
            </button>
            <button
              onClick={handleReset}
              className="mt-4 block mx-auto text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        resultUrl ? (
          <div onClick={handleDownload}>
            <PdfResult
              downloadUrl={resultUrl}
              filename={file?.name.replace(/\.docx?$/i, '.pdf') || 'document.pdf'}
              fileSizeBytes={resultSize}
              onReset={handleReset}
            />
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-6 relative">
              <div className="absolute inset-0 border-4 border-slate-100 dark:border-slate-800 rounded-full"></div>
              <div
                className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"
                style={{ clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)' }}
              ></div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {progressMsg || 'กำลังประมวลผล...'}
            </h3>
            <div className="w-64 mx-auto h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-slate-500">{progress}%</p>
          </div>
        )
      )}
    </PdfToolLayout>
  );
}
