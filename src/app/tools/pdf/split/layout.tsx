import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'แยกไฟล์ PDF (Split PDF)',
  description: 'แยกหน้า PDF เป็นหลายไฟล์ หรือแยกเฉพาะหน้าที่ต้องการ',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
