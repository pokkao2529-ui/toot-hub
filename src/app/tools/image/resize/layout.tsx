import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ปรับขนาดรูปภาพ, ย่อขยายรูปภาพออนไลน์ฟรี (Image Resizer)',
  description: 'ย่อขยายรูปภาพ ปรับขนาดรูปทำรูปติดบัตร 1 นิ้ว 1.5 นิ้ว 2 นิ้ว หรือรูป Shopee, Facebook ง่ายๆ ไม่เสียสัดส่วน',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
