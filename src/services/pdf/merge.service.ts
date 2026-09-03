import { PDFDocument } from 'pdf-lib';

export interface MergePdfOptions {
  onProgress?: (progress: number, message: string) => void;
}

/**
 * Merges multiple PDF files in order into a single PDF blob.
 */
export async function mergePdfs(
  files: (File | ArrayBuffer)[],
  options: MergePdfOptions = {}
): Promise<{ blob: Blob; size: number }> {
  if (files.length < 2) {
    throw new Error('จำเป็นต้องมีเอกสาร PDF อย่างน้อย 2 ไฟล์ขึ้นไปเพื่อรวมไฟล์');
  }

  options.onProgress?.(10, 'กำลังเตรียมโครงสร้างเอกสารใหม่...');
  const mergedPdf = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    const item = files[i];
    const progressPercent = 15 + Math.floor((i / files.length) * 70);
    options.onProgress?.(progressPercent, `กำลังประมวลผลไฟล์ที่ ${i + 1} จาก ${files.length}...`);

    const arrayBuffer = item instanceof File ? await item.arrayBuffer() : item;
    const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());

    for (const page of copiedPages) {
      mergedPdf.addPage(page);
    }
  }

  options.onProgress?.(90, 'กำลังประกอบและจัดทำไฟล์ PDF ฉบับสมบูรณ์...');
  const mergedBytes = await mergedPdf.save();
  const blob = new Blob([mergedBytes as unknown as BlobPart], { type: 'application/pdf' });

  options.onProgress?.(100, 'รวมไฟล์ PDF เรียบร้อยแล้ว!');
  return { blob, size: blob.size };
}
