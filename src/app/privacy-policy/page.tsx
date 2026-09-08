import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ShieldCheck, Lock, EyeOff, Cookie, Server, CheckCircle2, ArrowLeft, Mail } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'นโยบายความเป็นส่วนตัว (Privacy Policy) — TOOL HUB',
  description: 'นโยบายความเป็นส่วนตัวและการรักษาความปลอดภัยข้อมูลของ TOOL HUB เครื่องมือประมวลผลบนเบราว์เซอร์ 100% ไม่ส่งไฟล์ขึ้นเซิร์ฟเวอร์ และการใช้งานคุกกี้ Google AdSense',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col">
      {/* Header / Navbar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-red-600 flex items-center justify-center font-bold text-white text-base shadow-sm">
              T
            </span>
            <span className="font-extrabold text-lg text-slate-900 dark:text-white">
              TOOL HUB
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-red-600 flex items-center gap-1.5 transition"
          >
            <ArrowLeft size={14} />
            <span>กลับหน้าหลัก</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title Badge */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-xs font-bold border border-emerald-200 dark:border-emerald-900 mb-4">
            <ShieldCheck size={15} />
            <span>มาตรฐานความปลอดภัยสูงสุด • Client-Side 100%</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            นโยบายความเป็นส่วนตัว
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Privacy Policy • ปรับปรุงล่าสุดเมื่อวันที่ 8 กันยายน 2026
          </p>
        </div>

        {/* Security Callout Box */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/20 mb-10">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-emerald-500 text-white shadow-md">
              <Lock size={24} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                หัวใจสำคัญ: ไฟล์ของคุณจะไม่ถูกส่งไปยังเซิร์ฟเวอร์ของเรา
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                TOOL HUB ให้ความสำคัญกับความเป็นส่วนตัวของคุณเป็นอันดับหนึ่ง เครื่องมือส่วนใหญ่ของเรา (เช่น PDF Suite, Image Converter, Image Compress, QR Code Generator) ทำงานแบบ <strong>Client-Side 100%</strong> ภายในเว็บเบราว์เซอร์บนเครื่องของท่านเอง ไฟล์เอกสารและรูปภาพของท่านจะไม่ถูกอัปโหลดขึ้นเซิร์ฟเวอร์ใดๆ ไม่มีการจัดเก็บข้อมูล และไม่มีใครสามารถเข้าถึงไฟล์ของท่านได้นอกจากตัวท่านเอง
              </p>
            </div>
          </div>
        </div>

        {/* Policy Sections */}
        <div className="space-y-10 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {/* Section 1 */}
          <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <EyeOff size={18} className="text-red-600" />
              <span>1. ข้อมูลที่เราไม่จัดเก็บ (Zero Data Collection)</span>
            </h2>
            <p className="mb-3">
              เมื่อท่านใช้งานเครื่องมือบน TOOL HUB:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs text-slate-600 dark:text-slate-400">
              <li>เรา<strong>ไม่เก็บ</strong>ไฟล์ PDF, เอกสาร, หรือรูปภาพใดๆ ของท่านลงบนเซิร์ฟเวอร์</li>
              <li>เรา<strong>ไม่บันทึก</strong>เนื้อหาข้อมูล, ข้อความ, หรือรหัสผ่านที่ท่านกรอกลงในเครื่องมือ</li>
              <li>การคำนวณ ประมวลผล และแปลงไฟล์เกิดขึ้นใน RAM ของอุปกรณ์ของท่านผ่าน JavaScript และ WebAssembly</li>
              <li>เมื่อท่านปิดแท็บเบราว์เซอร์ ข้อมูลทั้งหมดในหน่วยความจำจะถูกลบทิ้งทันทีโดยอัตโนมัติ</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Cookie size={18} className="text-amber-500" />
              <span>2. นโยบายคุกกี้และโฆษณา Google AdSense (Cookie & Advertising Policy)</span>
            </h2>
            <p className="mb-3">
              เพื่อให้เราสามารถให้บริการเครื่องมือทั้งหมดแก่ท่านได้<strong>ฟรี 100%</strong> โดยไม่มีค่าใช้จ่าย เว็บไซต์ของเราจำเป็นต้องแสดงโฆษณาที่ได้รับความร่วมมือจากพันธมิตรบุคคลที่สาม เช่น <strong>Google AdSense</strong>
            </p>
            <div className="space-y-3 text-xs bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <p>
                <strong>การทำงานของคุกกี้ Google AdSense และ DoubleClick:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li>
                  ผู้ให้บริการบุคคลที่สาม ซึ่งรวมถึง Google ใช้คุกกี้ (Cookies) เพื่อแสดงโฆษณาตามการเข้าชมเว็บไซต์นี้หรือเว็บไซต์อื่นๆ ในอดีตของผู้ใช้
                </li>
                <li>
                  การใช้คุกกี้เพื่อการโฆษณาของ Google ช่วยให้ Google และพาร์ทเนอร์สามารถแสดงโฆษณาแก่ผู้ใช้ตามการเยี่ยมชมไซต์ของคุณและ/หรือไซต์อื่นๆ บนอินเทอร์เน็ต
                </li>
                <li>
                  ผู้ใช้สามารถเลือกไม่รับโฆษณาที่ปรับตามโปรไฟล์บุคคลได้โดยไปที่{' '}
                  <a
                    href="https://adssettings.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 underline hover:text-red-700"
                  >
                    การตั้งค่าโฆษณาของ Google (Google Ads Settings)
                  </a>{' '}
                  หรือไปที่เว็บไซต์{' '}
                  <a
                    href="https://www.aboutads.info"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 underline hover:text-red-700"
                  >
                    aboutads.info
                  </a>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Server size={18} className="text-blue-500" />
              <span>3. ข้อมูลทางเทคนิคและสถิติการใช้งาน (Analytics & Log Files)</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
              เช่นเดียวกับเว็บไซต์มาตรฐานทั่วไป เราอาจมีการบันทึกข้อมูลทางสถิติที่ไม่สามารถระบุตัวบุคคลได้ (Anonymous Analytics) เช่น ประเภทของเบราว์เซอร์, ระบบปฏิบัติการ, ความละเอียดหน้าจอ, หน้าที่เข้าชม, และระยะเวลาที่ใช้งาน เพื่อวัตถุประสงค์ในการปรับปรุงประสิทธิภาพของระบบ การแก้จุดบกพร่อง (Bug fix) และเพิ่มความเร็วในการใช้งานให้ดียิ่งขึ้น
            </p>
          </section>

          {/* Section 4 */}
          <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-500" />
              <span>4. ความสอดคล้องตามกฎหมาย PDPA และ GDPR</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              TOOL HUB ปฏิบัติตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) ของประเทศไทย และข้อบังคับว่าด้วยการคุ้มครองข้อมูลทั่วไปของสหภาพยุโรป (GDPR) อย่างเคร่งครัด ท่านมีสิทธิในการเข้าถึง แก้ไข หรือร้องขอให้ลบข้อมูลส่วนบุคคลที่อาจมีอยู่ (หากมี) โดยติดต่อเราผ่านช่องทางที่ระบุไว้ด้านล่าง
            </p>
          </section>

          {/* Section 5 */}
          <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Mail size={18} className="text-red-500" />
              <span>5. ช่องทางการติดต่อสอบถาม</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              หากท่านมีคำถาม ข้อสงสัย หรือข้อเสนอแนะเกี่ยวกับนโยบายความเป็นส่วนตัวนี้ สามารถติดต่อทีมงานผู้ดูแลระบบ TOOL HUB ได้ตลอดเวลาที่:
            </p>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
              <p className="font-bold text-slate-900 dark:text-white">ทีมงาน TOOL HUB</p>
              <p className="text-slate-500">อีเมลฝ่ายสนับสนุนและนโยบายความเป็นส่วนตัว: contact@toot-hub.com (หรือผ่านหน้าติดต่อเรา)</p>
              <Link href="/contact" className="text-red-600 font-semibold hover:underline mt-2 inline-block">
                ไปยังหน้าติดต่อเรา (Contact Us) →
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* Reusable Footer */}
      <Footer />
    </div>
  );
}
