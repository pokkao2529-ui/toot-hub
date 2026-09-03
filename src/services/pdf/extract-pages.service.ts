import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';

export interface ExtractPagesOptions {
  pagesToExtract: number[]; // 1-indexed
  mode?: 'single-pdf' | 'separate-files';
  baseFilename?: string;
  onProgress?: (progress: number, message: string) => void;
}

export interface ExtractResult {
  blob: Blob;
  filename: string;
  isZip: boolean;
  pageCount: number;
}

/**
 * Extracts chosen pages from a PDF into a single combined PDF or separate PDFs in a ZIP archive.
 */
export async function extractPages(
  file: File | ArrayBuffer,
  options: ExtractPagesOptions
): Promise<ExtractResult> {
  const baseName = (options.baseFilename || 'document').replace(/\.pdf$/i, '');
  const pages = Array.from(new Set(options.pagesToExtract)).sort((a, b) => a - b);

  if (pages.length === 0) {
    throw new Error('กรุณาเลือกหน้าที่ต้องการดึงอย่างน้อย 1 หน้า');
  }

  const data = file instanceof File ? await file.arrayBuffer() : file;
  options.onProgress?.(15, 'กำลังโหลดเอกสารต้นฉบับ...');

  const sourcePdf = await PDFDocument.load(data, { ignoreEncryption: true });
  const totalPages = sourcePdf.getPageCount();

  for (const p of pages) {
    if (p < 1 || p > totalPages) {
      throw new Error(`หน้า ${p} ไม่อยู่ในเอกสาร (เอกสารมี ${totalPages} หน้า)`);
    }
  }

  // Mode: Extract into single PDF
  if (!options.mode || options.mode === 'single-pdf') {
    options.onProgress?.(45, `กำลังดึง ${pages.length} หน้าที่เลือกรวมเป็นเอกสารใหม่...`);
    const newDoc = await PDFDocument.create();
    const pageIndices = pages.map((p) => p - 1);
    const copiedPages = await newDoc.copyPages(sourcePdf, pageIndices);

    for (const page of copiedPages) {
      newDoc.addPage(page);
    }

    options.onProgress?.(85, 'กำลังบันทึกเอกสารใหม่...');
    const bytes = await newDoc.save();
    const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
    options.onProgress?.(100, 'ดึงหน้าเอกสารสำเร็จ!');

    return {
      blob,
      filename: `${baseName}_extracted.pdf`,
      isZip: false,
      pageCount: pages.length,
    };
  }

  // Mode: Separate files in ZIP
  options.onProgress?.(30, 'กำลังแยกหน้าที่เลือกออกเป็นไฟล์เดี่ยว...');
  const zip = new JSZip();

  for (let i = 0; i < pages.length; i++) {
    const pageNum = pages[i];
    const singleDoc = await PDFDocument.create();
    const [copied] = await singleDoc.copyPages(sourcePdf, [pageNum - 1]);
    singleDoc.addPage(copied);

    const bytes = await singleDoc.save();
    zip.file(`${baseName}_page_${pageNum}.pdf`, bytes);

    const progress = 30 + Math.floor((i / pages.length) * 55);
    options.onProgress?.(progress, `กำลังดึงหน้า ${pageNum} (${i + 1}/${pages.length})...`);
  }

  options.onProgress?.(90, 'กำลังรวบรวมไฟล์แยกเป็น ZIP...');
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  options.onProgress?.(100, 'ดึงหน้าเอกสารสำเร็จ!');

  return {
    blob: zipBlob,
    filename: `${baseName}_extracted_pages.zip`,
    isZip: true,
    pageCount: pages.length,
  };
}
