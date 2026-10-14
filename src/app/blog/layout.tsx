import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'บทความและคู่มือการใช้งานเครื่องมือ — TOOL HUB',
  description: 'รวมบทความ คู่มือ และเทคนิคการใช้งานเครื่องมือ PDF, บีบอัดรูปภาพ, แปลงไฟล์ และสร้าง QR Code ให้เกิดประโยชน์สูงสุด',
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
