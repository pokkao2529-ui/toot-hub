import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ติดต่อเรา (Contact Us) — TOOL HUB',
  description: 'ติดต่อทีมงาน TOOL HUB เพื่อสอบถามข้อมูล แจ้งปัญหาการใช้งาน หรือส่งข้อเสนอแนะในการพัฒนาเครื่องมือ',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
