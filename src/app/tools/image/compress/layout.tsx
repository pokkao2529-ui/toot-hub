import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'บีบอัดรูปภาพ JPG, PNG, WebP (Compress Image)',
  description: 'ลดขนาดไฟล์รูปภาพออนไลน์ฟรี บีบอัดภาพ JPG, PNG ให้เล็กลงสูงสุด 80% โดยไม่เสียความคมชัด ไม่ต้องติดตั้งโปรแกรม',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
