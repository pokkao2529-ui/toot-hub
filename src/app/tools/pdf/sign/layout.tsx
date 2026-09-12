import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'เซ็นลายเซ็น & รับรองสำเนาถูกต้อง (Sign PDF)',
  description: 'เซ็นลายเซ็นบนเอกสาร PDF พร้อมข้อความรับรองสำเนา',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
