import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Sparkles, ShieldCheck, Zap, Heart, Layers, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'เกี่ยวกับเรา (About Us) — TOOL HUB',
  description: 'เรื่องราวและพันธกิจของ TOOL HUB ศูนย์รวมเครื่องมือออนไลน์ฟรี ปลอดภัย ไม่เก็บข้อมูล และทำงานด้วยเทคโนโลยี Client-Side ที่ทันสมัยที่สุด',
};

export default function AboutPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 text-xs font-bold border border-rose-200 dark:border-rose-900 mb-4">
            <Heart size={15} />
            <span>เรื่องราวและเป้าหมายของเรา • Our Mission</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            เกี่ยวกับ TOOL HUB
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            สร้างสรรค์เครื่องมือดิจิทัลที่รวดเร็ว ปลอดภัย และทุกคนเข้าถึงได้ฟรีอย่างแท้จริง
          </p>
        </div>

        {/* Story Section */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm mb-12 space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            ทำไมเราถึงสร้าง TOOL HUB?
          </h2>
          <p>
            ในยุคปัจจุบัน ไม่ว่าจะเป็นนักเรียน นักศึกษา ฟรีแลนซ์ พนักงานออฟฟิศ หรือเจ้าของธุรกิจ ทุกคนจำเป็นต้องจัดการเอกสาร PDF, ย่อขนาดรูปภาพเพื่อส่งงาน, แปลงไฟล์ภาพลงเว็บไซต์ หรือสร้าง QR Code สำหรับรับเงินและเข้าสู่เว็บไซต์อยู่เสมอ
          </p>
          <p>
            แต่ปัญหาที่ผู้ใช้งานส่วนใหญ่ต้องเผชิญกับเว็บแปลงไฟล์เดิมๆ คือ:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-xs text-red-900 dark:text-red-300">
              ❌ <strong>จำกัดจำนวนไฟล์:</strong> แปลงได้แค่วันละ 2 ไฟล์ ถ้าอยากทำเพิ่มต้องจ่ายเงินรายเดือน
            </div>
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-xs text-red-900 dark:text-red-300">
              ❌ <strong>ต้องต่อคิวเซิร์ฟเวอร์:</strong> ไฟล์ต้องอัปโหลดขึ้นคลาวด์ รอนาน และสิ้นเปลืองเน็ต
            </div>
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-xs text-red-900 dark:text-red-300">
              ❌ <strong>ความเสี่ยงเรื่องข้อมูลรั่วไหล:</strong> สัญญา เอกสารราชการ หรือรูปส่วนตัวหลุดไปอยู่บนเซิร์ฟเวอร์ผู้อื่น
            </div>
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-xs text-red-900 dark:text-red-300">
              ❌ <strong>โฆษณาบังจอหรือหลอกให้กด:</strong> มีหน้าต่างป๊อปอัปหลอกลวงเสี่ยงติดไวรัส
            </div>
          </div>
          <p>
            <strong>TOOL HUB จึงถือกำเนิดขึ้นมาเพื่อปฏิวัติสิ่งเหล่านี้!</strong> เราสร้างแพลตฟอร์มเครื่องมือยูทิลิตี้ที่ขับเคลื่อนด้วยเทคโนโลยี Client-Side ยุคใหม่ ให้คุณจัดการทุกอย่างได้ในเครื่องของคุณเอง ปลอดภัย ไม่ต้องรอคิว และใช้งานได้ฟรีไม่จำกัดจำนวนครั้ง
          </p>
        </div>

        {/* 3 Core Pillars */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-8">
            3 เสาหลักที่เรายึดมั่น
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
              <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={24} />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                1. ความเป็นส่วนตัว 100%
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                ไฟล์เอกสารและรูปภาพของคุณไม่เคยเดินทางออกจากอุปกรณ์ของคุณ ประมวลผลในเบราว์เซอร์อย่างสมบูรณ์แบบ
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
              <div className="h-12 w-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center mx-auto mb-4">
                <Zap size={24} />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                2. เร็วทะลุขีดจำกัด
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                ไม่มีการอัปโหลดหรือดาวน์โหลดผ่านอินเทอร์เน็ตที่ช้า ทุกอย่างเสร็จสิ้นในเสี้ยววินาทีด้วยพลังของซีพียูเครื่องคุณ
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
              <div className="h-12 w-12 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center mx-auto mb-4">
                <Sparkles size={24} />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                3. ฟรีและไม่มีเงื่อนไข
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                ไม่มีการบังคับสมัครสมาชิก ไม่ต้องกรอกบัตรเครดิต ไม่มีจำกัดจำนวนไฟล์ต่อวัน ให้ทุกคนเข้าถึงเครื่องมือคุณภาพสูงได้อย่างเท่าเทียม
              </p>
            </div>
          </div>
        </div>

        {/* Current Suites Overview */}
        <div className="p-8 rounded-3xl bg-slate-900 text-white mb-12">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Layers size={22} className="text-red-500" />
            <span>ชุดเครื่องมือที่เปิดให้บริการในปัจจุบัน</span>
          </h2>
          <div className="space-y-4 text-xs text-slate-300">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">PDF Suite:</strong> มีเครื่องมือจัดการเอกสารครบวงจรกว่า 11 เครื่องมือ เช่น รวมไฟล์, แยกหน้า, ตัดส่วน, หมุนเอกสาร, จัดลำดับ, แปลง JPG ↔ PDF, ใส่ลายน้ำ, และใส่เลขหน้า
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Image Suite:</strong> บีบอัดภาพ (Compress) ลดขนาดไฟล์ได้ถึง 90%, และโปรแกรมแปลงภาพ (Convert) รองรับ JPG, PNG, WebP พร้อมดาวน์โหลดเป็น ZIP รวม
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">QR Code Suite:</strong> ตัวสร้าง QR Code หลากหลายรูปแบบ รองรับ URL, พร้อมเพย์ EMVCo 🇹🇭, Wi-Fi, และนามบัตร vCard คมชัดสูงระดับเวกเตอร์ SVG
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
            พร้อมเริ่มใช้งานเครื่องมือหรือยัง?
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            เริ่มแปลงไฟล์ บีบอัดภาพ หรือสร้าง QR Code ได้ทันทีในคลิกเดียว
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-500/20 transition flex items-center gap-1.5"
            >
              <span>สำรวจเครื่องมือทั้งหมด</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/contact"
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition"
            >
              ติดต่อพูดคุยกับเรา
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
