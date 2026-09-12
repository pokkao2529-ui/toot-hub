import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'จัดระเบียบหน้า PDF (Organize PDF)',
  description: 'เรียงลำดับหน้า หมุน หรือลบหน้า PDF ตามต้องการ',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
