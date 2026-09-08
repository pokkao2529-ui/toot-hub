import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { FileText, CheckCircle2, AlertTriangle, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'ข้อกำหนดและเงื่อนไขการใช้งาน (Terms of Service) — TOOL HUB',
  description: 'ข้อกำหนดและเงื่อนไขการให้บริการของ TOOL HUB สิทธิ์การใช้งานเครื่องมือออนไลน์ฟรี ข้อจำกัดความรับผิดชอบ และการคุ้มครองทรัพย์สินทางปัญญาของผู้ใช้',
};

export default function TermsPage() {
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
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 text-xs font-bold border border-blue-200 dark:border-blue-900 mb-4">
            <FileText size={15} />
            <span>ข้อตกลงการใช้งานบริการ • Terms of Service</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            ข้อกำหนดและเงื่อนไขการใช้งาน
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            ปรับปรุงล่าสุดเมื่อวันที่ 8 กันยายน 2026
          </p>
        </div>

        {/* Intro Box */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-8 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            ยินดีต้อนรับสู่ <strong>TOOL HUB</strong> การเข้าถึงและใช้งานเว็บไซต์ รวมถึงชุดเครื่องมือทั้งหมด (PDF Suite, Image Suite, QR Code Suite) ถือว่าท่านได้อ่าน ทำความเข้าใจ และตกลงที่จะผูกพันตามข้อกำหนดและเงื่อนไขเหล่านี้ หากท่านไม่เห็นด้วยกับข้อกำหนดข้อใดข้อหนึ่ง โปรดยุติการใช้งานเว็บไซต์ทันที
          </p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {/* Section 1 */}
          <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-500" />
              <span>1. สิทธิ์การใช้งานและการให้บริการฟรี (Usage Rights)</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
              TOOL HUB ให้บริการเครื่องมือแปลงไฟล์ จัดการเอกสาร บีบอัดรูปภาพ และสร้างรหัสคิวอาร์โค้ดแก่บุคคลทั่วไป ธุรกิจ และองค์กรโดย <strong>ไม่มีค่าใช้จ่าย (100% Free)</strong> ท่านสามารถใช้งานเพื่อวัตถุประสงค์ส่วนบุคคลหรือเชิงพาณิชย์ได้อย่างเสรี โดยไม่ต้องลงทะเบียนบัญชีผู้ใช้งาน
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <ShieldCheck size={18} className="text-blue-500" />
              <span>2. กรรมสิทธิ์ในไฟล์และทรัพย์สินทางปัญญา (Your Intellectual Property)</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
              <strong>ท่านยังคงเป็นเจ้าของทรัพย์สินทางปัญญาทั้งหมดของไฟล์ที่นำมาประมวลผล 100%</strong>
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              TOOL HUB จะไม่อ้างสิทธิ์ความเป็นเจ้าของ สิทธิ์การเผยแพร่ หรือสิทธิ์ใดๆ ในเอกสาร PDF รูปภาพ หรือข้อความของท่าน เนื่องจากระบบทำงานแบบประมวลผลภายในเครื่องของผู้ใช้โดยตรง (Client-Side) ข้อมูลของท่านจึงไม่เคยผ่านหรือตกค้างอยู่ในมือของทีมงานหรือระบบคลาวด์ของเรา
            </p>
          </section>

          {/* Section 3 */}
          <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              <span>3. ข้อจำกัดความรับผิดชอบ (Disclaimer of Warranties)</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
              บริการของ TOOL HUB จัดเตรียมไว้ให้ในลักษณะ &ldquo;ตามสภาพที่เป็นอยู่&rdquo; (As-Is) และ &ldquo;ตามที่มีอยู่&rdquo; (As-Available) แม้เราจะทดสอบอัลกอริทึมและไลบรารีอย่างละเอียดถี่ถ้วน แต่เราไม่สามารถรับประกันได้ว่าการทำงานจะปราศจากข้อผิดพลาด 100% ในทุกกรณี หรือรองรับไฟล์ทุกเวอร์ชันที่มีความเสียหาย
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              TOOL HUB จะไม่รับผิดชอบต่อความเสียหายใดๆ ทั้งทางตรง ทางอ้อม หรือผลสืบเนื่องที่อาจเกิดขึ้นจากการใช้งานเครื่องมือ หรือการสูญหายของข้อมูล ดังนั้นผู้ใช้ควรสำรองไฟล์ต้นฉบับไว้เสมอก่อนการประมวลผล
            </p>
          </section>

          {/* Section 4 */}
          <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <FileText size={18} className="text-purple-500" />
              <span>4. ข้อห้ามในการใช้งาน (Prohibited Uses)</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
              ผู้ใช้ตกลงที่จะไม่กระทำการดังต่อไปนี้:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs text-slate-600 dark:text-slate-400">
              <li>พยายามโจมตี ยิงคำขอปริมาณมหาศาล (DoS/DDoS) หรือเจาะระบบโครงสร้างพื้นฐานของเว็บไซต์</li>
              <li>ใช้ระบบอัตโนมัติ (Bot / Scraper) โดยไม่ได้รับอนุญาตเพื่อดูดเนื้อหาหรือขัดขวางการให้บริการต่อผู้อื่น</li>
              <li>นำเครื่องมือไปใช้สร้างหรือเผยแพร่สิ่งผิดกฎหมาย มัลแวร์ หรือการหลอกลวง (Phishing)</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <FileText size={18} className="text-slate-500" />
              <span>5. การแก้ไขเปลี่ยนแปลงเงื่อนไข</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              TOOL HUB ขอสงวนสิทธิ์ในการแก้ไข ปรับปรุง หรือเปลี่ยนแปลงข้อกำหนดและเงื่อนไขเหล่านี้ได้ตลอดเวลา โดยจะมีผลบังคับใช้ทันทีที่ประกาศลงบนเว็บไซต์ การที่ท่านยังคงใช้งานบริการต่อไปหลังจากมีการเปลี่ยนแปลงจะถือว่าท่านยอมรับข้อกำหนดใหม่นั้น
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
