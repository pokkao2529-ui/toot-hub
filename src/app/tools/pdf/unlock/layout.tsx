import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ปลดล็อก PDF (Unlock PDF)',
  description: 'ปลดรหัสผ่าน PDF เพื่อให้สามารถอ่านและแก้ไขได้',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
