/**
 * Image Resize Service
 * 100% Client-side image resizing, cropping, and dimension adjustment
 * Includes Thai document presets (1 นิ้ว, 1.5 นิ้ว, 2 นิ้ว) and Social Media presets
 */

import JSZip from 'jszip';
import { formatBytes } from './compress.service';

export type ResizeMode = 'preset' | 'pixel' | 'percent';
export type ResizeFit = 'cover' | 'contain' | 'fill';
export type OutputFormatOption = 'original' | 'image/jpeg' | 'image/png' | 'image/webp';

export interface ImagePreset {
  id: string;
  name: string;
  category: 'id-photo' | 'social' | 'print';
  width: number;
  height: number;
  description: string;
  recommendedFit: ResizeFit;
}

export const RESIZE_PRESETS: ImagePreset[] = [
  // รูปติดบัตรและเอกสารทางการ (Thai Standard 300 DPI)
  {
    id: 'id-1-inch',
    name: 'รูปติดบัตร 1 นิ้ว (2.5 × 3.5 ซม.)',
    category: 'id-photo',
    width: 295,
    height: 413,
    description: 'เหมาะสำหรับใบสมัครงาน, บัตรนักเรียน/นักศึกษา, สมัครสอบ',
    recommendedFit: 'cover',
  },
  {
    id: 'id-1-5-inch',
    name: 'รูปติดบัตร 1.5 นิ้ว (3.0 × 4.0 ซม.)',
    category: 'id-photo',
    width: 354,
    height: 472,
    description: 'ข้าราชการ, ก.พ., วีซ่า, สมัครงานทั่วไป (ยอดนิยมสูงสุด)',
    recommendedFit: 'cover',
  },
  {
    id: 'id-2-inch',
    name: 'รูปติดบัตร 2 นิ้ว (4.0 × 5.0 ซม.)',
    category: 'id-photo',
    width: 472,
    height: 591,
    description: 'หนังสือเดินทาง (Passport), ยื่นขอวีซ่า, ใบประกอบวิชาชีพ',
    recommendedFit: 'cover',
  },
  {
    id: 'id-2-5-inch',
    name: 'รูปติดบัตร 2.5 นิ้ว (5.0 × 6.0 ซม.)',
    category: 'id-photo',
    width: 591,
    height: 709,
    description: 'เอกสารสถานทูตบางประเทศ, ประกาศนียบัตรระดับสูง',
    recommendedFit: 'cover',
  },
  {
    id: 'us-visa',
    name: 'รูปขอวีซ่าอเมริกา / แคนาดา (2 × 2 นิ้ว)',
    category: 'id-photo',
    width: 600,
    height: 600,
    description: 'มาตรฐาน DS-160 พื้นหลังขาว สัดส่วน 1:1 เป๊ะ',
    recommendedFit: 'cover',
  },

  // โซเชียลมีเดีย & ร้านค้าออนไลน์
  {
    id: 'shopee-800',
    name: 'Shopee / Lazada รูปสินค้า (800 × 800)',
    category: 'social',
    width: 800,
    height: 800,
    description: 'ขนาดมาตรฐานแสดงผลเร็ว รองรับระบบตรวจจับสินค้า',
    recommendedFit: 'cover',
  },
  {
    id: 'shopee-1000',
    name: 'Shopee / Lazada คมชัดสูง HD (1000 × 1000)',
    category: 'social',
    width: 1000,
    height: 1000,
    description: 'ความละเอียดสูง ลูกค้าซูมดูรายละเอียดสินค้าได้ชัดเจน',
    recommendedFit: 'cover',
  },
  {
    id: 'fb-landscape',
    name: 'Facebook Post แนวนอน (1200 × 630)',
    category: 'social',
    width: 1200,
    height: 630,
    description: 'ขนาดสัดส่วน 1.91:1 แสดงผลเต็มตาบนฟีดข่าว',
    recommendedFit: 'cover',
  },
  {
    id: 'fb-square',
    name: 'Facebook & IG Post จัตุรัส (1080 × 1080)',
    category: 'social',
    width: 1080,
    height: 1080,
    description: 'โพสต์รูปสี่เหลี่ยมจัตุรัส 1:1 ยอดนิยมใน Facebook และ Instagram',
    recommendedFit: 'cover',
  },
  {
    id: 'story-tiktok',
    name: 'IG Story / Reels / TikTok (1080 × 1920)',
    category: 'social',
    width: 1080,
    height: 1920,
    description: 'สัดส่วนแนวตั้ง 9:16 พอดีกับหน้าจอมือถือทุกรุ่น',
    recommendedFit: 'cover',
  },
  {
    id: 'yt-thumb',
    name: 'YouTube Thumbnail (1280 × 720)',
    category: 'social',
    width: 1280,
    height: 720,
    description: 'หน้าปกคลิป YouTube คมชัดระดับ HD สัดส่วน 16:9',
    recommendedFit: 'cover',
  },

  // งานพิมพ์และรูปถ่าย
  {
    id: 'photo-4x6',
    name: 'อัดรูป 4 × 6 นิ้ว / โปสการ์ด (300 DPI)',
    category: 'print',
    width: 1200,
    height: 1800,
    description: 'ขนาดรูปอัดร้านยอดนิยม คมชัดเหมาะกับการใส่กรอบ',
    recommendedFit: 'cover',
  },
  {
    id: 'print-a4',
    name: 'เอกสารพิมพ์ A4 คมชัดสูง (2480 × 3508)',
    category: 'print',
    width: 2480,
    height: 3508,
    description: 'ขนาดกระดาษ A4 มาตรฐานสากลที่ความละเอียด 300 DPI',
    recommendedFit: 'contain',
  },
];

