import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export type PageNumberPosition =
  | 'bottom-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-right'
  | 'top-center';

export type PageNumberFormat = 'number' | 'page-n' | 'n-of-total';

export interface PageNumbersOptions {
  position?: PageNumberPosition;
  format?: PageNumberFormat;
  fontSize?: number;
  startFromPage?: number; // 1-indexed, e.g. page 2 (skip cover)
  firstPageNumber?: number; // start count from e.g. 1
  onProgress?: (progress: number, message: string) => void;
}

/**
 * Inserts formatted page numbers into PDF header or footer.
 */
export async function addPageNumbers(
  file: File | ArrayBuffer,
  options: PageNumbersOptions = {}
): Promise<{ blob: Blob; size: number; pageCount: number }> {
  const data = file instanceof File ? await file.arrayBuffer() : file;
  options.onProgress?.(15, 'กำลังโหลดเอกสาร PDF...');

  const pdfDoc = await PDFDocument.load(data, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();
  const totalPages = pages.length;

  const position = options.position ?? 'bottom-center';
  const format = options.format ?? 'number';
  const fontSize = options.fontSize ?? 11;
  const startFromPage = options.startFromPage ?? 1;
  const firstPageNumber = options.firstPageNumber ?? 1;
  const margin = 28; // points from edge

  options.onProgress?.(35, 'กำลังคำนวณตำแหน่งและรันหมายเลขหน้า...');

  for (let i = 0; i < totalPages; i++) {
    const pageIndex = i + 1;

    // Skip pages before startFromPage (e.g. cover page)
    if (pageIndex < startFromPage) {
      continue;
    }

    const page = pages[i];
    const { width, height } = page.getSize();
    const currentNumber = firstPageNumber + (pageIndex - startFromPage);

    let text = `${currentNumber}`;
    if (format === 'page-n') {
      text = `Page ${currentNumber}`;
    } else if (format === 'n-of-total') {
      text = `${currentNumber} / ${totalPages}`;
    }

    const textWidth = font.widthOfTextAtSize(text, fontSize);

    let x = (width - textWidth) / 2;
    let y = margin;

    switch (position) {
      case 'bottom-center':
        x = (width - textWidth) / 2;
        y = margin;
        break;
      case 'bottom-right':
        x = width - textWidth - margin;
        y = margin;
        break;
      case 'bottom-left':
        x = margin;
        y = margin;
        break;
      case 'top-right':
        x = width - textWidth - margin;
        y = height - margin;
        break;
      case 'top-center':
        x = (width - textWidth) / 2;
        y = height - margin;
        break;
    }

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });

    const progress = 35 + Math.floor(((i + 1) / totalPages) * 55);
    options.onProgress?.(progress, `กำลังใส่เลขหน้าที่ ${pageIndex} จาก ${totalPages}...`);
  }

  options.onProgress?.(95, 'กำลังบันทึกเอกสาร...');
  const newBytes = await pdfDoc.save();
  const blob = new Blob([newBytes as unknown as BlobPart], { type: 'application/pdf' });

  options.onProgress?.(100, 'ใส่เลขหน้า PDF เรียบร้อยแล้ว!');
  return {
    blob,
    size: blob.size,
    pageCount: totalPages,
  };
}
