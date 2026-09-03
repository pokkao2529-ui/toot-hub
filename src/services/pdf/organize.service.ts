import { PDFDocument, degrees } from 'pdf-lib';

export interface PageOrganizeItem {
  originalPageNumber: number; // 1-indexed
  rotation?: number; // 0, 90, 180, 270
}

export interface OrganizePdfOptions {
  pages: PageOrganizeItem[];
  onProgress?: (progress: number, message: string) => void;
}

/**
 * Reorders, rotates, and selectively removes pages to create a newly organized PDF.
 */
export async function organizePdf(
  file: File | ArrayBuffer,
  options: OrganizePdfOptions
): Promise<{ blob: Blob; size: number; totalPages: number }> {
  if (!options.pages || options.pages.length === 0) {
    throw new Error('เอกสารต้องมีอย่างน้อย 1 หน้าในลำดับที่จัดใหม่');
  }

  const data = file instanceof File ? await file.arrayBuffer() : file;
  options.onProgress?.(20, 'กำลังโหลดเอกสารต้นฉบับ...');

  const sourcePdf = await PDFDocument.load(data, { ignoreEncryption: true });
  const totalOriginalPages = sourcePdf.getPageCount();

  options.onProgress?.(45, 'กำลังจัดเรียงลำดับหน้าและปรับแนวการหมุน...');
  const newPdf = await PDFDocument.create();

  for (let i = 0; i < options.pages.length; i++) {
    const item = options.pages[i];
    if (item.originalPageNumber < 1 || item.originalPageNumber > totalOriginalPages) {
      continue;
    }

    const [copiedPage] = await newPdf.copyPages(sourcePdf, [item.originalPageNumber - 1]);
    if (item.rotation) {
      const currentRot = copiedPage.getRotation().angle;
      copiedPage.setRotation(degrees((currentRot + item.rotation) % 360));
    }
    newPdf.addPage(copiedPage);

    const progress = 45 + Math.floor((i / options.pages.length) * 45);
    options.onProgress?.(progress, `กำลังจัดระเบียบหน้าที่ ${i + 1}...`);
  }

  options.onProgress?.(92, 'กำลังบันทึกโครงสร้างเอกสารใหม่...');
  const newBytes = await newPdf.save();
  const blob = new Blob([newBytes as unknown as BlobPart], { type: 'application/pdf' });

  options.onProgress?.(100, 'จัดระเบียบหน้า PDF สำเร็จ!');
  return {
    blob,
    size: blob.size,
    totalPages: options.pages.length,
  };
}
