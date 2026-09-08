'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, MessageSquare, Send, CheckCircle2, ArrowLeft, Clock, ShieldAlert, Sparkles } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('feedback');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    // In static client mode, simulate instant confirmation
    setIsSubmitted(true);
  };

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
            <Mail size={15} />
            <span>ติดต่อเราและศูนย์ช่วยเหลือ • Contact & Support</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            ติดต่อทีมงาน TOOL HUB
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            เรายินดีรับฟังทุกข้อเสนอแนะ แจ้งปัญหาการใช้งาน หรือข้อสงสัยเกี่ยวกับเครื่องมือ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Contact Details Card */}
          <div className="md:col-span-1 space-y-4">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare size={18} className="text-red-600" />
                <span>ช่องทางติดต่อ</span>
              </h2>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">อีเมลติดต่อหลัก:</span>
                  <a
                    href="mailto:contact@toot-hub.com"
                    className="font-bold text-red-600 hover:underline break-all"
                  >
                    contact@toot-hub.com
                  </a>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block mb-1 flex items-center gap-1">
                    <Clock size={12} />
                    <span>เวลาการตอบกลับ:</span>
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">
                    ทีมงานจะตอบกลับภายใน 24 - 48 ชั่วโมงทำการ
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block mb-1 flex items-center gap-1">
                    <ShieldAlert size={12} />
                    <span>แจ้งปัญหาลิขสิทธิ์ / นโยบาย:</span>
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">
                    โปรดระบุหัวข้อเรื่อง &ldquo;DMCA / Privacy Inquiry&rdquo; ในช่องหัวข้อ
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 text-white text-xs leading-relaxed space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Sparkles size={16} />
                <span>ขอเครื่องมือใหม่ฟรี!</span>
              </div>
              <p className="text-slate-300">
                หากท่านต้องการเครื่องมือแปลงไฟล์หรือปรับแต่งรูปภาพแบบใดที่เว็บเรายังไม่มี สามารถพิมพ์บอกเราได้เลย เราพร้อมพัฒนาให้ฟรีครับ!
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              {isSubmitted ? (
                <div className="text-center py-10 space-y-4">
                  <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    ส่งข้อความเรียบร้อยแล้ว!
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    ขอบคุณที่ติดต่อ TOOL HUB ทีมงานได้รับข้อความของท่านแล้ว และจะตรวจสอบเพื่อนำไปปรับปรุงระบบให้ดียิ่งขึ้นครับ
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setMessage('');
                    }}
                    className="mt-4 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition"
                  >
                    ส่งข้อความอื่นเพิ่มเติม
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      ชื่อของคุณ หรือชื่อองค์กร <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="เช่น สมชาย ใจดี"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:ring-2 focus:ring-red-500 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      อีเมลของคุณ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:ring-2 focus:ring-red-500 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      หัวข้อติดต่อ
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:ring-2 focus:ring-red-500 outline-none transition"
                    >
                      <option value="feedback">ข้อเสนอแนะทั่วไป / ชื่นชม</option>
                      <option value="bug">แจ้งปัญหาการใช้งาน หรือไฟล์ทำงานผิดพลาด</option>
                      <option value="feature">เสนอแนะเครื่องมือใหม่ที่ต้องการ</option>
                      <option value="ads_partnership">ติดต่อเรื่องโฆษณา หรือความร่วมมือ</option>
                      <option value="legal">นโยบายความเป็นส่วนตัว / ลิขสิทธิ์</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      รายละเอียดข้อความ <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="พิมพ์รายละเอียดที่ท่านต้องการแจ้งให้ทีมงานทราบ..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:ring-2 focus:ring-red-500 outline-none transition resize-y"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-500/20 transition flex items-center justify-center gap-2"
                  >
                    <Send size={14} />
                    <span>ส่งข้อความถึงทีมงาน</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
