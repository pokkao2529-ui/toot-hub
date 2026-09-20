export function translatePdfError(err: any): string {
  if (!err) return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
  
  const msg = typeof err === 'string' ? err : (err.message || String(err));
  
  const lowerMsg = msg.toLowerCase();

  if (lowerMsg.includes('encrypted') || lowerMsg.includes('password')) {
    return 'ไฟล์ PDF นี้ถูกตั้งรหัสผ่าน (Encrypted) กรุณาปลดล็อกก่อนใช้งาน';
  }
  if (lowerMsg.includes('parse pdf') || lowerMsg.includes('invalid pdf')) {
    return 'ไม่สามารถอ่านไฟล์ PDF ได้ (ไฟล์อาจเสียหายหรือไม่ใช่รูปแบบ PDF ที่ถูกต้อง)';
  }
  if (lowerMsg.includes('memory') || lowerMsg.includes('heap')) {
    return 'ขนาดไฟล์หรือข้อมูลใหญ่เกินไป ทำให้หน่วยความจำไม่เพียงพอ';
  }
  if (lowerMsg.includes('corrupted') || lowerMsg.includes('xref')) {
    return 'โครงสร้างไฟล์ PDF เสียหาย (Corrupted)';
  }

  // หากไม่ตรงเงื่อนไขข้างต้น ให้แสดงข้อความภาษาไทยทั่วไป หรือใช้ข้อความเดิม
  return msg.length > 50 ? 'เกิดข้อผิดพลาดในการประมวลผล PDF (โปรดตรวจสอบไฟล์ของคุณ)' : msg;
}
