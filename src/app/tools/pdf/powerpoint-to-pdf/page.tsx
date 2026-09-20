'use client';

import React, { useState } from 'react';
import { PdfToolLayout } from '@/components/pdf/PdfToolLayout';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import { PdfResult } from '@/components/pdf/PdfResult';
import { PdfError } from '@/components/pdf/PdfError';
import { PDF_TOOLS } from '@/config/pdf-tools';
import { trackFileSelected, trackToolStart, trackToolSuccess, trackToolError, trackToolDownload } from '@/lib/analytics';

const tool = PDF_TOOLS.find((t) => t.id === 'powerpoint-to-pdf')!;

export default function PptxToPdfPage() {
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
    trackFileSelected({ tool_name: 'pptx_to_pdf', tool_category: 'pdf' });
  };

  const handleConvert = async () => {
    if (!file) return;
    try {
      setStep(3);
      setProgress(10);
      setProgressMsg('กำลังอ่านไฟล์ PowerPoint...');
      trackToolStart({ tool_name: 'pptx_to_pdf', tool_category: 'pdf' });

      // Dynamically import to prevent SSR issues
      // @ts-ignore
      const PptxToHtml = (await import('@jvmr/pptx-to-html')).default;
      
      setProgress(40);
      setProgressMsg('กำลังสร้างโครงสร้างสไลด์...');

      const arrayBuffer = await file.arrayBuffer();
      
      const parser = new PptxToHtml();
      await parser.load(arrayBuffer);
      const slidesHtml = await parser.renderAll(); 

      // Combine slides into a vertical stack
      let combinedHtml = '';
      if (Array.isArray(slidesHtml)) {
        slidesHtml.forEach((slide, index) => {
          combinedHtml += `
            <div style="page-break-after: always; width: 100%; height: auto; position: relative; border: 1px solid #ddd; margin-bottom: 20px;">
              ${slide}
            </div>
          `;
        });
      } else {
        combinedHtml = slidesHtml;
      }

      const finalHtml = `
        <style>
          * { font-family: 'Sarabun', 'Prompt', sans-serif !important; }
        </style>
        <div style="color: #000; padding: 20px; text-align: center;">
          ${combinedHtml || '<h2>ไม่สามารถดึงข้อความจากสไลด์ได้</h2>'}
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
        filename:     file.name.replace(/\.pptx?$/i, '.pdf'),
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' as const }
      };

      const pdfWorker = html2pdf().set(opt).from(element);
      const pdfBlob = await pdfWorker.output('blob');

      const url = URL.createObjectURL(pdfBlob);
      setResultUrl(url);
      setResultSize(pdfBlob.size);
      
      trackToolSuccess({ tool_name: 'pptx_to_pdf', tool_category: 'pdf' });
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการแปลงไฟล์ PowerPoint');
      setStep(2);
      trackToolError({ tool_name: 'pptx_to_pdf', tool_category: 'pdf', error_type: 'process_failed' });
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
      trackToolDownload({ tool_name: 'pptx_to_pdf', tool_category: 'pdf', output_type: 'pdf' });
    }
  };

  const articleContent = (
    <div className="text-slate-700 dark:text-slate-300 space-y-8 leading-relaxed">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">วิธีแปลง PowerPoint เป็น PDF ง่ายๆ</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li><strong>อัปโหลดไฟล์:</strong> ลากไฟล์ PowerPoint (PPTX หรือ PPT) มาวางในพื้นที่ที่กำหนด หรือคลิกเพื่อเลือกสไลด์จากคอมพิวเตอร์ของคุณ</li>
          <li><strong>เริ่มการแปลง:</strong> ระบบจะทำการแปลงภาพสไลด์และข้อความให้เป็นหน้า PDF (แบบแนวนอน) ทันทีบนเบราว์เซอร์ของคุณ</li>
          <li><strong>ดาวน์โหลด:</strong> เมื่อแถบความคืบหน้าเต็ม 100% คุณสามารถคลิกปุ่มดาวน์โหลดเพื่อรับไฟล์ PDF พร้อมนำเสนอหรือแชร์ต่อได้ทันที</li>
        </ol>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">ความเป็นส่วนตัวและความปลอดภัย (Privacy & Security)</h2>
        <p>เราเข้าใจดีว่าไฟล์พรีเซนเทชันมักมีข้อมูลสำคัญหรือความลับทางธุรกิจ เครื่องมือแปลง PowerPoint เป็น PDF ของเรารับประกันความปลอดภัยสูงสุดด้วยการทำงานแบบ <strong>Client-side Processing</strong> ซึ่งหมายความว่าไฟล์ของคุณจะถูกประมวลผลบนเครื่องของคุณเองเท่านั้น ไม่มีการส่งไปจัดเก็บบนเซิร์ฟเวอร์ของเรา</p>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">ข้อจำกัดที่ควรทราบ</h2>
        <p>ระบบรองรับขนาดไฟล์สูงสุด {Math.round(tool.maxFileSize / (1024 * 1024))}MB การแสดงผลในไฟล์ PDF จะเน้นที่เนื้อหาและเลย์เอาต์หลัก อย่างไรก็ตาม Animation (แอนิเมชัน) หรือ Transition ลูกเล่นการเปลี่ยนสไลด์ จะไม่สามารถทำงานได้ในรูปแบบเอกสาร PDF นอกจากนี้หากพรีเซนเทชันใช้ฟอนต์ที่ไม่ได้ติดตั้งในระบบของคุณ อาจส่งผลให้สัดส่วนของตัวอักษรเปลี่ยนไปบ้างเล็กน้อย</p>
      </div>
    </div>
  );

  const pptToPdfFaqs = [
    {
      question: 'รองรับไฟล์ PowerPoint รูปแบบไหนบ้าง?',
      answer: 'ระบบของเรารองรับไฟล์ Microsoft PowerPoint นามสกุล .pptx เป็นหลัก และสามารถอ่านไฟล์ .ppt รุ่นเก่าได้เช่นกัน แต่แนะนำให้ใช้ .pptx เพื่อความสมบูรณ์ในการแปลงมากที่สุด'
    },
    {
      question: 'แปลงไฟล์ PowerPoint เป็น PDF เสียค่าใช้จ่ายหรือไม่?',
      answer: 'ฟรี 100% ครับ คุณสามารถใช้งานเครื่องมือแปลงไฟล์บน TOOL HUB ได้โดยไม่ต้องสมัครสมาชิกและไม่ต้องจ่ายเงินแต่อย่างใด'
    },
    {
      question: 'ทำไมฟอนต์บางตัวหรือเลย์เอาต์สไลด์เพี้ยนไปเมื่อแปลงเสร็จ?',
      answer: 'เนื่องจากการแปลงทำบนเบราว์เซอร์ของคุณเอง หากไฟล์ PowerPoint ใช้ฟอนต์พิเศษที่ไม่ได้มีติดตั้งในเครื่องของคุณ ระบบอาจใช้ฟอนต์พื้นฐานแทน ทำให้การเว้นวรรคหรือขนาดตัวอักษรบนสไลด์เปลี่ยนไป'
    }
  ];

  return (
    <PdfToolLayout tool={tool} currentStep={step} article={articleContent} faqs={pptToPdfFaqs}>
      {error && (
        <div className="mb-6">
          <PdfError message={error} onReset={handleReset} />
        </div>
      )}

      {step === 1 && (
        <PdfDropzone
          onFilesSelected={handleFileSelected}
          accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          multiple={false}
          maxFileSizeMb={Math.round(tool.maxFileSize / (1024 * 1024))}
          title="เลือกไฟล์ PowerPoint"
          subtitle="แปลงไฟล์ PPT หรือ PPTX เป็น PDF ทำในเบราว์เซอร์ของคุณ ปลอดภัย 100%"
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
              filename={file?.name.replace(/\.pptx?$/i, '.pdf') || 'document.pdf'}
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
