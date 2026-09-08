/**
 * Image Compression Service
 * 100% Client-side image compression and format conversion using HTML5 Canvas & Web APIs
 */

import JSZip from 'jszip';

export interface CompressOptions {
  quality: number; // 0.1 to 1.0 (e.g. 0.8 = 80%)
  maxWidth?: number; // Optional max width in pixels (e.g. 1920)
  maxHeight?: number; // Optional max height in pixels
  outputFormat?: 'original' | 'image/jpeg' | 'image/webp' | 'image/png';
}

export interface CompressedResult {
  id: string;
  originalFile: File;
  originalSize: number;
  compressedBlob: Blob;
  compressedSize: number;
  previewUrl: string;
  reductionPercentage: number;
  width: number;
  height: number;
  outputName: string;
  mimeType: string;
}

/**
 * Format bytes to readable string (e.g. 1.4 MB, 450 KB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Loads an image from a File into an HTMLImageElement
 */
function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(new Error(`ไม่สามารถเปิดไฟล์ภาพได้: ${file.name}`));
    };
    img.src = url;
  });
}

/**
 * Calculate scaled dimensions respecting aspect ratio
 */
function calculateDimensions(
  srcWidth: number,
  srcHeight: number,
  maxWidth?: number,
  maxHeight?: number
): { width: number; height: number } {
  let width = srcWidth;
  let height = srcHeight;

  if (maxWidth && width > maxWidth) {
    height = Math.round((height * maxWidth) / width);
    width = maxWidth;
  }

  if (maxHeight && height > maxHeight) {
    width = Math.round((width * maxHeight) / height);
    height = maxHeight;
  }

  return { width, height };
}

/**
 * Compress a single image file
 */
export async function compressSingleImage(
  file: File,
  options: CompressOptions
): Promise<CompressedResult> {
  const img = await loadImageFromFile(file);

  const { width, height } = calculateDimensions(
    img.naturalWidth || img.width,
    img.naturalHeight || img.height,
    options.maxWidth,
    options.maxHeight
  );

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('ไม่สามารถเข้าถึงระบบประมวลผล Canvas 2D ได้');
  }

  // Determine output MIME type
  let targetMime = file.type;
  if (options.outputFormat && options.outputFormat !== 'original') {
    targetMime = options.outputFormat;
  } else if (!targetMime || targetMime === 'image/png') {
    // If original is PNG, check if transparency is used
    targetMime = file.type || 'image/jpeg';
  }

  // If converting to JPEG, draw white background first (avoid black transparent areas)
  if (targetMime === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }

  // Draw scaled image
  ctx.drawImage(img, 0, 0, width, height);

  // Compress to Blob
  const compressedBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error(`เกิดข้อผิดพลาดในการบีบอัดภาพ: ${file.name}`));
        }
      },
      targetMime,
      options.quality
    );
  });

  const previewUrl = URL.createObjectURL(compressedBlob);
  const originalSize = file.size;
  const compressedSize = compressedBlob.size;
  const reductionPercentage = Math.max(
    0,
    Math.round(((originalSize - compressedSize) / originalSize) * 100)
  );

  // Determine output filename with appropriate extension
  const originalBaseName = file.name.replace(/\.[^/.]+$/, '');
  let extension = '.jpg';
  if (targetMime === 'image/webp') extension = '.webp';
  else if (targetMime === 'image/png') extension = '.png';
  else if (targetMime === 'image/jpeg') extension = '.jpg';

  const outputName = `${originalBaseName}-min${extension}`;

  return {
    id: `${file.name}-${Date.now()}-${Math.random()}`,
    originalFile: file,
    originalSize,
    compressedBlob,
    compressedSize,
    previewUrl,
    reductionPercentage,
    width,
    height,
    outputName,
    mimeType: targetMime,
  };
}

/**
 * Compress multiple image files with progress callback
 */
export async function compressMultipleImages(
  files: File[],
  options: CompressOptions,
  onProgress?: (completed: number, total: number) => void
): Promise<CompressedResult[]> {
  const results: CompressedResult[] = [];
  const total = files.length;

  for (let i = 0; i < total; i++) {
    const file = files[i];
    try {
      const res = await compressSingleImage(file, options);
      results.push(res);
    } catch (err) {
      console.error(`Error compressing file ${file.name}:`, err);
    }
    if (onProgress) {
      onProgress(i + 1, total);
    }
  }

  return results;
}

/**
 * Package multiple compressed images into a single ZIP file
 */
export async function createCompressedImagesZip(
  results: CompressedResult[]
): Promise<Blob> {
  const zip = new JSZip();

  results.forEach((item) => {
    zip.file(item.outputName, item.compressedBlob);
  });

  return zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}
