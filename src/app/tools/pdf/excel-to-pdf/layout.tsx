import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'แปลง Excel เป็น PDF ออนไลน์ ฟรี | TOOL HUB',
  description: 'เครื่องมือแปลงไฟล์ Excel เป็น PDF ฟรี รองรับไฟล์ XLS และ XLSX ใช้งานง่ายผ่านเบราว์เซอร์ พร้อมดาวน์โหลดไฟล์ PDF ได้ทันที ไม่ส่งไฟล์ขึ้นเซิร์ฟเวอร์',
  alternates: {
    canonical: 'https://toot-hub.vercel.app/tools/pdf/excel-to-pdf',
  },
  openGraph: {
    title: 'แปลง Excel เป็น PDF ออนไลน์ ฟรี | TOOL HUB',
    description: 'เครื่องมือแปลงไฟล์ Excel เป็น PDF ฟรี รองรับไฟล์ XLS และ XLSX ใช้งานง่ายผ่านเบราว์เซอร์ พร้อมดาวน์โหลดไฟล์ PDF ได้ทันที ไม่ส่งไฟล์ขึ้นเซิร์ฟเวอร์',
    url: 'https://toot-hub.vercel.app/tools/pdf/excel-to-pdf',
    type: 'website',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
