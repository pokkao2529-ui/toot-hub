import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'รวมไฟล์ PDF (Merge PDF)',
  description: 'รวมไฟล์ PDF หลายไฟล์ให้เป็นไฟล์เดียว จัดเรียงหน้าได้ตามต้องการ',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
