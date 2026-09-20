import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'แปลง Word เป็น PDF ออนไลน์ ฟรี | TOOL HUB',
  description: 'เครื่องมือแปลงไฟล์ Word เป็น PDF ฟรี รองรับไฟล์ DOC และ DOCX ใช้งานง่ายผ่านเบราว์เซอร์ พร้อมดาวน์โหลดไฟล์ PDF ได้ทันที ไม่ส่งไฟล์ขึ้นเซิร์ฟเวอร์',
  alternates: {
    canonical: 'https://toot-hub.vercel.app/tools/pdf/word-to-pdf',
  },
  openGraph: {
    title: 'แปลง Word เป็น PDF ออนไลน์ ฟรี | TOOL HUB',
    description: 'เครื่องมือแปลงไฟล์ Word เป็น PDF ฟรี รองรับไฟล์ DOC และ DOCX ใช้งานง่ายผ่านเบราว์เซอร์ พร้อมดาวน์โหลดไฟล์ PDF ได้ทันที ไม่ส่งไฟล์ขึ้นเซิร์ฟเวอร์',
    url: 'https://toot-hub.vercel.app/tools/pdf/word-to-pdf',
    type: 'website',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