export interface ResizeOptions {
  mode: ResizeMode;
  targetWidth: number;
  targetHeight: number;
  percent?: number; // e.g. 50%
  fit: ResizeFit; // cover (crop center), contain (letterbox/fit), fill (stretch)
  quality: number; // 0.1 to 1.0 (default 0.92)
  outputFormat: OutputFormatOption;
  backgroundColor?: string; // hex or color for contain padding / jpeg transparency, defaults to '#ffffff'
}

export interface ResizedResult {
  id: string;
  originalFile: File;
  originalWidth: number;
  originalHeight: number;
  originalSize: number;
  resizedBlob: Blob;
  resizedWidth: number;
  resizedHeight: number;
  resizedSize: number;
  reductionPercentage: number;
  previewUrl: string;
  outputName: string;
  mimeType: string;
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
      reject(new Error(`ไม่สามารถเปิดไฟล์รูปภาพได้: ${file.name}`));
    };
    img.src = url;
  });
}

/**
 * Resize a single image according to options
 */
export async function resizeSingleImage(
  file: File,
  options: ResizeOptions
): Promise<ResizedResult> {
  const img = await loadImageFromFile(file);
  const srcWidth = img.naturalWidth || img.width;
  const srcHeight = img.naturalHeight || img.height;

  let destWidth = options.targetWidth;
  let destHeight = options.targetHeight;

  // Handle percent mode
  if (options.mode === 'percent' && options.percent) {
    const ratio = options.percent / 100;
    destWidth = Math.max(1, Math.round(srcWidth * ratio));
    destHeight = Math.max(1, Math.round(srcHeight * ratio));
  }

  // Set up canvas
  const canvas = document.createElement('canvas');
  canvas.width = destWidth;
  canvas.height = destHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('ไม่สามารถเข้าถึงกราฟิก Canvas 2D ได้');
  }

  // Turn on high quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Background color fill (important for JPEG export and contain mode padding)
  const bgColor = options.backgroundColor || '#ffffff';
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, destWidth, destHeight);

  // Drawing logic based on fit
  if (options.fit === 'fill') {
    // Direct stretch
    ctx.drawImage(img, 0, 0, destWidth, destHeight);
  } else if (options.fit === 'cover') {
    // Center crop to fill target dimensions
    const srcRatio = srcWidth / srcHeight;
    const destRatio = destWidth / destHeight;
    let sWidth = srcWidth;
    let sHeight = srcHeight;
    let sx = 0;
    let sy = 0;

    if (srcRatio > destRatio) {
      // Source is wider than target -> crop left/right
      sWidth = Math.round(srcHeight * destRatio);
      sx = Math.round((srcWidth - sWidth) / 2);
    } else {
      // Source is taller than target -> crop top/bottom
      sHeight = Math.round(srcWidth / destRatio);
      sy = Math.round((srcHeight - sHeight) / 2);
    }

    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, destWidth, destHeight);
  } else {
    // contain mode - fit whole image inside destWidth x destHeight
    const srcRatio = srcWidth / srcHeight;
    const destRatio = destWidth / destHeight;
    let dWidth = destWidth;
    let dHeight = destHeight;
    let dx = 0;
    let dy = 0;

    if (srcRatio > destRatio) {
      // Source is wider -> width touches edges, letterbox top/bottom
      dHeight = Math.round(destWidth / srcRatio);
      dy = Math.round((destHeight - dHeight) / 2);
    } else {
      // Source is taller -> height touches edges, pillarbox left/right
      dWidth = Math.round(destHeight * srcRatio);
      dx = Math.round((destWidth - dWidth) / 2);
    }

    ctx.drawImage(img, 0, 0, srcWidth, srcHeight, dx, dy, dWidth, dHeight);
  }

  // Determine export MIME type
  let mimeType = file.type;
  if (options.outputFormat === 'image/jpeg') mimeType = 'image/jpeg';
  else if (options.outputFormat === 'image/webp') mimeType = 'image/webp';
  else if (options.outputFormat === 'image/png') mimeType = 'image/png';
  else if (options.outputFormat === 'original') {
    mimeType = file.type || 'image/jpeg';
  }

  // Determine export extension
  let ext = '.jpg';
  if (mimeType === 'image/png') ext = '.png';
  else if (mimeType === 'image/webp') ext = '.webp';
  else if (mimeType === 'image/jpeg') ext = '.jpg';

  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const outputName = `${baseName}_resized_${destWidth}x${destHeight}${ext}`;

  // Export blob
  const resizedBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('การแปลงภาพเป็นไฟล์ล้มเหลว'));
      },
      mimeType,
      options.quality
    );
  });

  const originalSize = file.size;
  const resizedSize = resizedBlob.size;
  const reductionPercentage =
    originalSize > 0
      ? Math.round(((originalSize - resizedSize) / originalSize) * 100)
      : 0;

  const previewUrl = URL.createObjectURL(resizedBlob);

  return {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    originalFile: file,
    originalWidth: srcWidth,
    originalHeight: srcHeight,
    originalSize,
    resizedBlob,
    resizedWidth: destWidth,
    resizedHeight: destHeight,
    resizedSize,
    reductionPercentage,
    previewUrl,
    outputName,
    mimeType,
  };
}

/**
 * Resize multiple images sequentially
 */
export async function resizeMultipleImages(
  files: File[],
  options: ResizeOptions,
  onProgress?: (current: number, total: number) => void
): Promise<ResizedResult[]> {
  const results: ResizedResult[] = [];
  const total = files.length;

  for (let i = 0; i < total; i++) {
    const file = files[i];
    const res = await resizeSingleImage(file, options);
    results.push(res);
    if (onProgress) {
      onProgress(i + 1, total);
    }
  }

  return results;
}

/**
 * Create a ZIP file of all resized images
 */
export async function createResizedImagesZip(
  results: ResizedResult[],
  zipName = 'toot-hub-resized-images.zip'
): Promise<Blob> {
  const zip = new JSZip();

  results.forEach((item, index) => {
    const filename = item.outputName || `resized_${index + 1}.jpg`;
    zip.file(filename, item.resizedBlob);
  });

  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}
