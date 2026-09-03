import { PDFDocument, degrees } from 'pdf-lib';

export interface RotatePdfOptions {
  angle: 90 | 180 | 270;
  pagesToRotate?: number[]; // 1-indexed, if empty rotate all
  onProgress?: (progress: number, message: string) => void;
}

/**
 * Rotates all or selected pages of a PDF document by 90, 180, or 270 degrees.
 */
export async function rotatePdf(
  file: File | ArrayBuffer,
  options: RotatePdfOptions
): Promise<{ blob: Blob; size: number; pageCount: number }> {
  const data = file instanceof File ? await file.arrayBuffer() : file;
  options.onProgress?.(20, 'กำลังโหลดเอกสาร...');

  const pdfDoc = await PDFDocument.load(data, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();
  const targetSet = options.pagesToRotate && options.pagesToRotate.length > 0
    ? new Set(options.pagesToRotate)
    : null;

  options.onProgress?.(50, `กำลังหมุนหน้ากระดาษ ${options.angle} องศา...`);

  for (let i = 0; i < pages.length; i++) {
    const pageNumber = i + 1;
    if (!targetSet || targetSet.has(pageNumber)) {
      const page = pages[i];
      const currentAngle = page.getRotation().angle;
      page.setRotation(degrees((currentAngle + options.angle) % 360));
    }
  }

  options.onProgress?.(85, 'กำลังบันทึกเอกสาร...');
  const newBytes = await pdfDoc.save();
  const blob = new Blob([newBytes as unknown as BlobPart], { type: 'application/pdf' });

  options.onProgress?.(100, 'หมุนหน้าเอกสารสำเร็จ!');
  return {
    blob,
    size: blob.size,
    pageCount: pages.length,
  };
}
