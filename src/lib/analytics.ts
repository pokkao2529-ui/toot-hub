/**
 * TOOL HUB — Google Analytics 4 (Firebase Analytics) Helper
 * 
 * ปลอดภัย: ไม่ส่ง filename, file content, personal data ไป GA4
 * ส่งเฉพาะ: event type, tool_name, tool_category, output_type, error_type
 */

import { app } from './firebase';

// Lazy load analytics (client-side only)
let analyticsInstance: any = null;

async function getAnalytics() {
  if (typeof window === 'undefined') return null;
  if (analyticsInstance) return analyticsInstance;

  try {
    const { getAnalytics: _getAnalytics, isSupported } = await import('firebase/analytics');
    const supported = await isSupported();
    if (!supported) return null;
    analyticsInstance = _getAnalytics(app);
    return analyticsInstance;
  } catch {
    return null;
  }
}

// ─── Event parameter types ──────────────────────────────────────────────────

export type ToolName =
  | 'image_compress'
  | 'image_convert'
  | 'image_resize'
  | 'image_remove_bg'
  | 'image_blur'
  | 'qr_text'
  | 'qr_url'
  | 'qr_wifi'
  | 'qr_promptpay'
  | 'qr_vcard'
  | 'merge_pdf'
  | 'split_pdf'
  | 'compress_pdf'
  | 'rotate_pdf'
  | 'organize_pdf'
  | 'extract_pages_pdf'
  | 'remove_pages_pdf'
  | 'watermark_pdf'
  | 'page_numbers_pdf'
  | 'sign_pdf'
  | 'unlock_pdf'
  | 'jpg_to_pdf'
  | 'png_to_pdf'
  | 'pdf_to_jpg'
  | 'word_to_pdf'
  | 'excel_to_pdf'
  | 'pptx_to_pdf'
  | 'pdf_to_word'
  | 'pdf_to_excel'
  | 'pdf_to_pptx';

export type ToolCategory = 'image' | 'pdf' | 'qrcode';

export interface ToolEventParams {
  tool_name: ToolName;
  tool_category: ToolCategory;
  output_type?: string;   // e.g. 'png', 'webp', 'pdf', 'zip'
  error_type?: string;    // e.g. 'file_too_large', 'format_unsupported'
}

// ─── Core tracking function ─────────────────────────────────────────────────

async function logEvent(eventName: string, params?: Record<string, string>) {
  try {
    const analytics = await getAnalytics();
    if (!analytics) return;
    const { logEvent: _logEvent } = await import('firebase/analytics');
    _logEvent(analytics, eventName, params);
  } catch {
    // Fail silently — never break the tool for analytics
  }
}

// ─── Public tracking functions ──────────────────────────────────────────────

/** เมื่อผู้ใช้เปิดหน้า Tool */
export async function trackToolOpen(params: Pick<ToolEventParams, 'tool_name' | 'tool_category'>) {
  await logEvent('tool_open', params);
}

/** เมื่อผู้ใช้เลือกไฟล์ */
export async function trackFileSelected(params: Pick<ToolEventParams, 'tool_name' | 'tool_category'>) {
  await logEvent('tool_file_selected', params);
}

/** เมื่อผู้ใช้กดเริ่มประมวลผล */
export async function trackToolStart(params: Pick<ToolEventParams, 'tool_name' | 'tool_category'>) {
  await logEvent('tool_start', params);
}

/** เมื่อ Tool ประมวลผลสำเร็จ */
export async function trackToolSuccess(params: ToolEventParams) {
  await logEvent('tool_success', {
    tool_name: params.tool_name,
    tool_category: params.tool_category,
    ...(params.output_type ? { output_type: params.output_type } : {}),
  });
}

/** เมื่อ Tool เกิด Error */
export async function trackToolError(params: ToolEventParams) {
  await logEvent('tool_error', {
    tool_name: params.tool_name,
    tool_category: params.tool_category,
    ...(params.error_type ? { error_type: params.error_type } : {}),
  });
}

/** เมื่อผู้ใช้กด Download */
export async function trackToolDownload(params: ToolEventParams) {
  await logEvent('tool_download', {
    tool_name: params.tool_name,
    tool_category: params.tool_category,
    ...(params.output_type ? { output_type: params.output_type } : {}),
  });
}
