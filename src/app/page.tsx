import React from 'react';
import Link from 'next/link';
import {
  FileText,
  Sparkles,
  Shield,
  Zap,
  ArrowRight,
  Layers,
  CheckCircle,
  FileCheck,
} from 'lucide-react';
import { PDF_TOOLS } from '@/config/pdf-tools';

export default function HomePage() {
  const activeTools = PDF_TOOLS.filter((t) => t.status === 'active');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-black bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 bg-clip-text text-transparent">
              TOOL HUB
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/pdf"
              className="text-sm font-bold text-red-600 dark:text-red-400 hover:text-red-700 flex items-center gap-1"
            >
              <span>PDF Suite</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="pt-16 pb-20 sm:pt-24 sm:pb-32 px-4 sm:px-6 text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-50 dark:bg-red-950/60 px-4 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 mb-6">
            <Sparkles size={14} />
            <span>ศูนย์รวมเครื่องมือเว็บแอปพลิเคชันออนไลน์ฟรี</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-6">
            เครื่องมือทำงานออนไลน์ที่ <br />
            <span className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 bg-clip-text text-transparent">
              รวดเร็ว ปลอดภัย และฟรี
            </span>
          </h1>

          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10">
            แพลตฟอร์มศูนย์รวมเครื่องมือจัดการเอกสาร ไฟล์ และระบบอัจฉริยะ ใช้งานง่ายบนทุกอุปกรณ์ ประมวลผลบนเบราว์เซอร์ 100%
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/pdf"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-base shadow-lg shadow-red-500/25 transition flex items-center justify-center gap-2"
            >
              <FileText size={20} />
              <span>เข้าสู่ PDF Suite ({PDF_TOOLS.length} เครื่องมือ)</span>
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle size={16} className="text-emerald-500" /> ไม่ต้องติดตั้งโปรแกรม
            </span>
            <span className="flex items-center gap-1.5">
              <Shield size={16} className="text-emerald-500" /> ข้อมูลไม่ถูกส่งออกนอกเครื่อง
            </span>
            <span className="flex items-center gap-1.5">
              <Zap size={16} className="text-emerald-500" /> ความเร็วระดับ WebAssembly
            </span>
          </div>
        </section>

        {/* Featured Suite: PDF */}
        <section className="py-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
              <div>
                <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
                  Featured Module
                </span>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                  PDF Suite — เครื่องมือจัดการเอกสาร PDF
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  รวม แยก ตัด หมุน จัดเรียง และแปลงไฟล์เอกสาร PDF ทันใจในคลิกเดียว
                </p>
              </div>

              <Link
                href="/pdf"
                className="mt-4 md:mt-0 text-sm font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <span>ดูทั้งหมด {PDF_TOOLS.length} เครื่องมือ</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {activeTools.map((tool) => (
                <Link
                  key={tool.id}
                  href={tool.route}
                  className="group p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/10 transition"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center font-bold">
                      <FileCheck size={20} />
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900">
                      พร้อมใช้งาน
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-red-600 transition mb-1">
                    {tool.nameTH}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                    {tool.description}
                  </p>
                  <div className="flex items-center text-xs font-bold text-red-600">
                    <span>เปิดใช้งาน</span>
                    <ArrowRight size={13} className="ml-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-8 text-center text-xs text-slate-500">
        <p>© 2026 TOOL HUB. ศูนย์รวมเครื่องมือออนไลน์ฟรี</p>
      </footer>
    </div>
  );
}
