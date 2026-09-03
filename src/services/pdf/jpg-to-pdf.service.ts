import { PDFDocument, PageSizes } from 'pdf-lib';

export interface ImageToPdfItem {
  file: File;
}

export interface JpgToPdfOptions {
  pageSize?: 'A4' | 'fit-image';
  orientation?: 'portrait' | 'landscape';
  margin?: number; // points
  onProgress?: (progress: number, message: string) => void;
}

/**
 * Converts multiple image files (JPG, PNG) into a combined PDF document.
 */
export async function convertJpgToPdf(
  images: File[],
  options: JpgToPdfOptions = {}
): Promise<{ blob: Blob; size: number; pageCount: number }> {
  if (images.length === 0) {
    throw new Error('กรุณาเลือกรูปภาพอย่างน้อย 1 รูป');
  }

  options.onProgress?.(10, 'กำลังเตรียมเอกสาร PDF ใหม่...');
  const pdfDoc = await PDFDocument.create();
  const margin = options.margin ?? 20;

  for (let i = 0; i < images.length; i++) {
    const file = images[i];
    const progress = 15 + Math.floor((i / images.length) * 75);
    options.onProgress?.(progress, `กำลังประมวลผลรูปที่ ${i + 1} จาก ${images.length}...`);

    const arrayBuffer = await file.arrayBuffer();
    const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');

    // Embed image safely
    let embeddedImage;
    try {
      if (isPng) {
        embeddedImage = await pdfDoc.embedPng(arrayBuffer);
      } else {
        embeddedImage = await pdfDoc.embedJpg(arrayBuffer);
      }
    } catch {
      // Fallback: try embedJpg if embedPng failed or vice-versa
      try {
        embeddedImage = await pdfDoc.embedJpg(arrayBuffer);
      } catch {
        embeddedImage = await pdfDoc.embedPng(arrayBuffer);
      }
    }

    const imgDims = embeddedImage.scale(1);

    if (options.pageSize === 'fit-image') {
      const page = pdfDoc.addPage([imgDims.width + margin * 2, imgDims.height + margin * 2]);
      page.drawImage(embeddedImage, {
        x: margin,
        y: margin,
        width: imgDims.width,
        height: imgDims.height,
      });
    } else {
      // A4 default
      const baseA4 = PageSizes.A4; // [595.28, 841.89]
      const isLandscape = options.orientation === 'landscape';
      const pageWidth = isLandscape ? baseA4[1] : baseA4[0];
      const pageHeight = isLandscape ? baseA4[0] : baseA4[1];

      const availableWidth = pageWidth - margin * 2;
      const availableHeight = pageHeight - margin * 2;

      // Fit aspect ratio
      const scale = Math.min(availableWidth / imgDims.width, availableHeight / imgDims.height);
      const drawWidth = imgDims.width * scale;
      const drawHeight = imgDims.height * scale;

      const posX = margin + (availableWidth - drawWidth) / 2;
      const posY = margin + (availableHeight - drawHeight) / 2;

      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      page.drawImage(embeddedImage, {
        x: posX,
        y: posY,
        width: drawWidth,
        height: drawHeight,
      });
    }
  }

  options.onProgress?.(92, 'กำลังจัดทำไฟล์ PDF ฉบับสมบูรณ์...');
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });

  options.onProgress?.(100, 'แปลงรูปภาพเป็น PDF สำเร็จ!');
  return {
    blob,
    size: blob.size,
    pageCount: images.length,
  };
}
