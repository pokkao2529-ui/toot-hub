import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'บีบอัด PDF (Compress PDF)',
  description: 'ลดขนาดไฟล์ PDF ให้เล็กลง โดยยังคงคุณภาพที่ดีไว้',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
