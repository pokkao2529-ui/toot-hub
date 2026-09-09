'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getToolBySlug } from '@/config/pdf-tools';
import { pdfService, type PlacedSignature, type PageThumbnail } from '@/services/pdf';
import { PdfToolLayout } from '@/components/pdf/PdfToolLayout';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import { PdfProgress } from '@/components/pdf/PdfProgress';
import { PdfResult } from '@/components/pdf/PdfResult';
import { PdfError } from '@/components/pdf/PdfError';
import {
  PenTool,
  Upload,
  Type,
  FileCheck,
  Trash2,
  Move,
  ChevronLeft,
  ChevronRight,
  Plus,
  Stamp,
  RotateCcw,
  Check,
  Sparkles,
  ShieldCheck,
  Calendar,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

export default function SignPdfPage() {
  const tool = getToolBySlug('sign')!;

  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number>(0);

  // PDF Viewer State
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [thumbnails, setThumbnails] = useState<PageThumbnail[]>([]);
  const [currentThumbUrl, setCurrentThumbUrl] = useState<string>('');

  // Signature Creation State
  const [activeTab, setActiveTab] = useState<'draw' | 'stamp' | 'type' | 'upload'>('draw');
  const [penColor, setPenColor] = useState<string>('#0033cc'); // Blue (legal standard in TH)
  const [penWidth, setPenWidth] = useState<number>(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Stamp "สำเนาถูกต้อง" State
  const [stampPurpose, setStampPurpose] = useState<string>('ใช้สำหรับสมัครงานเท่านั้น');
  const [stampDate, setStampDate] = useState<string>('');

  // Type Name State
  const [typedName, setTypedName] = useState<string>('');
  const [fontFamily, setFontFamily] = useState<string>('cursive');

  // Placed Signatures State
  const [placedSignatures, setPlacedSignatures] = useState<PlacedSignature[]>([]);
  const [selectedSigId, setSelectedSigId] = useState<string | null>(null);

  // DOM Refs
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const pageContainerRef = useRef<HTMLDivElement | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  // Set default Thai date for stamp
  useEffect(() => {
    const now = new Date();
    const thaiMonths = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
    ];
    const d = now.getDate();
    const m = thaiMonths[now.getMonth()];
    const y = now.getFullYear() + 543;
    setStampDate(`${d} ${m} ${y}`);
  }, []);

  // Cleanup result URL
  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  // Update current page thumbnail
  useEffect(() => {
    if (thumbnails.length > 0) {
      const found = thumbnails.find((t) => t.pageNumber === currentPage);
      if (found) setCurrentThumbUrl(found.dataUrl);
    }
  }, [currentPage, thumbnails]);

  // File Upload Handler
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
    setProgress(10);
    setProgressMsg('กำลังเตรียมเอกสาร PDF สำหรับลงลายเซ็น...');

    try {
      const count = await pdfService.getPageCount(selectedFile);
      setTotalPages(count);
      setCurrentPage(1);

      const thumbs = await pdfService.renderThumbnails(selectedFile, 100, 1.2);
      setThumbnails(thumbs);
      if (thumbs[0]) setCurrentThumbUrl(thumbs[0].dataUrl);
    } catch (err) {
      setError(`ไม่สามารถเปิดอ่านไฟล์ PDF ได้: ${(err as Error).message}`);
      setStep(1);
    }
  };

  // Drawing Canvas Logic
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  // Generate PNG data URL from current active tab
  const generateSignatureDataUrl = (): string | null => {
    if (activeTab === 'draw') {
      const canvas = drawCanvasRef.current;
      if (!canvas || !hasDrawn) return null;
      return canvas.toDataURL('image/png');
    }

    if (activeTab === 'stamp') {
      const stampCanvas = document.createElement('canvas');
      stampCanvas.width = 400;
      stampCanvas.height = 160;
      const ctx = stampCanvas.getContext('2d');
      if (!ctx) return null;

      // Clean transparent background
      ctx.clearRect(0, 0, stampCanvas.width, stampCanvas.height);

      ctx.fillStyle = penColor;
      ctx.strokeStyle = penColor;

      // Draw dashed border stamp box
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(10, 10, 380, 140);
      ctx.setLineDash([]);

      // Draw "สำเนาถูกต้อง"
      ctx.font = 'bold 22px Prompt, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('สำเนาถูกต้อง', 200, 45);

      // Draw purpose text
      ctx.font = '14px Prompt, sans-serif';
      ctx.fillText(stampPurpose, 200, 75);

      // Draw date text
      ctx.font = '12px Prompt, sans-serif';
      ctx.fillText(`วันที่: ${stampDate}`, 200, 100);

      // If user drew a signature, overlay it inside the stamp!
      const drawCanvas = drawCanvasRef.current;
      if (drawCanvas && hasDrawn) {
        ctx.drawImage(drawCanvas, 100, 95, 200, 50);
      } else {
        ctx.fillText('(ลงลายมือชื่อ)', 200, 130);
      }

      return stampCanvas.toDataURL('image/png');
    }

    if (activeTab === 'type') {
      if (!typedName.trim()) return null;
      const nameCanvas = document.createElement('canvas');
      nameCanvas.width = 400;
      nameCanvas.height = 120;
      const ctx = nameCanvas.getContext('2d');
      if (!ctx) return null;

      ctx.clearRect(0, 0, nameCanvas.width, nameCanvas.height);
      ctx.fillStyle = penColor;
      ctx.font = fontFamily === 'cursive' ? 'italic 36px "Brush Script MT", cursive, sans-serif' : 'bold 30px Prompt, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(typedName, 200, 60);

      return nameCanvas.toDataURL('image/png');
    }

    return null;
  };

  // Add signature to current page
  const handlePlaceOnPage = () => {
    const dataUrl = generateSignatureDataUrl();
    if (!dataUrl) {
      alert('กรุณาวาดลายเซ็น หรือพิมพ์ชื่อก่อนวางลงบนเอกสาร');
      return;
    }

    // Default placement centered near bottom of the page
    const newSig: PlacedSignature = {
      id: `sig_${Date.now()}`,
      pageNumber: currentPage,
      dataUrl,
      relX: 0.35, // 35% from left
      relY: 0.70, // 70% from top
      relWidth: activeTab === 'stamp' ? 0.38 : 0.28,
      relHeight: activeTab === 'stamp' ? 0.16 : 0.10,
    };

    setPlacedSignatures((prev) => [...prev, newSig]);
    setSelectedSigId(newSig.id);
  };

  // Upload custom PNG signature
  const handleSignatureImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const newSig: PlacedSignature = {
        id: `sig_${Date.now()}`,
        pageNumber: currentPage,
        dataUrl,
        relX: 0.35,
        relY: 0.70,
        relWidth: 0.25,
        relHeight: 0.10,
      };
      setPlacedSignatures((prev) => [...prev, newSig]);
      setSelectedSigId(newSig.id);
    };
    reader.readAsDataURL(uploadedFile);
  };

  const removePlacedSignature = (id: string) => {
    setPlacedSignatures((prev) => prev.filter((s) => s.id !== id));
    if (selectedSigId === id) setSelectedSigId(null);
  };

  // Mouse / Touch Dragging Handler
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
    sig: PlacedSignature
  ) => {
    if ('button' in e && e.button !== 0) return;
    e.stopPropagation();
    setSelectedSigId(sig.id);
    setIsDragging(true);

    const container = pageContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const startClientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const startClientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const startRelX = sig.relX;
    const startRelY = sig.relY;

    const onMove = (moveEvent: MouseEvent | TouchEvent) => {
      moveEvent.preventDefault();
      const currentClientX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const currentClientY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;

      const deltaX = currentClientX - startClientX;
      const deltaY = currentClientY - startClientY;

      const newRelX = Math.max(0, Math.min(1 - sig.relWidth, startRelX + deltaX / rect.width));
      const newRelY = Math.max(0, Math.min(1 - sig.relHeight, startRelY + deltaY / rect.height));

      setPlacedSignatures((prev) =>
        prev.map((s) => (s.id === sig.id ? { ...s, relX: newRelX, relY: newRelY } : s))
      );
    };

    const onEnd = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };

    window.addEventListener('mousemove', onMove, { passive: false });
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  };

  // Corner Resize Handler
  const handleResizeStart = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
    sig: PlacedSignature
  ) => {
    if ('button' in e && e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();

    const container = pageContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const startClientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const startRelWidth = sig.relWidth;
    const aspectRatio = sig.relHeight / sig.relWidth;

    const onMove = (moveEvent: MouseEvent | TouchEvent) => {
      moveEvent.preventDefault();
      const currentClientX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const deltaX = currentClientX - startClientX;
      const deltaRelWidth = deltaX / rect.width;

      const newW = Math.max(0.08, Math.min(0.95 - sig.relX, startRelWidth + deltaRelWidth));
      const newH = Math.max(0.03, Math.min(0.95 - sig.relY, newW * aspectRatio));

      setPlacedSignatures((prev) =>
        prev.map((s) => (s.id === sig.id ? { ...s, relWidth: newW, relHeight: newH } : s))
      );
    };

    const onEnd = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };

    window.addEventListener('mousemove', onMove, { passive: false });
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  };

  // Nudge Signature with buttons
  const handleNudge = (id: string, deltaRelX: number, deltaRelY: number) => {
    setPlacedSignatures((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const newRelX = Math.max(0, Math.min(1 - s.relWidth, s.relX + deltaRelX));
        const newRelY = Math.max(0, Math.min(1 - s.relHeight, s.relY + deltaRelY));
        return { ...s, relX: newRelX, relY: newRelY };
      })
    );
  };

  // Quick Position Placement
  const handleQuickPosition = (id: string, pos: 'bottom-right' | 'bottom-left' | 'bottom-center' | 'center') => {
    setPlacedSignatures((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        if (pos === 'bottom-right') {
          return { ...s, relX: Math.max(0, 0.95 - s.relWidth), relY: Math.max(0, 0.88 - s.relHeight) };
        }
        if (pos === 'bottom-left') {
          return { ...s, relX: 0.05, relY: Math.max(0, 0.88 - s.relHeight) };
        }
        if (pos === 'bottom-center') {
          return { ...s, relX: Math.max(0, (1 - s.relWidth) / 2), relY: Math.max(0, 0.88 - s.relHeight) };
        }
        if (pos === 'center') {
          return { ...s, relX: Math.max(0, (1 - s.relWidth) / 2), relY: Math.max(0, (1 - s.relHeight) / 2) };
        }
        return s;
      })
    );
  };

  // Resize signature
  const handleScaleChange = (id: string, scaleFactor: number) => {
    setPlacedSignatures((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const newW = Math.max(0.08, Math.min(0.85, s.relWidth * scaleFactor));
        const newH = Math.max(0.03, Math.min(0.5, s.relHeight * scaleFactor));
        return { ...s, relWidth: newW, relHeight: newH };
      })
    );
  };

  // Generate Signed PDF
  const handleSaveAndDownload = async () => {
    if (!file || placedSignatures.length === 0) {
      alert('กรุณาวางลายเซ็นลงบนเอกสารอย่างน้อย 1 จุดก่อนบันทึก');
      return;
    }

    setError(null);
    setProgress(15);
    setProgressMsg('กำลังผนวกลายเซ็นและบันทึกเอกสาร PDF...');

    try {
      const result = await pdfService.sign(file, {
        signatures: placedSignatures,
        onProgress: (p, msg) => {
          setProgress(p);
          setProgressMsg(msg);
        },
      });

      const url = URL.createObjectURL(result.blob);
      setResultUrl(url);
      setResultSize(result.size);
      setStep(3);
    } catch (err) {
      setError(`เกิดข้อผิดพลาดในการลงลายเซ็น: ${(err as Error).message}`);
    }
  };

  const handleReset = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null);
    setStep(1);
    setPlacedSignatures([]);
    setSelectedSigId(null);
    setThumbnails([]);
    setResultUrl(null);
    setError(null);
  };

  // Signatures on current page
  const currentPageSignatures = placedSignatures.filter(
    (s) => s.pageNumber === currentPage
  );

  return (
    <PdfToolLayout
      tool={tool}
      currentStep={step}
      faqs={[
        {
          question: 'ลายเซ็นอิเล็กทรอนิกส์บนเว็บนี้มีผลทางกฎหมายในประเทศไทยหรือไม่?',
          answer: 'มีผลทางกฎหมายครับ ตาม พ.ร.บ. ว่าด้วยธุรกรรมทางอิเล็กทรอนิกส์ พ.ศ. 2544 มาตรา 9 และมาตรา 26 การลงลายมือชื่ออิเล็กทรอนิกส์ (e-Signature) สามารถใช้ในการทำสัญญา สมัครงาน หรือเอกสารทางธุรกิจได้ตามกฎหมายไทย',
        },
        {
          question: 'การเซ็นรับรองสำเนาถูกต้องบน TOOL HUB ปลอดภัยแค่ไหน?',
          answer: 'ปลอดภัยสูงสุด 100% เพราะระบบทำงานบนเครื่องของคุณโดยตรง (Client-Side) ทั้งลายเซ็นและไฟล์เอกสารจะไม่ถูกส่งออกนอกคอมพิวเตอร์หรือมือถือของคุณ มั่นใจได้ว่าลายเซ็นจะไม่ถูกนำไปใช้ในทางที่ผิด',
        },
        {
          question: 'สามารถระบุวัตถุประสงค์ในการรับรองสำเนาถูกต้องได้หรือไม่?',
          answer: 'ได้ครับ ระบบมีตัวเลือก "รับรองสำเนาถูกต้อง" พร้อมระบุวันที่และวัตถุประสงค์ เช่น "ใช้สำหรับสมัครงานเท่านั้น" เพื่อป้องกันการนำสำเนาไปใช้ผิดวัตถุประสงค์ได้อย่างรัดกุม',
        },
      ]}
    >
      {/* STEP 1: Upload PDF */}
      {step === 1 && (
        <div className="max-w-4xl mx-auto">
          <PdfDropzone
            onFilesSelected={handleFileSelected}
            accept=".pdf,application/pdf"
            maxFiles={1}
            maxFileSizeMb={Math.round(tool.maxFileSize / (1024 * 1024))}
            title="ลากไฟล์ PDF มาวางที่นี่เพื่อเริ่มเซ็นชื่อ"
            subtitle="หรือคลิกเพื่อเลือกไฟล์เอกสาร (สัญญา, ใบสมัครงาน, บัตรประชาชน, ทรานสคริปต์)"
          />

          {error && <PdfError message={error} onReset={() => setError(null)} />}

          {/* Quick Features Highlight */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-start gap-3">
              <PenTool size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">วาดลายเซ็นสดใส</h4>
                <p className="text-slate-500 mt-0.5">ใช้นิ้ว ปากกาสไตลัส หรือเมาส์ วาดเส้นนุ่มนวล หมึกสีน้ำเงินมาตรฐาน</p>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-start gap-3">
              <Stamp size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">ตรายางรับรองสำเนา</h4>
                <p className="text-slate-500 mt-0.5">มีปั๊มสำเนาถูกต้องพร้อมลงวันที่และระบุวัตถุประสงค์ ไม่ให้ถูกสวมรอย</p>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-start gap-3">
              <ShieldCheck size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">ปลอดภัย ไม่ส่งขึ้นคลาวด์</h4>
                <p className="text-slate-500 mt-0.5">ข้อมูลส่วนบุคคลและลายเซ็นประมวลผลใน RAM เครื่องคุณ 100%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Interactive Signing Canvas */}
      {step === 2 && (
        <div className="max-w-7xl mx-auto space-y-6">
          {error && <PdfError message={error} onReset={() => setError(null)} />}

          {/* Top Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold">
                <FileCheck size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">กำลังเปิดไฟล์</p>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white max-w-xs truncate" title={file?.name}>
                  {file?.name}
                </h3>
              </div>
            </div>

            {/* Page Navigation */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 px-2">
                หน้า {currentPage} จาก {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-600 transition"
              >
                เปลี่ยนไฟล์
              </button>
              <button
                type="button"
                onClick={handleSaveAndDownload}
                disabled={placedSignatures.length === 0}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 disabled:opacity-40 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Check size={16} />
                <span>บันทึกและดาวน์โหลด PDF ({placedSignatures.length} จุด)</span>
              </button>
            </div>
          </div>

          {/* Main Work Area: Left = PDF Page Preview, Right = Signature Creation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: PDF Page with Dropped Signatures (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <div
                ref={pageContainerRef}
                className="relative border-2 border-slate-300 dark:border-slate-700 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-lg max-w-full"
                style={{ minHeight: '500px' }}
              >
                {/* Rendered PDF Page Background */}
                {currentThumbUrl ? (
                  <img
                    src={currentThumbUrl}
                    alt={`หน้า ${currentPage}`}
                    className="w-full h-auto block select-none pointer-events-none"
                  />
                ) : (
                  <div className="p-20 text-center text-slate-400 text-xs">กำลังแสดงตัวอย่างหน้า...</div>
                )}

                {/* Overlaid Placed Signatures on Current Page */}
                {currentPageSignatures.map((sig) => {
                  const isSelected = selectedSigId === sig.id;
                  return (
                    <div
                      key={sig.id}
                      onMouseDown={(e) => handleDragStart(e, sig)}
                      onTouchStart={(e) => handleDragStart(e, sig)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSigId(sig.id);
                      }}
                      className={`absolute select-none group transition-shadow ${
                        isSelected
                          ? 'ring-2 ring-blue-500 shadow-2xl z-20 cursor-grab active:cursor-grabbing'
                          : 'hover:ring-1 hover:ring-blue-300 z-10 cursor-pointer'
                      }`}
                      style={{
                        left: `${sig.relX * 100}%`,
                        top: `${sig.relY * 100}%`,
                        width: `${sig.relWidth * 100}%`,
                        height: `${sig.relHeight * 100}%`,
                      }}
                    >
                      <img
                        src={sig.dataUrl}
                        alt="ลายเซ็น"
                        className="w-full h-full object-contain pointer-events-none"
                      />

                      {/* Top Bar for Selected Signature */}
                      {isSelected && (
                        <>
                          {/* Drag Badge */}
                          <div className="absolute -top-7 left-0 bg-blue-600 text-white rounded-lg px-2 py-0.5 text-[10px] font-bold shadow-md flex items-center gap-1 cursor-grab active:cursor-grabbing select-none pointer-events-none">
                            <Move size={11} />
                            <span>ลากเลื่อนตำแหน่ง</span>
                          </div>

                          {/* Quick Scale & Delete Toolbar */}
                          <div className="absolute -top-7 right-0 flex items-center gap-1 bg-slate-900 text-white rounded-lg px-2 py-0.5 text-[10px] font-bold shadow-md z-20">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleScaleChange(sig.id, 0.9);
                              }}
                              className="hover:text-blue-300 px-1 font-bold"
                              title="ย่อขนาด"
                            >
                              - ย่อ
                            </button>
                            <span className="text-slate-500">|</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleScaleChange(sig.id, 1.1);
                              }}
                              className="hover:text-blue-300 px-1 font-bold"
                              title="ขยายขนาด"
                            >
                              + ขยาย
                            </button>
                            <span className="text-slate-500">|</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removePlacedSignature(sig.id);
                              }}
                              className="hover:text-rose-400 text-rose-300 px-1"
                              title="ลบ"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>

                          {/* Corner Resize Handle */}
                          <div
                            onMouseDown={(e) => handleResizeStart(e, sig)}
                            onTouchStart={(e) => handleResizeStart(e, sig)}
                            className="absolute -bottom-2.5 -right-2.5 w-6 h-6 bg-blue-600 hover:bg-blue-700 border-2 border-white rounded-full cursor-nwse-resize shadow-md flex items-center justify-center text-white text-[9px] font-bold z-30 select-none"
                            title="ลากเพื่อปรับขนาดลายเซ็น"
                          >
                            ↔
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Selected Signature Precision Control Panel */}
              {selectedSigId && (
                <div className="mt-4 w-full p-4 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 rounded-2xl shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Move size={14} className="text-blue-600" />
                      <span>ปรับตำแหน่งลายเซ็นที่เลือก (คลิกลากที่รูป หรือใช้ปุ่มด้านล่าง)</span>
                    </span>

                    {/* Quick Position Pills */}
                    <div className="flex flex-wrap gap-1.5 text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => handleQuickPosition(selectedSigId, 'bottom-right')}
                        className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-600 hover:bg-blue-100 rounded-lg border border-blue-200 dark:border-blue-900 transition"
                      >
                        มุมล่างขวา
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickPosition(selectedSigId, 'bottom-center')}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 rounded-lg transition"
                      >
                        กึ่งกลางล่าง
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickPosition(selectedSigId, 'bottom-left')}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 rounded-lg transition"
                      >
                        มุมล่างซ้าย
                      </button>
                    </div>
                  </div>

                  {/* Nudge Direction Buttons */}
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleNudge(selectedSigId, 0, -0.03)}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1 transition"
                      title="เลื่อนขึ้น"
                    >
                      <ArrowUp size={14} /> <span>ขึ้น</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNudge(selectedSigId, 0, 0.03)}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1 transition"
                      title="เลื่อนลง"
                    >
                      <ArrowDown size={14} /> <span>ลง</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNudge(selectedSigId, -0.03, 0)}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1 transition"
                      title="เลื่อนซ้าย"
                    >
                      <ArrowLeft size={14} /> <span>ซ้าย</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNudge(selectedSigId, 0.03, 0)}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1 transition"
                      title="เลื่อนขวา"
                    >
                      <ArrowRight size={14} /> <span>ขวา</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Instructions below preview */}
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 text-center">
                💡 สามารถคลิกค้างแล้วลากลายเซ็นไปวางที่จุดใดก็ได้บนเอกสาร หรือใช้ปุ่มลูกศรเพื่อจัดตำแหน่งให้ตรงจุด
              </p>
            </div>

            {/* Right Column: Signature Tools Panel (5 Cols) */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <PenTool size={18} className="text-blue-600" />
                  <span>สร้างลายเซ็น / ตรายาง</span>
                </h3>

                {/* Signature Source Tabs */}
                <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-5 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setActiveTab('draw')}
                    className={`py-2 px-1 text-center rounded-xl transition ${
                      activeTab === 'draw'
                        ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    วาดลายเซ็น
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('stamp')}
                    className={`py-2 px-1 text-center rounded-xl transition ${
                      activeTab === 'stamp'
                        ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    สำเนาถูกต้อง
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('type')}
                    className={`py-2 px-1 text-center rounded-xl transition ${
                      activeTab === 'type'
                        ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    พิมพ์ชื่อ
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('upload')}
                    className={`py-2 px-1 text-center rounded-xl transition ${
                      activeTab === 'upload'
                        ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    อัปโหลดรูป
                  </button>
                </div>

                {/* TAB 1: DRAW CANVAS */}
                {activeTab === 'draw' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">สีหมึก:</span>
                        <button
                          type="button"
                          onClick={() => setPenColor('#0033cc')}
                          className={`w-6 h-6 rounded-full bg-[#0033cc] border-2 transition ${
                            penColor === '#0033cc' ? 'border-white ring-2 ring-blue-500 scale-110' : 'border-transparent'
                          }`}
                          title="สีน้ำเงิน (มาตรฐานราชการ/ธนาคาร)"
                        />
                        <button
                          type="button"
                          onClick={() => setPenColor('#000000')}
                          className={`w-6 h-6 rounded-full bg-black border-2 transition ${
                            penColor === '#000000' ? 'border-white ring-2 ring-slate-700 scale-110' : 'border-transparent'
                          }`}
                          title="สีดำ"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={clearCanvas}
                        className="text-xs text-rose-600 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <RotateCcw size={12} />
                        <span>ล้างลายเซ็น</span>
                      </button>
                    </div>

                    {/* Canvas Area */}
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-white p-2">
                      <canvas
                        ref={drawCanvasRef}
                        width={400}
                        height={160}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-36 touch-none cursor-crosshair block rounded-xl bg-slate-50/50"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 text-center">
                      วาดลายเซ็นด้วยนิ้ว ปากกาแท็บเล็ต หรือเมาส์
                    </p>
                  </div>
                )}

                {/* TAB 2: CERTIFIED TRUE COPY STAMP */}
                {activeTab === 'stamp' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        วัตถุประสงค์ในการใช้สำเนา
                      </label>
                      <select
                        value={stampPurpose}
                        onChange={(e) => setStampPurpose(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="ใช้สำหรับสมัครงานเท่านั้น">ใช้สำหรับสมัครงานเท่านั้น</option>
                        <option value="ใช้สำหรับยื่นสอบ ก.พ. เท่านั้น">ใช้สำหรับยื่นสอบ ก.พ. เท่านั้น</option>
                        <option value="ใช้สำหรับเปิดบัญชีธนาคารเท่านั้น">ใช้สำหรับเปิดบัญชีธนาคารเท่านั้น</option>
                        <option value="ใช้สำหรับติดต่อราชการเท่านั้น">ใช้สำหรับติดต่อราชการเท่านั้น</option>
                        <option value="ใช้สำหรับการทำสัญญาเท่านั้น">ใช้สำหรับการทำสัญญาเท่านั้น</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        วันที่รับรอง
                      </label>
                      <input
                        type="text"
                        value={stampDate}
                        onChange={(e) => setStampDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-800 dark:text-blue-300">
                      💡 <strong>เคล็ดลับ:</strong> หากต้องการให้ลายเซ็นของคุณประทับอยู่ข้างในตรายางรับรอง ให้ไปที่แท็บ <strong>"วาดลายเซ็น"</strong> เพื่อเซ็นชื่อไว้ก่อน จากนั้นกลับมากดปุ่มวางที่นี่ได้ทันทีครับ
                    </div>
                  </div>
                )}

                {/* TAB 3: TYPE NAME */}
                {activeTab === 'type' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        พิมพ์ชื่อ-นามสกุลของคุณ
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น นายสมชาย ใจดี หรือ Somchai Jaidee"
                        value={typedName}
                        onChange={(e) => setTypedName(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        รูปแบบตัวอักษร
                      </label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setFontFamily('cursive')}
                          className={`p-2.5 rounded-xl border text-center transition ${
                            fontFamily === 'cursive'
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-600 font-bold'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <span className="italic font-serif text-sm">ลายมือตัวเขียน</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFontFamily('sans')}
                          className={`p-2.5 rounded-xl border text-center transition ${
                            fontFamily === 'sans'
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-600 font-bold'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <span>ตัวพิมพ์มาตรฐาน</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: UPLOAD SIGNATURE IMAGE */}
                {activeTab === 'upload' && (
                  <div className="space-y-4 text-center">
                    <input
                      ref={uploadInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleSignatureImageUpload}
                    />
                    <div
                      onClick={() => uploadInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-2xl p-6 cursor-pointer transition flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900"
                    >
                      <Upload size={28} className="text-blue-600 mb-2" />
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        คลิกเพื่อเลือกรูปภาพลายเซ็น (PNG / JPG)
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        แนะนำรูปภาพลายเซ็นที่พื้นหลังโปร่งใส
                      </p>
                    </div>
                  </div>
                )}

                {/* Place on Current Page Button */}
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handlePlaceOnPage}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus size={16} />
                    <span>วางลงบนเอกสารหน้า {currentPage}</span>
                  </button>
                </div>
              </div>

              {/* Placed Signatures Summary List */}
              {placedSignatures.length > 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      ลายเซ็นที่วางไว้ ({placedSignatures.length} จุด)
                    </h4>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {placedSignatures.map((sig, idx) => (
                      <div
                        key={sig.id}
                        onClick={() => {
                          setCurrentPage(sig.pageNumber);
                          setSelectedSigId(sig.id);
                        }}
                        className="flex items-center justify-between p-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 cursor-pointer hover:border-blue-300 transition text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 font-bold flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            หน้า {sig.pageNumber}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removePlacedSignature(sig.id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Result & Download */}
      {step === 3 && resultUrl && file && (
        <div className="max-w-xl mx-auto">
          <PdfResult
            message={`ลงลายมือชื่อในเอกสาร PDF เรียบร้อยแล้ว! (${placedSignatures.length} จุด)`}
            downloadUrl={resultUrl}
            filename={`signed_${file.name}`}
            fileSizeBytes={resultSize}
            onReset={handleReset}
          />
        </div>
      )}
    </PdfToolLayout>
  );
}
