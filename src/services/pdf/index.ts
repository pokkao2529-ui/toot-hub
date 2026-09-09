import { mergePdfs, type MergePdfOptions } from './merge.service';
import { splitPdf, type SplitPdfOptions, type SplitResult } from './split.service';
import { removePages, type RemovePagesOptions } from './remove-pages.service';
import { extractPages, type ExtractPagesOptions, type ExtractResult } from './extract-pages.service';
import { organizePdf, type OrganizePdfOptions } from './organize.service';
import { rotatePdf, type RotatePdfOptions } from './rotate.service';
import { convertJpgToPdf, type JpgToPdfOptions } from './jpg-to-pdf.service';
import { convertPdfToJpg, type PdfToJpgOptions, type PdfToJpgResult } from './pdf-to-jpg.service';
import { renderPdfThumbnails, getPdfPageCount, type PageThumbnail } from './pdf-thumbnail.service';
import { validateFile, validateFileList, sanitizeFilename, type ValidationResult } from './pdf-validation.service';

import { addWatermark, type WatermarkOptions } from './watermark.service';
import { addPageNumbers, type PageNumbersOptions, type PageNumberPosition, type PageNumberFormat } from './page-numbers.service';
import { unlockPdf, type UnlockPdfOptions } from './unlock.service';
import { compressPdf, type CompressPdfOptions, type CompressPdfResult, type CompressionPreset } from './compress.service';
import { signPdf, type SignPdfOptions, type PlacedSignature } from './sign.service';

/**
 * Centralized PDF Service Layer Facade
 * Follows clean architecture: UI -> pdfService -> Isolated Service -> Engine
 */
export const pdfService = {
  // Client Services (Phase 1 & Phase 2)
  merge: mergePdfs,
  split: splitPdf,
  removePages: removePages,
  extractPages: extractPages,
  organize: organizePdf,
  rotate: rotatePdf,
  jpgToPdf: convertJpgToPdf,
  pdfToJpg: convertPdfToJpg,
  watermark: addWatermark,
  pageNumbers: addPageNumbers,
  unlock: unlockPdf,
  compress: compressPdf,
  sign: signPdf,

  // Rendering & Utilities
  renderThumbnails: renderPdfThumbnails,
  getPageCount: getPdfPageCount,
  validateFile: validateFile,
  validateFileList: validateFileList,
  sanitizeFilename: sanitizeFilename,

  // Future Server/AI Service Placeholders
  ocr: async () => {
    throw new Error('ฟังก์ชัน OCR กำลังพัฒนา (AI/Server Mode)');
  },
  protect: async () => {
    throw new Error('ฟังก์ชันล็อกรหัสผ่านกำลังพัฒนา');
  },
  redact: async () => {
    throw new Error('ฟังก์ชันเซ็นเซอร์ข้อความกำลังพัฒนา');
  },
  compare: async () => {
    throw new Error('ฟังก์ชันเปรียบเทียบ PDF กำลังพัฒนา');
  },
};

export type {
  MergePdfOptions,
  SplitPdfOptions,
  SplitResult,
  RemovePagesOptions,
  ExtractPagesOptions,
  ExtractResult,
  OrganizePdfOptions,
  RotatePdfOptions,
  JpgToPdfOptions,
  PdfToJpgOptions,
  PdfToJpgResult,
  WatermarkOptions,
  PageNumbersOptions,
  PageNumberPosition,
  PageNumberFormat,
  UnlockPdfOptions,
  CompressPdfOptions,
  CompressPdfResult,
  CompressionPreset,
  SignPdfOptions,
  PlacedSignature,
  PageThumbnail,
  ValidationResult,
};
