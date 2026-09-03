import JSZip from 'jszip';

export interface PdfToJpgOptions {
  scale?: number; // default 1.5 for crisp quality
  quality?: number; // 0.8 to 1.0
  pagesToConvert?: number[]; // 1-indexed, if empty convert all
  baseFilename?: string;
  onProgress?: (progress: number, message: string) => void;
}

export interface PdfToJpgResult {
  blob: Blob;
  filename: string;
  isZip: boolean;
  pageCount: number;
}

async function getPdfjs() {
  const pdfjs = await import('pdfjs-dist');
  if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
  }
  return pdfjs;
}

/**
 * Converts PDF pages into JPG image files using pdfjs-dist.
 */
export async function convertPdfToJpg(
  file: File | ArrayBuffer,
  options: PdfToJpgOptions = {}
): Promise<PdfToJpgResult> {
  const baseName = (options.baseFilename || 'document').replace(/\.pdf$/i, '');
  const scale = options.scale ?? 1.5;
  const quality = options.quality ?? 0.85;

  options.onProgress?.(10, 'กำลังโหลดเอกสาร PDF...');
  const pdfjs = await getPdfjs();
  const data = file instanceof File ? await file.arrayBuffer() : file;
  const loadingTask = pdfjs.getDocument({ data });
  const pdf = await loadingTask.promise;

  const totalPages = pdf.numPages;
  const targetPages = options.pagesToConvert && options.pagesToConvert.length > 0
    ? options.pagesToConvert
    : Array.from({ length: totalPages }, (_, i) => i + 1);

  if (targetPages.length === 1) {
    const pageNum = targetPages[0];
    options.onProgress?.(50, `กำลังเรนเดอร์หน้า ${pageNum} เป็นภาพ JPG...`);

    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('ไม่สามารถสร้าง Graphic Context สำหรับแปลงภาพได้');

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (page.render({ canvasContext: ctx, viewport } as any) as any).promise;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error('การแปลงภาพล้มเหลว'));
        },
        'image/jpeg',
        quality
      );
    });

    options.onProgress?.(100, 'แปลง PDF เป็นภาพ JPG สำเร็จ!');
    return {
      blob,
      filename: `${baseName}_page_${pageNum}.jpg`,
      isZip: false,
      pageCount: 1,
    };
  }

  // Multiple pages -> ZIP
  const zip = new JSZip();
  for (let i = 0; i < targetPages.length; i++) {
    const pageNum = targetPages[i];
    const progress = 20 + Math.floor((i / targetPages.length) * 65);
    options.onProgress?.(progress, `กำลังเรนเดอร์หน้า ${pageNum} (${i + 1}/${targetPages.length})...`);

    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (page.render({ canvasContext: ctx, viewport } as any) as any).promise;

    const imageBlob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b || new Blob()), 'image/jpeg', quality);
    });

    const arrayBuffer = await imageBlob.arrayBuffer();
    zip.file(`${baseName}_page_${pageNum}.jpg`, arrayBuffer);
  }

  options.onProgress?.(90, 'กำลังรวบรวมรูปภาพทั้งหมดลงใน ZIP...');
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  options.onProgress?.(100, 'แปลง PDF เป็นรูปภาพ JPG สำเร็จ!');

  return {
    blob: zipBlob,
    filename: `${baseName}_jpg_images.zip`,
    isZip: true,
    pageCount: targetPages.length,
  };
}
