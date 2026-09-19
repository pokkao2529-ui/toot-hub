import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ลบพื้นหลังรูปภาพ ไดคัทรูปออนไลน์ฟรี ทำพื้นโปร่งใส PNG',
  description: 'ลบพื้นหลังรูปภาพออนไลน์ฟรี ไดคัทรูปคน รูปสัตว์ ลายเซ็น สินค้า ทำพื้นหลังโปร่งใส ดาวน์โหลดเป็น PNG ฟรี ไม่ติดลายน้ำ ปลอดภัย ไม่อัปโหลดขึ้นเซิร์ฟเวอร์',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
