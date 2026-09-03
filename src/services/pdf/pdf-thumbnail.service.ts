/**
 * Client-side PDF page thumbnail rendering service using pdfjs-dist
 */

export interface PageThumbnail {
  pageNumber: number; // 1-indexed
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Initializes pdfjs-dist worker safely in browser
 */
async function getPdfjs() {
  const pdfjs = await import('pdfjs-dist');
  if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
  }
  return pdfjs;
}

/**
 * Renders all or selected pages of a PDF to data URLs for thumbnails.
 */
export async function renderPdfThumbnails(
  file: File | ArrayBuffer,
  maxPages = 100,
  scale = 0.5
): Promise<PageThumbnail[]> {
  const pdfjs = await getPdfjs();
  const data = file instanceof File ? await file.arrayBuffer() : file;
  const loadingTask = pdfjs.getDocument({ data });
  const pdf = await loadingTask.promise;

  const totalPages = Math.min(pdf.numPages, maxPages);
  const thumbnails: PageThumbnail[] = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) continue;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Render page
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (page.render(renderContext as any) as any).promise;

    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    thumbnails.push({
      pageNumber: pageNum,
      dataUrl,
      width: viewport.width,
      height: viewport.height,
    });
  }

  return thumbnails;
}

/**
 * Gets total page count of a PDF file quickly
 */
export async function getPdfPageCount(file: File | ArrayBuffer): Promise<number> {
  const pdfjs = await getPdfjs();
  const data = file instanceof File ? await file.arrayBuffer() : file;
  const loadingTask = pdfjs.getDocument({ data });
  const pdf = await loadingTask.promise;
  return pdf.numPages;
}
