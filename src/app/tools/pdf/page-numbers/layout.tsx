import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ใส่เลขหน้า PDF (Add Page Numbers)',
  description: 'เพิ่มหมายเลขหน้าลงในเอกสาร PDF ของคุณ',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
