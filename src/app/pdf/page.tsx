'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Sparkles, Shield, ArrowRight, CheckCircle, HelpCircle } from 'lucide-react';
import { PDF_CATEGORIES, PDF_TOOLS, type ToolCategory } from '@/config/pdf-tools';
import { DynamicIcon } from '@/components/common/DynamicIcon';

export default function PdfDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTools = useMemo(() => {
    return PDF_TOOLS.filter((tool) => {
      const matchesCategory =
        selectedCategory === 'all' || tool.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.nameTH.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const popularTools = useMemo(() => {
    return PDF_TOOLS.filter((t) => t.status === 'active').slice(0, 4);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-black bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
              TOOL HUB
            </span>
            <span className="rounded-full bg-red-100 dark:bg-red-950 px-2.5 py-0.5 text-xs font-bold text-red-600 dark:text-red-400">
              PDF SUITE
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <a
              href="#tools-section"
              className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-red-600"
            >
              เครื่องมือทั้งหมด
            </a>
            <a
              href="#faq-section"
              className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-red-600"
            >
              คำถามที่พบบ่อย
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-50 dark:bg-red-950/60 px-4 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 mb-6">
            <Sparkles size={14} />
            <span>ชุดเครื่องมือจัดการไฟล์ PDF ออนไลน์ระดับมืออาชีพ</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
            จัดการและแปลงไฟล์ PDF <br />
            <span className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 bg-clip-text text-transparent">
              ครบ จบ ปลอดภัย ในที่เดียว
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10">
            รวม แยก ลบหน้า หมุนหน้าภาพ จัดระเบียบ และแปลงไฟล์เอกสาร รวดเร็วทันใจผ่านเบราว์เซอร์ 100% ข้อมูลไม่รั่วไหล
          </p>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto relative mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาเครื่องมือ PDF เช่น รวม PDF, แยกหน้า, แปลง JPG..."
                className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-4 pl-12 pr-4 text-base shadow-lg shadow-slate-200/50 dark:shadow-none focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-100 dark:focus:ring-red-950/40"
              />
            </div>
          </div>

          {/* Quick Stats / Trust */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle size={15} className="text-emerald-500" /> ฟรี ไม่มีค่าใช้จ่ายแอบแฝง
            </span>
            <span className="flex items-center gap-1.5">
              <Shield size={15} className="text-emerald-500" /> ประมวลผลในเครื่อง ปลอดภัยสูงสุด
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles size={15} className="text-emerald-500" /> รองรับไฟล์สูงสุด 50 MB
            </span>
          </div>
        </div>
      </section>

      {/* Popular Tools Section */}
      <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                เครื่องมือยอดนิยม (Popular Tools)
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                เครื่องมือ PDF ที่มีผู้ใช้งานบ่อยที่สุด พร้อมใช้งานได้ทันที
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {popularTools.map((tool) => (
              <Link
                key={tool.id}
                href={tool.route}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 p-6 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/10 transition duration-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 group-hover:scale-110 transition duration-200">
                      <DynamicIcon name={tool.icon} size={24} />
                    </div>
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      พร้อมใช้งาน
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-red-600 transition">
                    {tool.nameTH}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                    {tool.description}
                  </p>
                </div>

                <div className="flex items-center text-xs font-bold text-red-600 dark:text-red-400 group-hover:translate-x-1 transition duration-200">
                  <span>เริ่มใช้งาน</span>
                  <ArrowRight size={14} className="ml-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Main Directory / Category Navigation */}
      <section id="tools-section" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition ${
              selectedCategory === 'all'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            เครื่องมือทั้งหมด ({PDF_TOOLS.length})
          </button>
          {PDF_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              {cat.nameTH}
            </button>
          ))}
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredTools.map((tool) => {
            const isActive = tool.status === 'active';

            const cardContent = (
              <div
                className={`relative flex flex-col justify-between h-full rounded-2xl border p-6 transition duration-200 ${
                  isActive
                    ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-red-400 hover:shadow-lg cursor-pointer'
                    : 'border-slate-200/60 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-900/40 opacity-75 cursor-default'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                        isActive
                          ? 'bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      <DynamicIcon name={tool.icon} size={22} />
                    </div>

                    {isActive ? (
                      <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                        ใช้งานได้
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                        กำลังพัฒนา
                      </span>
                    )}
                  </div>

                  <h3
                    className={`text-base font-bold mb-1.5 ${
                      isActive ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {tool.nameTH}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mb-2">
                    {tool.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-400">
                    {tool.processingMode === 'client' ? 'Client' : tool.processingMode === 'server' ? 'Server' : 'AI'}
                  </span>
                  {isActive ? (
                    <span className="font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                      เปิดใช้งาน <ArrowRight size={13} />
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">เร็วๆ นี้</span>
                  )}
                </div>
              </div>
            );

            return isActive ? (
              <Link key={tool.id} href={tool.route}>
                {cardContent}
              </Link>
            ) : (
              <div key={tool.id}>{cardContent}</div>
            );
          })}
        </div>
      </section>

      {/* Directory FAQ Section */}
      <section id="faq-section" className="py-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <HelpCircle className="mx-auto text-red-600 mb-3" size={32} />
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3">
              คำถามที่พบบ่อยเกี่ยวกับ TOOL HUB PDF Suite
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              ตอบทุกข้อสงสัยเกี่ยวกับการใช้งาน ความปลอดภัย และความเป็นส่วนตัว
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-slate-50/50 dark:bg-slate-950">
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                1. ไฟล์เอกสารของฉันจะถูกเก็บไว้ที่ไหน ปลอดภัยหรือไม่?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                สำหรับเครื่องมือในกลุ่ม Client-Side ทั้งหมด (เช่น รวม PDF, แยกหน้า, ลบหน้า, หมุนหน้า, แปลงภาพ) การประมวลผลเกิดขึ้นในเบราว์เซอร์ของเครื่องคุณโดยตรง ไฟล์ของคุณจะไม่ถูกอัปโหลดหรือบันทึกไว้ในเซิร์ฟเวอร์ใดๆ ข้อมูลจึงปลอดภัย 100%
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-slate-50/50 dark:bg-slate-950">
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                2. มีข้อจำกัดขนาดไฟล์หรือไม่?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                ปัจจุบันระบบรองรับไฟล์ขนาดสูงสุดไม่เกิน 50 MB ต่อครั้ง ซึ่งเพียงพอสำหรับเอกสาร PDF และรูปภาพทั่วไปเกือบ 100%
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-slate-50/50 dark:bg-slate-950">
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                3. สามารถใช้งานบนโทรศัพท์มือถือได้หรือไม่?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                ได้แน่นอน! TOOL HUB ออกแบบด้วย Responsive Design รองรับการใช้งานทั้งบน iPhone, Android, iPad, แท็บเล็ต และคอมพิวเตอร์อย่างราบรื่น
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-10 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 TOOL HUB. All rights reserved. ศูนย์รวมเครื่องมือออนไลน์ฟรี</p>
          <div className="flex items-center space-x-4">
            <Link href="/" className="hover:text-red-600">หน้าหลัก</Link>
            <Link href="/pdf" className="hover:text-red-600">PDF Suite</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
