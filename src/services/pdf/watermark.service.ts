import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

export interface WatermarkOptions {
  text: string;
  fontSize?: number;
  opacity?: number; // 0.1 to 1.0
  rotation?: number; // degrees, e.g. 45
  color?: { r: number; g: number; b: number };
  pages?: number[]; // 1-indexed, if empty apply to all
  onProgress?: (progress: number, message: string) => void;
}

/**
 * Adds customizable text watermark diagonally or horizontally across PDF pages.
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
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();
  const totalPages = pages.length;

  const targetSet = options.pages && options.pages.length > 0 ? new Set(options.pages) : null;
  const fontSize = options.fontSize ?? 48;
  const opacity = options.opacity ?? 0.25;
  const rotation = options.rotation ?? 45;
  const color = options.color ?? { r: 0.8, g: 0.1, b: 0.1 };

  options.onProgress?.(30, 'กำลังพิมพ์ลายน้ำลงในแต่ละหน้ากระดาษ...');

  for (let i = 0; i < totalPages; i++) {
    const pageNum = i + 1;
    if (!targetSet || targetSet.has(pageNum)) {
      const page = pages[i];
      const { width, height } = page.getSize();
      const textWidth = font.widthOfTextAtSize(options.text, fontSize);
      const textHeight = font.heightAtSize(fontSize);

      // Center text calculation
      const x = (width - textWidth) / 2;
      const y = (height - textHeight) / 2;

      page.drawText(options.text, {
        x: width / 2 - (textWidth / 2) * Math.cos((rotation * Math.PI) / 180),
        y: height / 2 - (textWidth / 2) * Math.sin((rotation * Math.PI) / 180),
        size: fontSize,
        font: font,
        color: rgb(color.r, color.g, color.b),
        opacity: opacity,
        rotate: degrees(rotation),
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
