import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'หมุน PDF (Rotate PDF)',
  description: 'หมุนหน้า PDF ที่กลับหัวหรือตะแคงให้ถูกต้อง',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
