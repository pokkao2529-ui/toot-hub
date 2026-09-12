import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'แปลง PNG เป็น PDF (PNG to PDF)',
  description: 'แปลงรูปภาพ PNG ของคุณให้เป็นไฟล์ PDF',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
