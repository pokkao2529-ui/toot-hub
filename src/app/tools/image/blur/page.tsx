'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  Download,
  Trash2,
  ImageMinus,
  Undo2,
  Grid,
  Droplets,
  ImageIcon
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AdBanner } from '@/components/ads/AdBanner';
import { JsonLd } from '@/components/seo/JsonLd';

type ToolMode = 'blur' | 'mosaic';
type Action = { type: ToolMode; x: number; y: number; width: number; height: number; intensity: number };

export default function BlurImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [mode, setMode] = useState<ToolMode>('blur');
  const [intensity, setIntensity] = useState<number>(10);
  const [actions, setActions] = useState<Action[]>([]);
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{x: number, y: number} | null>(null);
  const [currentPos, setCurrentPos] = useState<{x: number, y: number} | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    
    setFile(selected);
    setActions([]);
    
    const url = URL.createObjectURL(selected);
    const img = new Image();
    img.onload = () => {
      setImageObj(img);
    };
    img.src = url;
  };

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const displayCanvas = displayCanvasRef.current;
    if (!canvas || !displayCanvas || !imageObj) return;

    const ctx = canvas.getContext('2d');
    const displayCtx = displayCanvas.getContext('2d');
    if (!ctx || !displayCtx) return;

    // Set real canvas size to image original size
    canvas.width = imageObj.width;
    canvas.height = imageObj.height;

    // Draw base image
    ctx.filter = 'none';
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(imageObj, 0, 0);

    // Apply all actions
    actions.forEach(action => {
      // We extract the region
      const { x, y, width, height, type, intensity: actIntensity } = action;
      
      // Ensure width/height are positive
      const rx = width < 0 ? x + width : x;
      const ry = height < 0 ? y + height : y;
      const rw = Math.abs(width);
      const rh = Math.abs(height);

      if (rw === 0 || rh === 0) return;

      if (type === 'blur') {
        // Use scale-down + scale-up approach (works on ALL browsers incl. iOS Safari)
        // ctx.filter is NOT supported on iOS Safari < 18 and some Android browsers
        const blurLevel = Math.max(2, actIntensity);
        // Scale factor: the more we shrink, the blurrier it appears after scaling up
        const scaleFactor = Math.max(0.02, 1 / blurLevel);
        const offW = Math.max(2, Math.round(rw * scaleFactor));
        const offH = Math.max(2, Math.round(rh * scaleFactor));

        const off = document.createElement('canvas');
        off.width = offW;
        off.height = offH;
        const offCtx = off.getContext('2d');
        if (offCtx) {
          offCtx.imageSmoothingEnabled = true;
          offCtx.imageSmoothingQuality = 'low';
          offCtx.drawImage(canvas, rx, ry, rw, rh, 0, 0, offW, offH);

          // Scale back up to original region (blurry)
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'low';
          ctx.drawImage(off, 0, 0, offW, offH, rx, ry, rw, rh);
          ctx.imageSmoothingQuality = 'high'; // reset
        }
      } else if (type === 'mosaic') {
        const off = document.createElement('canvas');
        // Scale down then up
        const scale = 1 / (actIntensity * 0.5 + 1);
        off.width = Math.max(1, rw * scale);
        off.height = Math.max(1, rh * scale);
        const offCtx = off.getContext('2d');
        if (offCtx) {
          offCtx.imageSmoothingEnabled = false;
          offCtx.drawImage(canvas, rx, ry, rw, rh, 0, 0, off.width, off.height);
          
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(off, 0, 0, off.width, off.height, rx, ry, rw, rh);
          ctx.imageSmoothingEnabled = true; // reset
        }
      }
    });

    // Draw to display canvas
    // Fit to container width while maintaining aspect ratio
    const container = containerRef.current;
    if (container) {
      const containerWidth = container.clientWidth;
      const scale = Math.min(1, containerWidth / imageObj.width);
      
      displayCanvas.width = imageObj.width * scale;
      displayCanvas.height = imageObj.height * scale;
      
      displayCtx.drawImage(canvas, 0, 0, displayCanvas.width, displayCanvas.height);

      // Draw current selection rectangle if drawing
      if (isDrawing && startPos && currentPos) {
        displayCtx.strokeStyle = '#ef4444';
        displayCtx.lineWidth = 2;
        displayCtx.setLineDash([5, 5]);
        
        const rw = (currentPos.x - startPos.x) * scale;
        const rh = (currentPos.y - startPos.y) * scale;
        
        displayCtx.strokeRect(startPos.x * scale, startPos.y * scale, rw, rh);
        displayCtx.setLineDash([]);
        
        // Fill semi-transparent
        displayCtx.fillStyle = 'rgba(239, 68, 68, 0.2)';
        displayCtx.fillRect(startPos.x * scale, startPos.y * scale, rw, rh);
      }
    }
  }, [imageObj, actions, isDrawing, startPos, currentPos]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const getMousePos = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const displayCanvas = displayCanvasRef.current;
    if (!displayCanvas || !imageObj) return null;
    
    const rect = displayCanvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const scale = imageObj.width / displayCanvas.width;
    
    return {
      x: (clientX - rect.left) * scale,
      y: (clientY - rect.top) * scale
    };
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling on touch
    const pos = getMousePos(e);
    if (pos) {
      setIsDrawing(true);
      setStartPos(pos);
      setCurrentPos(pos);
    }
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getMousePos(e);
    if (pos) {
      setCurrentPos(pos);
    }
  };

  const handlePointerUp = () => {
    if (!isDrawing || !startPos || !currentPos) return;
    
    const width = currentPos.x - startPos.x;
    const height = currentPos.y - startPos.y;
    
    if (Math.abs(width) > 10 && Math.abs(height) > 10) {
      setActions([...actions, {
        type: mode,
        x: startPos.x,
        y: startPos.y,
        width,
        height,
        intensity
      }]);
    }
    
    setIsDrawing(false);
    setStartPos(null);
    setCurrentPos(null);
  };

  const undo = () => {
    setActions(actions.slice(0, -1));
  };

  const clearAll = () => {
    setFile(null);
    setImageObj(null);
    setActions([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadResult = () => {
    const canvas = canvasRef.current;
    if (!canvas || !file) return;
    
    const url = canvas.toDataURL(file.type || 'image/jpeg', 0.95);
    const a = document.createElement('a');
    a.href = url;
    const ext = file.type === 'image/png' ? 'png' : 'jpg';
    a.download = `censored_${file.name.split('.')[0]}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <JsonLd
        title="เบลอรูปภาพ เซ็นเซอร์รูป (Blur & Mosaic) — TOOL HUB"
        description="เบลอรูปภาพออนไลน์ เบลอใบหน้า ทำโมเสก เซ็นเซอร์ข้อมูลสำคัญ เลือกพื้นที่ได้เองฟรี 100% ไม่ติดลายน้ำ ทำงานบนเบราว์เซอร์ ปลอดภัย"
        url="/tools/image/blur"
      />

      <Header />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-4">
        <AdBanner slotId="top-banner-blur" format="horizontal" />
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-950/60 px-4 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900 mb-3">
            <ImageMinus size={14} />
            <span>ฟรี 100% • เลือกวาดพื้นที่เพื่อเซ็นเซอร์ภาพได้ตามต้องการ</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-3">
            เบลอรูปภาพ & โมเสก (เซ็นเซอร์)
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            เซ็นเซอร์ใบหน้า ปิดบังข้อมูลส่วนตัวบนรูปภาพ ทำงานในเครื่องของคุณ 100% รูปไม่รั่วไหล
          </p>
        </div>

        <div className="max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 p-4 sm:p-8">
          
          {!imageObj ? (
            <div 
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition group"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Upload size={32} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">อัปโหลดรูปภาพเพื่อเริ่มเซ็นเซอร์</h3>
              <p className="text-sm text-slate-500 mb-6 text-center">
                รองรับไฟล์ JPG, PNG, WebP
              </p>
              <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition">
                <ImageIcon size={18} /> เลือกรูปภาพ
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              {/* Toolbar */}
              <div className="lg:col-span-1 space-y-6 bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 h-fit">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 block">
                    รูปแบบเซ็นเซอร์
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setMode('blur')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition ${
                        mode === 'blur'
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <Droplets size={24} className="mb-2" />
                      <span className="text-sm font-semibold">เบลอ</span>
                    </button>
                    <button
                      onClick={() => setMode('mosaic')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition ${
                        mode === 'mosaic'
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <Grid size={24} className="mb-2" />
                      <span className="text-sm font-semibold">โมเสก</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex justify-between">
                    <span>ความเข้มข้น (ระดับเซ็นเซอร์)</span>
                    <span className="text-indigo-600 dark:text-indigo-400">{intensity}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={intensity}
                    onChange={(e) => setIntensity(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <button
                    onClick={undo}
                    disabled={actions.length === 0}
                    className="w-full px-4 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    <Undo2 size={18} /> เลิกทำล่าสุด
                  </button>
                  <button
                    onClick={downloadResult}
                    className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition"
                  >
                    <Download size={18} /> บันทึกรูปภาพ
                  </button>
                  <button
                    onClick={clearAll}
                    className="w-full px-4 py-2 text-slate-500 hover:text-red-500 font-medium text-sm transition"
                  >
                    เปลี่ยนรูปใหม่
                  </button>
                </div>
              </div>

              {/* Canvas Area */}
              <div className="lg:col-span-3 flex flex-col">
                <div 
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex items-center justify-center relative touch-none"
                  ref={containerRef}
                  style={{ minHeight: '400px' }}
                >
                  {/* Hidden true canvas used for export */}
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {/* Display canvas that user interacts with */}
                  <canvas 
                    ref={displayCanvasRef} 
                    className="cursor-crosshair touch-none"
                    onMouseDown={handlePointerDown}
                    onMouseMove={handlePointerMove}
                    onMouseUp={handlePointerUp}
                    onMouseLeave={handlePointerUp}
                    onTouchStart={handlePointerDown}
                    onTouchMove={handlePointerMove}
                    onTouchEnd={handlePointerUp}
                    onTouchCancel={handlePointerUp}
                  />

                  {/* Hint overlay initially */}
                  {actions.length === 0 && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur pointer-events-none animate-pulse">
                      ลากเมาส์ครอบบริเวณที่ต้องการเซ็นเซอร์
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/jpeg,image/png,image/webp"
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
