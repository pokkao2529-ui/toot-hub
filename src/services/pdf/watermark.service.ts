import { PDFDocument } from 'pdf-lib';

export interface WatermarkOptions {
  text: string;
  fontSize?: number;
  opacity?: number; // 0.1 to 1.0
  rotation?: number; // degrees, e.g. 45 or 0
  color?: { r: number; g: number; b: number };
  pages?: number[]; // 1-indexed, if empty apply to all
  onProgress?: (progress: number, message: string) => void;
}

/**
 * Creates a crisp transparent PNG containing rotated text.
 * Native HTML5 Canvas rendering guarantees 100% full support for Thai vowels,
 * tone marks (วรรณยุกต์), and any Unicode characters without WinAnsi encoding limitations.
 */
function createRotatedTextPng(
  text: string,
  fontSize: number,
  rotation: number,
  color: { r: number; g: number; b: number },
  opacity: number
): { bytes: Uint8Array; width: number; height: number } {
  const scale = 2; // 2x retina supersampling for ultra-crisp output
  const scaledFontSize = fontSize * scale;

  // Step 1: Measure unrotated text size
  const measureCanvas = document.createElement('canvas');
  const measureCtx = measureCanvas.getContext('2d');
  if (!measureCtx) throw new Error('Cannot initialize 2D context');

  const fontString = `bold ${scaledFontSize}px "Prompt", "Noto Sans Thai", "Thonburi", "Sarabun", "Tahoma", sans-serif`;
  measureCtx.font = fontString;
  const metrics = measureCtx.measureText(text);
  const textWidth = Math.ceil(metrics.width);
  // Allow extra vertical space for Thai upper/lower vowels and tone marks (สระอิ, สระอี, ไม้เอก, ไม้โท, สระอุ, สระอู)
  const textHeight = Math.ceil(scaledFontSize * 1.5);

  // Step 2: Calculate rotated bounding box
  const rad = (Math.abs(rotation) * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const boxWidth = Math.ceil(textWidth * cos + textHeight * sin) + 20 * scale;
  const boxHeight = Math.ceil(textWidth * sin + textHeight * cos) + 20 * scale;

  // Step 3: Draw on the properly sized canvas
  const canvas = document.createElement('canvas');
  canvas.width = boxWidth;
  canvas.height = boxHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot initialize 2D context');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.translate(canvas.width / 2, canvas.height / 2);
  // In canvas coordinate system, positive rotate is clockwise;
  // in PDF coordinate system, positive rotation is counter-clockwise.
  // We negate rotation so that 45 degrees rotates upwards from bottom-left to top-right.
  ctx.rotate((-rotation * Math.PI) / 180);

  ctx.font = fontString;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;

  ctx.fillText(text, 0, 0);

  // Step 4: Convert canvas to bytes
  const dataUrl = canvas.toDataURL('image/png');
  const base64Index = dataUrl.indexOf(';base64,');
  const base64 = dataUrl.substring(base64Index + 8);
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return {
    bytes,
    width: canvas.width / scale,
    height: canvas.height / scale,
  };
}

/**
 * Adds customizable text watermark diagonally or horizontally across PDF pages.
 * Supports Thai language and full Unicode seamlessly.
 */
export async function addWatermark(
  file: File | ArrayBuffer,
  options: WatermarkOptions
): Promise<{ blob: Blob; size: number; pageCount: number }> {
  if (!options.text.trim()) {
    throw new Error('กรุณาระบุข้อความลายน้ำที่ต้องการใส่');
  }

  const data = file instanceof File ? await file.arrayBuffer() : file;
  options.onProgress?.(15, 'กำลังโหลดเอกสาร PDF...');

  const pdfDoc = await PDFDocument.load(data, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();
  const totalPages = pages.length;

  const targetSet = options.pages && options.pages.length > 0 ? new Set(options.pages) : null;
  const fontSize = options.fontSize ?? 48;
  const opacity = options.opacity ?? 0.25;
  const rotation = options.rotation ?? 45;
  const color = options.color ?? { r: 0.8, g: 0.1, b: 0.1 };

  options.onProgress?.(30, 'กำลังสร้างลายน้ำและจัดวางในเอกสาร...');

  // Generate the high-resolution transparent PNG once
  const watermarkPng = createRotatedTextPng(options.text, fontSize, rotation, color, opacity);
  const embeddedImage = await pdfDoc.embedPng(watermarkPng.bytes);

  for (let i = 0; i < totalPages; i++) {
    const pageNum = i + 1;
    if (!targetSet || targetSet.has(pageNum)) {
      const page = pages[i];
      const { width: pageWidth, height: pageHeight } = page.getSize();

      // Perfectly center the watermark on the page
      const x = (pageWidth - watermarkPng.width) / 2;
      const y = (pageHeight - watermarkPng.height) / 2;

      page.drawImage(embeddedImage, {
        x: Math.round(x),
        y: Math.round(y),
        width: Math.round(watermarkPng.width),
        height: Math.round(watermarkPng.height),
      });
    }

    const progress = 30 + Math.floor(((i + 1) / totalPages) * 60);
    options.onProgress?.(progress, `กำลังใส่ลายน้ำหน้า ${pageNum} จาก ${totalPages}...`);
  }

  options.onProgress?.(95, 'กำลังจัดทำไฟล์ PDF ฉบับใส่ลายน้ำ...');
  const newBytes = await pdfDoc.save();
  const blob = new Blob([newBytes as unknown as BlobPart], { type: 'application/pdf' });

  options.onProgress?.(100, 'ใส่ลายน้ำลงใน PDF เรียบร้อยแล้ว!');
  return {
    blob,
    size: blob.size,
    pageCount: totalPages,
  };
}
