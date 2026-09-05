import { PDFDocument } from 'pdf-lib';

export interface UnlockPdfOptions {
  password?: string;
  onProgress?: (progress: number, message: string) => void;
}

/**
 * Removes password and permission restrictions from a PDF file.
 */
export async function unlockPdf(
  file: File | ArrayBuffer,
  options: UnlockPdfOptions = {}
): Promise<{ blob: Blob; size: number; pageCount: number }> {
  const data = file instanceof File ? await file.arrayBuffer() : file;
  options.onProgress?.(25, 'กำลังตรวจสอบโครงสร้างการเข้ารหัส...');

  try {
    options.onProgress?.(50, 'กำลังปลดล็อกรหัสผ่านและข้อจำกัดการพิมพ์/แก้ไข...');
    const pdfDoc = await PDFDocument.load(data, {
      ignoreEncryption: true,
    });

    const pageCount = pdfDoc.getPageCount();
    options.onProgress?.(80, 'กำลังจัดทำไฟล์ PDF ฉบับปลดล็อกสมบูรณ์...');

    const cleanBytes = await pdfDoc.save();
    const blob = new Blob([cleanBytes as unknown as BlobPart], { type: 'application/pdf' });

    options.onProgress?.(100, 'ปลดล็อกรหัสผ่านสำเร็จ!');
    return {
      blob,
      size: blob.size,
      pageCount,
    };
  } catch (err: unknown) {
    throw new Error('ไม่สามารถปลดล็อกไฟล์นี้ได้ หรือไฟล์อาจมีความเสียหาย');
  }
}
