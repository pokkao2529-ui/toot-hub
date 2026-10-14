import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF Suite — รวมเครื่องมือจัดการเอกสาร PDF ออนไลน์ฟรี | TOOL HUB',
  description: 'รวมเครื่องมือจัดการเอกสาร PDF ครบวงจร ทั้งรวมไฟล์ แยกหน้า บีบอัด เซ็นสำเนาถูกต้อง แปลงไฟล์ และใส่ลายน้ำ ปลอดภัย ประมวลผลในเครื่อง',
};

export default function PdfLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
