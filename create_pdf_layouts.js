const fs = require('fs');
const path = require('path');

const PDF_TOOLS = [
  { slug: 'merge', seoTitle: 'รวมไฟล์ PDF (Merge PDF)', seoDescription: 'รวมไฟล์ PDF หลายไฟล์ให้เป็นไฟล์เดียว จัดเรียงหน้าได้ตามต้องการ' },
  { slug: 'split', seoTitle: 'แยกไฟล์ PDF (Split PDF)', seoDescription: 'แยกหน้า PDF เป็นหลายไฟล์ หรือแยกเฉพาะหน้าที่ต้องการ' },
  { slug: 'remove-pages', seoTitle: 'ลบหน้า PDF (Remove Pages)', seoDescription: 'ลบหน้าที่ไม่ต้องการออกจากไฟล์ PDF ของคุณ' },
  { slug: 'extract-pages', seoTitle: 'ดึงหน้า PDF (Extract Pages)', seoDescription: 'ดึงหน้าเอกสารเฉพาะหน้าที่คุณต้องการออกจาก PDF' },
  { slug: 'organize', seoTitle: 'จัดระเบียบหน้า PDF (Organize PDF)', seoDescription: 'เรียงลำดับหน้า หมุน หรือลบหน้า PDF ตามต้องการ' },
  { slug: 'rotate', seoTitle: 'หมุน PDF (Rotate PDF)', seoDescription: 'หมุนหน้า PDF ที่กลับหัวหรือตะแคงให้ถูกต้อง' },
  { slug: 'compress', seoTitle: 'บีบอัด PDF (Compress PDF)', seoDescription: 'ลดขนาดไฟล์ PDF ให้เล็กลง โดยยังคงคุณภาพที่ดีไว้' },
  { slug: 'jpg-to-pdf', seoTitle: 'แปลง JPG เป็น PDF (JPG to PDF)', seoDescription: 'แปลงรูปภาพ JPG ของคุณให้เป็นไฟล์ PDF' },
  { slug: 'png-to-pdf', seoTitle: 'แปลง PNG เป็น PDF (PNG to PDF)', seoDescription: 'แปลงรูปภาพ PNG ของคุณให้เป็นไฟล์ PDF' },
  { slug: 'pdf-to-jpg', seoTitle: 'แปลง PDF เป็น JPG (PDF to JPG)', seoDescription: 'แปลงหน้า PDF แต่ละหน้าให้เป็นรูปภาพ JPG' },
  { slug: 'watermark', seoTitle: 'ใส่ลายน้ำ PDF (Add Watermark)', seoDescription: 'เพิ่มข้อความหรือรูปภาพลายน้ำลงใน PDF ของคุณ' },
  { slug: 'page-numbers', seoTitle: 'ใส่เลขหน้า PDF (Add Page Numbers)', seoDescription: 'เพิ่มหมายเลขหน้าลงในเอกสาร PDF ของคุณ' },
  { slug: 'sign', seoTitle: 'เซ็นลายเซ็น & รับรองสำเนาถูกต้อง (Sign PDF)', seoDescription: 'เซ็นลายเซ็นบนเอกสาร PDF พร้อมข้อความรับรองสำเนา' },
  { slug: 'unlock', seoTitle: 'ปลดล็อก PDF (Unlock PDF)', seoDescription: 'ปลดรหัสผ่าน PDF เพื่อให้สามารถอ่านและแก้ไขได้' }
];

const basePath = path.join(__dirname, 'src', 'app', 'tools', 'pdf');

PDF_TOOLS.forEach(tool => {
  const dirPath = path.join(basePath, tool.slug);
  if (fs.existsSync(dirPath)) {
    const layoutContent = `import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '${tool.seoTitle}',
  description: '${tool.seoDescription}',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
`;
    fs.writeFileSync(path.join(dirPath, 'layout.tsx'), layoutContent);
    console.log('Created layout for', tool.slug);
  }
});
