'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Search,
  Clock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Tag,
  Layers,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { BLOG_POSTS, type BlogPost } from '@/config/blog-posts';
import { Footer } from '@/components/layout/Footer';

export default function BlogListingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'ทั้งหมด' },
    { id: 'image', label: 'Image & รูปภาพ' },
    { id: 'pdf', label: 'PDF & เอกสาร' },
    { id: 'qrcode', label: 'QR Code & ธุรกิจ' },
  ];

  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      const matchCat = selectedCategory === 'all' || post.category === selectedCategory;
      const matchQuery =
        !searchQuery.trim() ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchQuery;
    });
  }, [searchQuery, selectedCategory]);

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
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-red-600 flex items-center gap-1.5 transition"
            >
              <ArrowLeft size={14} />
              <span>กลับหน้าหลัก</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Title Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 text-xs font-bold border border-red-200 dark:border-red-900 mb-4">
            <BookOpen size={15} />
            <span>ศูนย์รวมความรู้และเทคนิค • Knowledge & Tutorials</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            บทความ เทคนิค และคู่มือการใช้งานเครื่องมือ
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            รวมคำแนะนำวิธีจัดการเอกสาร PDF, การบีบอัดและแปลงรูปภาพให้เร็วขึ้น 2 เท่า, และการสร้าง QR Code รับเงินอย่างถูกต้อง
          </p>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="ค้นหาบทความ, หัวข้อ, หรือคีย์เวิร์ด..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-red-500 outline-none transition"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? 'bg-red-600 text-white shadow-sm shadow-red-500/20'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Post Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            <BookOpen size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              ไม่พบบทความที่ตรงกับคำค้นหา
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-3 text-xs text-red-600 font-semibold hover:underline"
            >
              ล้างการค้นหาทั้งหมด
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="group flex flex-col justify-between bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/5 transition duration-200"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {post.categoryName}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Clock size={13} />
                      <span>{post.readTime}</span>
                    </div>
                  </div>

                  <Link href={`/blog/${post.slug}`}>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-red-600 transition line-clamp-2 mb-2.5">
                      {post.title}
                    </h2>
                  </Link>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4">
                    {post.description}
                  </p>
                </div>

                <div>
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    {post.tags.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Read More Link */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[11px] text-slate-400">{post.date}</span>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="font-bold text-red-600 group-hover:translate-x-1 transition flex items-center gap-1"
                    >
                      <span>อ่านบทความเต็ม</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Bottom Banner to Tools */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center justify-center md:justify-start gap-1.5">
              <Zap size={15} />
              <span>เริ่มทำงานได้ทันที ไม่ต้องอ่านคู่มือ</span>
            </span>
            <h3 className="text-xl font-black">
              เครื่องมือออนไลน์ฟรีระดับมืออาชีพ พร้อมใช้งานแล้ววันนี้
            </h3>
            <p className="text-xs text-slate-300 max-w-xl">
              จัดการเอกสาร PDF, บีบอัดรูปภาพ, และสร้าง QR Code ในเครื่องของคุณเอง ปลอดภัย ไม่ต้องรอคิว
            </p>
          </div>
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-600/30 whitespace-nowrap transition flex items-center gap-2"
          >
            <span>เปิดดูเครื่องมือทั้งหมด</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </main>

      {/* Reusable Footer */}
      <Footer />
    </div>
  );
}
