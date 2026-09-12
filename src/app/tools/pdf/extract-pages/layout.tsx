import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ดึงหน้า PDF (Extract Pages)',
  description: 'ดึงหน้าเอกสารเฉพาะหน้าที่คุณต้องการออกจาก PDF',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
