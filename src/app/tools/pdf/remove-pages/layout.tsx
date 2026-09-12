import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ลบหน้า PDF (Remove Pages)',
  description: 'ลบหน้าที่ไม่ต้องการออกจากไฟล์ PDF ของคุณ',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
