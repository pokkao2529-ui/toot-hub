import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'แปลง PDF เป็น JPG (PDF to JPG)',
  description: 'แปลงหน้า PDF แต่ละหน้าให้เป็นรูปภาพ JPG',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
