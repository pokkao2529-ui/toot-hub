/**
 * QR Code Generation Service
 * Powered by client-side HTML5 Canvas and `qrcode` library
 */

import QRCode from 'qrcode';

export interface QRCodeRenderOptions {
  text: string;
  width?: number;
  margin?: number;
  colorDark?: string;
  colorLight?: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  logoDataUrl?: string | null;
  logoSizePercent?: number; // e.g. 22% of QR width
}

/**
 * Render QR Code onto a canvas, embedding logo if provided
 */
export async function renderQRCodeToCanvas(
  canvas: HTMLCanvasElement,
  options: QRCodeRenderOptions
): Promise<void> {
  const {
    text,
    width = 512,
    margin = 2,
    colorDark = '#000000',
    colorLight = '#ffffff',
    errorCorrectionLevel = options.logoDataUrl ? 'H' : 'M',
    logoDataUrl,
    logoSizePercent = 22,
  } = options;

  if (!text) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      canvas.width = width;
      canvas.height = width;
      ctx.fillStyle = colorLight;
      ctx.fillRect(0, 0, width, width);
    }
    return;
  }

  // 1. Draw base QR Code onto canvas
  await QRCode.toCanvas(canvas, text, {
    width,
    margin,
    color: {
      dark: colorDark,
      light: colorLight,
    },
    errorCorrectionLevel: logoDataUrl ? 'H' : errorCorrectionLevel,
  });

  // 2. Draw logo overlay if provided
  if (logoDataUrl) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    await new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const qrSize = canvas.width;
        const logoSize = (qrSize * logoSizePercent) / 100;
        const x = (qrSize - logoSize) / 2;
        const y = (qrSize - logoSize) / 2;
        const padding = logoSize * 0.12;

        // Draw protective background shield (rounded rect)
        ctx.save();
        ctx.fillStyle = colorLight;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;

        const shieldX = x - padding;
        const shieldY = y - padding;
        const shieldSize = logoSize + padding * 2;
        const radius = shieldSize * 0.22;

        ctx.beginPath();
        ctx.roundRect(shieldX, shieldY, shieldSize, shieldSize, radius);
        ctx.fill();

        ctx.restore();

        // Draw border around shield
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(shieldX, shieldY, shieldSize, shieldSize, radius);
        ctx.stroke();

        // Draw the logo inside
        ctx.drawImage(img, x, y, logoSize, logoSize);
        resolve();
      };
      img.onerror = () => {
        // If logo fails to load, gracefully resolve without logo
        resolve();
      };
      img.src = logoDataUrl;
    });
  }
}

/**
 * Generate SVG string of the QR Code
 */
export async function generateQRCodeSVG(
  text: string,
  options?: {
    colorDark?: string;
    colorLight?: string;
    margin?: number;
  }
): Promise<string> {
  return QRCode.toString(text, {
    type: 'svg',
    margin: options?.margin ?? 2,
    color: {
      dark: options?.colorDark ?? '#000000',
      light: options?.colorLight ?? '#ffffff',
    },
    errorCorrectionLevel: 'H',
  });
}

/**
 * Trigger file download in browser
 */
export function downloadDataUrl(dataUrl: string, filename: string): void {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
