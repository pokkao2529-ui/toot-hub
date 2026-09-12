import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'สร้าง QR Code ฟรี (QR Code Generator)',
  description: 'สร้าง QR Code ลิงก์ ข้อความ หรือ WiFi ฟรี ไม่มีหมดอายุ รองรับการใส่โลโก้ และดาวน์โหลดเป็น PNG หรือ SVG',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
