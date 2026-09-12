import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ใส่ลายน้ำ PDF (Add Watermark)',
  description: 'เพิ่มข้อความหรือรูปภาพลายน้ำลงใน PDF ของคุณ',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
