import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';

export interface SplitRange {
  from: number; // 1-indexed
  to: number;   // 1-indexed
}

export interface SplitPdfOptions {
  mode: 'ranges' | 'all';
  ranges?: SplitRange[];
  baseFilename?: string;
  onProgress?: (progress: number, message: string) => void;
}

export interface SplitResult {
  blob: Blob;
  filename: string;
  isZip: boolean;
  fileCount: number;
}

/**
 * Splits a PDF by page ranges or into individual pages.
 */
export async function splitPdf(
  file: File | ArrayBuffer,
  options: SplitPdfOptions
): Promise<SplitResult> {
  const baseName = (options.baseFilename || 'document').replace(/\.pdf$/i, '');
  const data = file instanceof File ? await file.arrayBuffer() : file;

  options.onProgress?.(15, 'กำลังโหลดเอกสารต้นฉบับ...');
  const sourcePdf = await PDFDocument.load(data, { ignoreEncryption: true });
  const totalPages = sourcePdf.getPageCount();

  if (totalPages === 0) {
    throw new Error('เอกสารไม่มีหน้าข้อมูล');
  }

  // Mode: All individual pages
  if (options.mode === 'all') {
    options.onProgress?.(30, 'กำลังแยกทุกหน้าเอกสารเป็นไฟล์เดี่ยว...');
    const zip = new JSZip();

    for (let i = 0; i < totalPages; i++) {
      const singleDoc = await PDFDocument.create();
      const [copiedPage] = await singleDoc.copyPages(sourcePdf, [i]);
      singleDoc.addPage(copiedPage);

      const bytes = await singleDoc.save();
      zip.file(`${baseName}_page_${i + 1}.pdf`, bytes);

      const progress = 30 + Math.floor((i / totalPages) * 55);
      options.onProgress?.(progress, `กำลังแยกหน้า ${i + 1} จาก ${totalPages}...`);
    }

    options.onProgress?.(90, 'กำลังสร้างไฟล์ ZIP รวมทุกหน้า...');
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    options.onProgress?.(100, 'แยกไฟล์ PDF สำเร็จ!');

    return {
      blob: zipBlob,
      filename: `${baseName}_split_pages.zip`,
      isZip: true,
      fileCount: totalPages,
    };
  }

  // Mode: Ranges
  const ranges = options.ranges || [];
  if (ranges.length === 0) {
    throw new Error('กรุณาระบุช่วงหน้าที่ต้องการแยกอย่างน้อย 1 ช่วง');
  }

  // Validate ranges
  for (const r of ranges) {
    if (r.from < 1 || r.to > totalPages || r.from > r.to) {
      throw new Error(`ช่วงหน้าไม่ถูกต้อง (${r.from}-${r.to}) เอกสารมีทั้งหมด ${totalPages} หน้า`);
    }
  }

  if (ranges.length === 1) {
    // Single range -> returns single PDF
    const r = ranges[0];
    options.onProgress?.(40, `กำลังดึงช่วงหน้า ${r.from} ถึง ${r.to}...`);
    const newDoc = await PDFDocument.create();
    const pageIndices: number[] = [];
    for (let p = r.from; p <= r.to; p++) {
      pageIndices.push(p - 1);
    }
    const copiedPages = await newDoc.copyPages(sourcePdf, pageIndices);
    for (const page of copiedPages) {
      newDoc.addPage(page);
    }

    options.onProgress?.(85, 'กำลังจัดทำไฟล์ PDF ฉบับใหม่...');
    const bytes = await newDoc.save();
    const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
    options.onProgress?.(100, 'แยกไฟล์ PDF สำเร็จ!');

    return {
      blob,
      filename: `${baseName}_pages_${r.from}-${r.to}.pdf`,
      isZip: false,
      fileCount: 1,
    };
  }

  // Multiple ranges -> returns ZIP
  const zip = new JSZip();
  for (let i = 0; i < ranges.length; i++) {
    const r = ranges[i];
    options.onProgress?.(
      30 + Math.floor((i / ranges.length) * 55),
      `กำลังแยกช่วงที่ ${i + 1} (หน้า ${r.from}-${r.to})...`
    );

    const rangeDoc = await PDFDocument.create();
    const pageIndices: number[] = [];
    for (let p = r.from; p <= r.to; p++) {
      pageIndices.push(p - 1);
    }
    const copied = await rangeDoc.copyPages(sourcePdf, pageIndices);
    for (const page of copied) {
      rangeDoc.addPage(page);
    }
    const rangeBytes = await rangeDoc.save();
    zip.file(`${baseName}_part_${i + 1}_p${r.from}-${r.to}.pdf`, rangeBytes);
  }

  options.onProgress?.(90, 'กำลังรวบรวมไฟล์แยกเป็น ZIP...');
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  options.onProgress?.(100, 'แยกไฟล์ PDF สำเร็จ!');

  return {
    blob: zipBlob,
    filename: `${baseName}_split_ranges.zip`,
    isZip: true,
    fileCount: ranges.length,
  };
}
