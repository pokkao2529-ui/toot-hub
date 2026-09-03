'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, ShieldCheck, Zap, Lock, HelpCircle } from 'lucide-react';
import { type PdfToolDefinition, PDF_CATEGORIES, getToolsByCategory } from '@/config/pdf-tools';
import { DynamicIcon } from '@/components/common/DynamicIcon';

interface PdfToolLayoutProps {
  tool: PdfToolDefinition;
  currentStep: 1 | 2 | 3;
  faqs?: { question: string; answer: string }[];
  children: React.ReactNode;
}

export const PdfToolLayout: React.FC<PdfToolLayoutProps> = ({
  tool,
  currentStep,
  faqs,
  children,
}) => {
  const categoryInfo = PDF_CATEGORIES.find((c) => c.id === tool.category);
  const relatedTools = getToolsByCategory(tool.category).filter((t) => t.id !== tool.id).slice(0, 4);

  const defaultFaqs = [
    {
      question: `บริการ ${tool.nameTH} เสียค่าใช้จ่ายหรือไม่?`,
      answer: `บริการ ${tool.nameTH} บน TOOL HUB ให้บริการฟรี 100% ไม่มีลายน้ำ และไม่ต้องสมัครสมาชิกสำหรับการใช้งานทั่วไป`,
    },
    {
      question: 'เอกสารของฉันปลอดภัยหรือไม่ มีการส่งข้อมูลขึ้นเซิร์ฟเวอร์หรือไม่?',
      answer: 'เครื่องมือนี้ประมวลผลบนเบราว์เซอร์ของเครื่องคุณโดยตรง (Client-side Processing) ไฟล์ของคุณจะไม่ถูกอัปโหลดหรือส่งไปยังเซิร์ฟเวอร์ภายนอก มั่นใจได้ในความปลอดภัยของข้อมูลลับและเอกสารสำคัญ',
    },
    {
      question: `สามารถอัปโหลดไฟล์ขนาดใหญ่ได้สูงสุดเท่าไร?`,
      answer: `ระบบรองรับขนาดไฟล์สูงสุด ${Math.round(tool.maxFileSize / (1024 * 1024))} MB ต่อครั้ง และสูงสุด ${tool.maxFiles} ไฟล์พร้อมกัน`,
    },
  ];

  const displayFaqs = faqs && faqs.length > 0 ? faqs : defaultFaqs;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-black bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                TOOL HUB
              </span>
            </Link>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <Link
              href="/pdf"
              className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-red-600 transition"
            >
              PDF Suite
            </Link>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[150px] sm:max-w-none">
              {tool.nameTH}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/pdf"
              className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-red-600 transition px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            >
              ดูเครื่องมือ PDF ทั้งหมด
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Tool Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 mb-4 shadow-sm">
            <DynamicIcon name={tool.icon} size={32} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            {tool.nameTH} ({tool.name})
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-4">
            {tool.description}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck size={14} />
              <span>ประมวลผลบนเครื่อง (Client-Side) ปลอดภัย 100%</span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/40 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              <Zap size={14} />
              <span>ฟรี ไม่มีลายน้ำ</span>
            </span>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="max-w-xl mx-auto mb-10">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-slate-800 -z-0" />
            {[
              { num: 1, label: 'เลือกไฟล์' },
              { num: 2, label: 'ปรับแต่ง' },
              { num: 3, label: 'ดาวน์โหลด' },
            ].map((step) => {
              const isActive = currentStep === step.num;
              const isCompleted = currentStep > step.num;
              return (
                <div key={step.num} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? 'bg-red-600 text-white ring-4 ring-red-100 dark:ring-red-950/60'
                        : isCompleted
                        ? 'bg-green-600 text-white'
                        : 'bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    {step.num}
                  </div>
                  <span
                    className={`mt-1.5 text-xs font-medium ${
                      isActive
                        ? 'text-red-600 font-bold'
                        : isCompleted
                        ? 'text-green-600'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tool Interaction Workspace */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm mb-12">
          {children}
        </div>

        {/* Security & Privacy Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 flex-shrink-0">
              <Lock size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">ความปลอดภัยสูงสุด</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ไฟล์ทั้งหมดประมวลผลผ่านหน่วยความจำของเครื่องคุณโดยตรง ไม่มีการส่งต่อข้อมูลไปยังเซิร์ฟเวอร์ใดๆ
              </p>
            </div>
          </div>
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex-shrink-0">
              <Zap size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">รวดเร็วทันใจ</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ไม่ต้องรอคิวอัปโหลดและดาวน์โหลดไฟล์ขนาดใหญ่ ทำงานได้ทันทีผ่าน WebAssembly และ Canvas
              </p>
            </div>
          </div>
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex-shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">มาตรฐานมืออาชีพ</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                คงความคมชัด รูปแบบฟอนต์ และโครงสร้างเอกสารตามมาตรฐาน PDF อย่างสมบูรณ์แบบ
              </p>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <section className="mb-16">
          <div className="flex items-center space-x-2 mb-6">
            <HelpCircle className="text-red-600" size={24} />
            <h2 className="text-2xl font-bold">คำถามที่พบบ่อย (FAQ)</h2>
          </div>

          <div className="space-y-3">
            {displayFaqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm"
              >
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2">
                  {faq.question}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Related Tools */}
        {relatedTools.length > 0 && (
          <section className="mb-12">
            <h3 className="text-xl font-bold mb-4">เครื่องมืออื่นในหมวด {categoryInfo?.nameTH || 'นี้'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedTools.map((t) => (
                <Link
                  key={t.id}
                  href={t.status === 'active' ? t.route : '#'}
                  className={`p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition ${
                    t.status === 'active'
                      ? 'hover:border-red-400 hover:shadow-md cursor-pointer'
                      : 'opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-2 text-red-600">
                    <DynamicIcon name={t.icon} size={20} />
                    <span className="text-sm font-bold">{t.nameTH}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {t.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 TOOL HUB — ชุดเครื่องมือ PDF ออนไลน์ครบวงจร ปลอดภัย รวดเร็ว และฟรี</p>
          <div className="flex items-center space-x-4">
            <Link href="/pdf" className="hover:text-red-600">เครื่องมือทั้งหมด</Link>
            <Link href="/" className="hover:text-red-600">หน้าหลัก</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
