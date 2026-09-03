export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FileValidationOptions {
  maxFileSize?: number; // bytes
  acceptedMimeTypes?: string[];
  checkPdfSignature?: boolean;
}

const DEFAULT_MAX_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * Sanitizes a filename to prevent malicious paths, script injections, or OS-illegal characters.
 */
export function sanitizeFilename(filename: string, fallbackBase = 'document'): string {
  // Remove path traversal and illegal characters
  const cleaned = filename
    .replace(/^.*[\\/]/, '') // get basename
    .replace(/[^a-zA-Z0-9ก-๙._\- ]/g, '_') // sanitize
    .trim();

  if (!cleaned || cleaned === '.' || cleaned === '..') {
    return `${fallbackBase}_${Date.now()}`;
  }
  return cleaned;
}

/**
 * Validates a file's MIME, extension, size, and header signature.
 */
export async function validateFile(
  file: File,
  options: FileValidationOptions = {}
): Promise<ValidationResult> {
  const maxSize = options.maxFileSize || DEFAULT_MAX_SIZE;

  // 1. File size check
  if (file.size <= 0) {
    return { isValid: false, error: 'ไฟล์ว่างเปล่า (0 Bytes) กรุณาเลือกไฟล์ที่สมบูรณ์' };
  }

  if (file.size > maxSize) {
    const maxMb = Math.round(maxSize / (1024 * 1024));
    return { isValid: false, error: `ขนาดไฟล์เกินกำหนด (สูงสุด ${maxMb} MB)` };
  }

  // 2. MIME type & extension check
  const filename = file.name.toLowerCase();
  const isPdf = filename.endsWith('.pdf') || file.type === 'application/pdf';
  const isImage = /\.(jpe?g|png|webp)$/i.test(filename) || file.type.startsWith('image/');

  if (options.acceptedMimeTypes && options.acceptedMimeTypes.length > 0) {
    const isAccepted = options.acceptedMimeTypes.some((type) => {
      if (type === 'application/pdf' && isPdf) return true;
      if (type.startsWith('image/') && isImage) return true;
      return file.type === type;
    });

    if (!isAccepted) {
      return { isValid: false, error: 'ประเภทไฟล์ไม่ตรงตามที่ระบบรองรับ' };
    }
  }

  // 3. PDF Signature check (Magic Bytes: %PDF-)
  if (isPdf && options.checkPdfSignature !== false) {
    try {
      const slice = file.slice(0, 8);
      const buffer = await slice.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      // %PDF- in ASCII: 0x25, 0x50, 0x44, 0x46, 0x2D
      const isPdfHeader =
        bytes[0] === 0x25 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x44 &&
        bytes[3] === 0x46 &&
        bytes[4] === 0x2D;

      if (!isPdfHeader) {
        return { isValid: false, error: 'โครงสร้างไฟล์ไม่ใช่ PDF ที่ถูกต้อง หรือไฟล์เกิดความเสียหาย' };
      }
    } catch {
      return { isValid: false, error: 'ไม่สามารถอ่านโครงสร้างไฟล์เพื่อตรวจสอบความปลอดภัยได้' };
    }
  }

  return { isValid: true };
}

/**
 * Validates a list of files against tool limits
 */
export async function validateFileList(
  files: File[],
  maxFiles = 20,
  options: FileValidationOptions = {}
): Promise<ValidationResult> {
  if (files.length === 0) {
    return { isValid: false, error: 'กรุณาเลือกไฟล์อย่างน้อย 1 ไฟล์' };
  }

  if (files.length > maxFiles) {
    return { isValid: false, error: `สามารถอัปโหลดได้สูงสุดไม่เกิน ${maxFiles} ไฟล์พร้อมกัน` };
  }

  for (const file of files) {
    const res = await validateFile(file, options);
    if (!res.isValid) {
      return { isValid: false, error: `${file.name}: ${res.error}` };
    }
  }

  return { isValid: true };
}
