import { PDFDocument } from 'pdf-lib';

export type CompressionPreset = 'extreme' | 'recommended' | 'high';

export interface CompressPdfOptions {
  preset?: CompressionPreset;
  onProgress?: (progress: number, message: string) => void;
}

export interface CompressPdfResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  pageCount: number;
  savedPercentage: number;
}

async function getPdfjs() {
  const pdfjs = await import('pdfjs-dist');
  if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
  }
  return pdfjs;
}

/**
 * Compresses a PDF document client-side by optimizing embedded page content and canvas render scale.
 * 100% private, runs entirely inside the user's browser memory without server uploads.
 */
export async function compressPdf(
  file: File | ArrayBuffer,
  options: CompressPdfOptions = {}
): Promise<CompressPdfResult> {
  const preset = options.preset || 'recommended';

  // Preset configuration
  const presetConfig = {
    extreme: { scale: 1.0, quality: 0.58, desc: 'บีบอัดขั้นสุด (เน้นไฟล์เล็กจิ๋ว)' },
    recommended: { scale: 1.35, quality: 0.72, desc: 'สมดุล (ลด 60-80% คมชัดเหมือนเดิม)' },
    high: { scale: 1.75, quality: 0.85, desc: 'คุณภาพสูง (รักษาความละเอียดสูงสุด)' },
  }[preset];

  options.onProgress?.(5, 'กำลังโหลดและวิเคราะห์โครงสร้างเอกสาร PDF...');

  const originalArrayBuffer = file instanceof File ? await file.arrayBuffer() : file;
  const originalSize = originalArrayBuffer.byteLength;

  const pdfjs = await getPdfjs();
  const loadingTask = pdfjs.getDocument({ data: originalArrayBuffer });
  const pdf = await loadingTask.promise;
  const pageCount = pdf.numPages;

  options.onProgress?.(12, `พบเอกสารทั้งหมด ${pageCount} หน้า กำลังเริ่มการบีบอัด...`);

  // Create target compressed PDF document
  const outPdfDoc = await PDFDocument.create();

  for (let i = 1; i <= pageCount; i++) {
    const progressPercent = 15 + Math.round(((i - 1) / pageCount) * 75);
    options.onProgress?.(
      progressPercent,
      `กำลังบีบอัดหน้าที่ ${i} จาก ${pageCount} หน้า...`
    );

    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: presetConfig.scale });

    // Render to off-screen canvas
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
      throw new Error(`ไม่สามารถสร้าง Graphic Context สำหรับหน้าที่ ${i} ได้`);
    }

    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render page
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (page.render({ canvasContext: ctx, viewport, canvas } as any) as any).promise;

    // Convert canvas to optimized JPEG blob
    const imgDataUrl = canvas.toDataURL('image/jpeg', presetConfig.quality);
    const base64Data = imgDataUrl.split(',')[1];
    const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    // Embed into new PDF
    const embeddedImg = await outPdfDoc.embedJpg(imageBytes);

    // Get original page dimension from base viewport (scale 1.0)
    const baseViewport = page.getViewport({ scale: 1.0 });
    const outPage = outPdfDoc.addPage([baseViewport.width, baseViewport.height]);

    outPage.drawImage(embeddedImg, {
      x: 0,
      y: 0,
      width: baseViewport.width,
      height: baseViewport.height,
    });
  }

  options.onProgress?.(92, 'กำลังประกอบและจัดโครงสร้างเอกสาร PDF ฉบับใหม่...');

  const compressedPdfBytes = await outPdfDoc.save();
  const compressedSize = compressedPdfBytes.byteLength;

  // If the compressed output happens to be larger than original (e.g. text-only PDF), use original
  if (compressedSize >= originalSize) {
    const finalBlob = new Blob([originalArrayBuffer], { type: 'application/pdf' });
    options.onProgress?.(100, 'เอกสารนี้มีขนาดเล็กและเหมาะสมอยู่แล้ว!');
    return {
      blob: finalBlob,
      originalSize,
      compressedSize: originalSize,
      pageCount,
      savedPercentage: 0,
    };
  }

  const savedPercentage = Math.round(((originalSize - compressedSize) / originalSize) * 100);
  const finalBlob = new Blob([compressedPdfBytes as unknown as BlobPart], { type: 'application/pdf' });

  options.onProgress?.(100, `บีบอัดสำเร็จ! ประหยัดพื้นที่ได้ ${savedPercentage}%`);

  return {
    blob: finalBlob,
    originalSize,
    compressedSize,
    pageCount,
    savedPercentage,
  };
}
