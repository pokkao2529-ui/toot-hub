import { PDFDocument, degrees } from 'pdf-lib';

export interface PlacedSignature {
  id: string;
  pageNumber: number; // 1-indexed
  dataUrl: string; // Base64 PNG
  relX: number; // 0 to 1 relative to page width (left)
  relY: number; // 0 to 1 relative to page height (top)
  relWidth: number; // 0 to 1 relative to page width
  relHeight: number; // 0 to 1 relative to page height
  rotation?: number; // degrees, positive = clockwise in UI
}

export interface SignPdfOptions {
  signatures: PlacedSignature[];
  onProgress?: (progress: number, message: string) => void;
}

/**
 * Converts a base64 Data URL to Uint8Array
 */
function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64Index = dataUrl.indexOf(';base64,');
  if (base64Index === -1) {
    throw new Error('Invalid Data URL format');
  }
  const base64 = dataUrl.substring(base64Index + 8);
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Signs a PDF document by placing signatures and certified stamps on specified pages.
 * 100% Client-side using pdf-lib.
 */
export async function signPdf(
  file: File | ArrayBuffer,
  options: SignPdfOptions
): Promise<{ blob: Blob; size: number; pageCount: number }> {
  if (!options.signatures || options.signatures.length === 0) {
    throw new Error('กรุณาวางลายเซ็นลงบนเอกสารอย่างน้อย 1 จุด');
  }

  const data = file instanceof File ? await file.arrayBuffer() : file;
  options.onProgress?.(15, 'กำลังเปิดเอกสาร PDF...');

  const pdfDoc = await PDFDocument.load(data, { ignoreEncryption: true });
  const totalPages = pdfDoc.getPageCount();

  options.onProgress?.(35, 'กำลังประมวลผลลายเซ็นและตราประทับ...');

  // Group signatures by pageNumber (1-indexed)
  const signaturesByPage = new Map<number, PlacedSignature[]>();
  for (const sig of options.signatures) {
    const list = signaturesByPage.get(sig.pageNumber) || [];
    list.push(sig);
    signaturesByPage.set(sig.pageNumber, list);
  }

  let processedCount = 0;
  const totalSigs = options.signatures.length;

  for (const [pageNumber, sigList] of signaturesByPage.entries()) {
    if (pageNumber < 1 || pageNumber > totalPages) continue;

    const page = pdfDoc.getPage(pageNumber - 1);
    const { width: pageWidth, height: pageHeight } = page.getSize();

    for (const sig of sigList) {
      const imageBytes = dataUrlToBytes(sig.dataUrl);

      // Embed image (try PNG first, fall back to JPG)
      let embeddedImage;
      try {
        embeddedImage = await pdfDoc.embedPng(imageBytes);
      } catch {
        embeddedImage = await pdfDoc.embedJpg(imageBytes);
      }

      // Calculate absolute positions in PDF points
      // Note: In PDF coordinate system, (0,0) is bottom-left, whereas UI is top-left
      const drawWidth = sig.relWidth * pageWidth;
      const drawHeight = sig.relHeight * pageHeight;
      const rotationDeg = sig.rotation || 0;

      if (rotationDeg === 0) {
        const drawX = sig.relX * pageWidth;
        const drawY = pageHeight - sig.relY * pageHeight - drawHeight;
        page.drawImage(embeddedImage, {
          x: Math.max(0, drawX),
          y: Math.max(0, drawY),
          width: drawWidth,
          height: drawHeight,
        });
      } else {
        // Center of the bounding box in PDF points
        const cx = (sig.relX + sig.relWidth / 2) * pageWidth;
        const cy = pageHeight - (sig.relY + sig.relHeight / 2) * pageHeight;

        // UI clockwise rotation maps to PDF counter-clockwise degrees
        const pdfRotDeg = -rotationDeg;
        const phi = (pdfRotDeg * Math.PI) / 180;

        // Pivot point in PDF coordinates so image rotates around its center
        const drawX = cx - ((drawWidth / 2) * Math.cos(phi) - (drawHeight / 2) * Math.sin(phi));
        const drawY = cy - ((drawWidth / 2) * Math.sin(phi) + (drawHeight / 2) * Math.cos(phi));

        page.drawImage(embeddedImage, {
          x: drawX,
          y: drawY,
          width: drawWidth,
          height: drawHeight,
          rotate: degrees(pdfRotDeg),
        });
      }

      processedCount++;
      const currentProgress = 35 + Math.floor((processedCount / totalSigs) * 50);
      options.onProgress?.(
        currentProgress,
        `กำลังลงลายเซ็นตำแหน่งที่ ${processedCount} จาก ${totalSigs}...`
      );
    }
  }

  options.onProgress?.(90, 'กำลังบันทึกเอกสาร PDF ที่ลงลายมือชื่อ...');
  const newPdfBytes = await pdfDoc.save();
  const blob = new Blob([newPdfBytes as unknown as BlobPart], { type: 'application/pdf' });

  options.onProgress?.(100, 'ลงลายมือชื่อในเอกสาร PDF สำเร็จ!');
  return {
    blob,
    size: blob.size,
    pageCount: totalPages,
  };
}
