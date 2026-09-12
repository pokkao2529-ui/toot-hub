import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'แปลงไฟล์รูปภาพ JPG, PNG, WebP (Image Converter)',
  description: 'แปลงไฟล์รูปภาพออนไลน์ฟรี สลับนามสกุลไฟล์ JPG, PNG, WebP ง่ายๆ ในคลิกเดียว ไม่จำกัดจำนวนรูป',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
