import { PDFDocument } from 'pdf-lib';

export interface RemovePagesOptions {
  pagesToRemove: number[]; // 1-indexed (e.g. [2, 4])
  onProgress?: (progress: number, message: string) => void;
}

/**
 * Removes specified page numbers from a PDF document.
 */
export async function removePages(
  file: File | ArrayBuffer,
  options: RemovePagesOptions
): Promise<{ blob: Blob; size: number; remainingPages: number }> {
  const data = file instanceof File ? await file.arrayBuffer() : file;
  options.onProgress?.(20, 'กำลังโหลดเอกสาร...');

  const sourcePdf = await PDFDocument.load(data, { ignoreEncryption: true });
  const totalPages = sourcePdf.getPageCount();

  const removeSet = new Set(options.pagesToRemove);
  const remainingIndices: number[] = [];

  for (let p = 1; p <= totalPages; p++) {
    if (!removeSet.has(p)) {
      remainingIndices.push(p - 1);
    }
  }

  if (remainingIndices.length === 0) {
    throw new Error('ไม่สามารถลบทุกหน้าออกจากเอกสารได้ ต้องคงเหลืออย่างน้อย 1 หน้า');
  }

  if (remainingIndices.length === totalPages) {
    throw new Error('กรุณาเลือกหน้าที่ต้องการลบอย่างน้อย 1 หน้า');
  }

  options.onProgress?.(50, `กำลังลบ ${options.pagesToRemove.length} หน้า และจัดเรียงเอกสารใหม่...`);
  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(sourcePdf, remainingIndices);

  for (const page of copiedPages) {
    newPdf.addPage(page);
  }

  options.onProgress?.(85, 'กำลังบันทึกเอกสารฉบับแก้ไข...');
  const newBytes = await newPdf.save();
  const blob = new Blob([newBytes as unknown as BlobPart], { type: 'application/pdf' });

  options.onProgress?.(100, 'ลบหน้าที่เลือกเรียบร้อยแล้ว!');
  return {
    blob,
    size: blob.size,
    remainingPages: remainingIndices.length,
  };
}
