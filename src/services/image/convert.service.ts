/**
 * Image Conversion Service
 * Converts images between formats (JPG, PNG, WebP) 100% client-side
 */

import JSZip from 'jszip';
import { formatBytes } from './compress.service';

export type TargetImageFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export interface ConvertOptions {
  targetFormat: TargetImageFormat;
  quality?: number; // 0.1 to 1.0 (defaults to 0.92 for high fidelity)
}

export interface ConvertedImageResult {
  id: string;
  originalFile: File;
  originalFormat: string;
  originalSize: number;
  convertedBlob: Blob;
  convertedSize: number;
  targetFormat: TargetImageFormat;
  previewUrl: string;
  outputName: string;
  width: number;
  height: number;
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`ไม่สามารถเปิดอ่านไฟล์ภาพได้: ${file.name}`));
    };
    img.src = url;
  });
}

export async function convertSingleImage(
  file: File,
  options: ConvertOptions
): Promise<ConvertedImageResult> {
  const img = await loadImageFromFile(file);
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('ไม่สามารถเข้าถึงระบบ Canvas 2D ได้');
  }

  // If converting to JPEG, fill with white background so transparent PNGs don't turn black
  if (options.targetFormat === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }

  ctx.drawImage(img, 0, 0, width, height);

  const convertedBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error(`เกิดข้อผิดพลาดในการแปลงไฟล์: ${file.name}`));
      },
      options.targetFormat,
      options.quality ?? 0.92
    );
  });

  const previewUrl = URL.createObjectURL(convertedBlob);
  const originalBaseName = file.name.replace(/\.[^/.]+$/, '');

  let extension = '.jpg';
  if (options.targetFormat === 'image/png') extension = '.png';
  else if (options.targetFormat === 'image/webp') extension = '.webp';

  const outputName = `${originalBaseName}${extension}`;

  return {
    id: `${file.name}-${Date.now()}-${Math.random()}`,
    originalFile: file,
    originalFormat: file.type || 'image/jpeg',
    originalSize: file.size,
    convertedBlob,
    convertedSize: convertedBlob.size,
    targetFormat: options.targetFormat,
    previewUrl,
    outputName,
    width,
    height,
  };
}

export async function convertMultipleImages(
  files: File[],
  options: ConvertOptions,
  onProgress?: (completed: number, total: number) => void
): Promise<ConvertedImageResult[]> {
  const results: ConvertedImageResult[] = [];
  const total = files.length;

  for (let i = 0; i < total; i++) {
    const file = files[i];
    try {
      const res = await convertSingleImage(file, options);
      results.push(res);
    } catch (err) {
      console.error(`Error converting ${file.name}:`, err);
    }
    if (onProgress) {
      onProgress(i + 1, total);
    }
  }

  return results;
}

export async function createConvertedImagesZip(
  results: ConvertedImageResult[]
): Promise<Blob> {
  const zip = new JSZip();

  results.forEach((item) => {
    zip.file(item.outputName, item.convertedBlob);
  });

  return zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}
