import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'แปลง JPG เป็น PDF (JPG to PDF)',
  description: 'แปลงรูปภาพ JPG ของคุณให้เป็นไฟล์ PDF',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
