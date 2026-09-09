import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-3">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="h-8 w-8 rounded-lg bg-red-600 flex items-center justify-center font-bold text-white text-base">
                T
              </span>
              <span className="font-bold text-lg text-slate-900 dark:text-white">
                TOOL HUB
              </span>
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              ศูนย์รวมเครื่องมือออนไลน์ฟรีระดับพรีเมียม ประมวลผลบนเบราว์เซอร์ 100% ปลอดภัย ไม่ส่งไฟล์ขึ้นเซิร์ฟเวอร์
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
              <ShieldCheck size={16} />
              <span>ความปลอดภัยสูงสุด ไม่เก็บข้อมูล</span>
            </div>
          </div>

          {/* PDF Suite */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              PDF Suite
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/pdf" className="hover:text-red-600 transition">
                  เครื่องมือ PDF ทั้งหมด
                </Link>
              </li>
              <li>
                <Link href="/tools/pdf/compress" className="hover:text-red-600 transition font-medium text-red-600 dark:text-red-400">
                  บีบอัดลดขนาด PDF
                </Link>
              </li>
              <li>
                <Link href="/tools/pdf/merge" className="hover:text-red-600 transition">
                  รวมไฟล์ PDF
                </Link>
              </li>
              <li>
                <Link href="/tools/pdf/split" className="hover:text-red-600 transition">
                  แยกไฟล์ PDF
                </Link>
              </li>
              <li>
                <Link href="/tools/pdf/jpg-to-pdf" className="hover:text-red-600 transition">
                  แปลง JPG เป็น PDF
                </Link>
              </li>
              <li>
                <Link href="/tools/pdf/png-to-pdf" className="hover:text-red-600 transition">
                  แปลง PNG เป็น PDF
                </Link>
              </li>
              <li>
                <Link href="/tools/pdf/pdf-to-jpg" className="hover:text-red-600 transition">
                  แปลง PDF เป็น JPG
                </Link>
              </li>
              <li>
                <Link href="/tools/pdf/watermark" className="hover:text-red-600 transition">
                  ใส่ลายน้ำ PDF
                </Link>
              </li>
            </ul>
          </div>

          {/* Image & QR Suite */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Image & QR Suite
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/tools/image/compress" className="hover:text-red-600 transition">
                  บีบอัดรูปภาพ (JPG, PNG, WebP)
                </Link>
              </li>
              <li>
                <Link href="/tools/image/resize" className="hover:text-red-600 transition">
                  ปรับขนาดรูปภาพ (1-2 นิ้ว, Social, Shopee)
                </Link>
              </li>
              <li>
                <Link href="/tools/image/convert" className="hover:text-red-600 transition">
                  แปลงไฟล์ภาพ (JPG ↔ PNG ↔ WebP)
                </Link>
              </li>
              <li>
                <Link href="/tools/qrcode" className="hover:text-red-600 transition">
                  สร้าง QR Code ฟรี
                </Link>
              </li>
              <li>
                <Link href="/tools/qrcode" className="hover:text-red-600 transition">
                  QR Code พร้อมเพย์ (PromptPay)
                </Link>
              </li>
              <li>
                <Link href="/tools/qrcode" className="hover:text-red-600 transition">
                  QR Code นามบัตรดิจิทัล
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Company (Mandatory for AdSense) */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              ข้อมูลและบทความ
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/blog" className="hover:text-red-600 transition font-medium text-red-600 dark:text-red-400">
                  บทความและคู่มือ (Blog & Guides)
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-red-600 transition">
                  เกี่ยวกับเรา (About Us)
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-red-600 transition font-medium text-slate-800 dark:text-slate-200">
                  นโยบายความเป็นส่วนตัว (Privacy Policy)
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-red-600 transition">
                  ข้อกำหนดและเงื่อนไข (Terms of Service)
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-red-600 transition">
                  ติดต่อเรา & แจ้งปัญหา (Contact Us)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 TOOL HUB. ศูนย์รวมเครื่องมือออนไลน์ฟรี • All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/blog" className="hover:text-slate-700 dark:hover:text-slate-300">
              Blog
            </Link>
            <Link href="/privacy-policy" className="hover:text-slate-700 dark:hover:text-slate-300">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-slate-700 dark:hover:text-slate-300">
              Terms of Use
            </Link>
            <Link href="/contact" className="hover:text-slate-700 dark:hover:text-slate-300">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
