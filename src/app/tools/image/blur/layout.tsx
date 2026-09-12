import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'เบลอรูปภาพ เซ็นเซอร์ใบหน้า โมเสก (Blur Image) ออนไลน์ฟรี',
  description: 'เบลอรูปภาพออนไลน์ เบลอใบหน้า เซ็นเซอร์ข้อมูลสำคัญ หรือทำโมเสก เลือกจุดที่ต้องการเบลอได้เองฟรี 100% ไม่ติดลายน้ำ',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
