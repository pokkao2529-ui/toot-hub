import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ไดคัทรูปภาพออนไลน์ ลบพื้นหลัง (Remove Background) ฟรี',
  description: 'ลบพื้นหลังรูปภาพออนไลน์ฟรี ไดคัทลายเซ็น ทำพื้นหลังโปร่งใส ดาวน์โหลดเป็น PNG ได้ทันที ไม่จำกัดจำนวนรูป',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
