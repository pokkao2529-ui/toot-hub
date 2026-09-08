import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  Clock,
  Calendar,
  User,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  Share2,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { BLOG_POSTS, getBlogPostBySlug, getRelatedBlogPosts } from '@/config/blog-posts';
import { JsonLd } from '@/components/seo/JsonLd';
import { AdBanner } from '@/components/ads/AdBanner';
import { Footer } from '@/components/layout/Footer';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: 'ไม่พบบทความ — TOOL HUB',
    };
  }

  return {
    title: `${post.title} — TOOL HUB บทความ`,
    description: post.description,
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: '2026-09-08',
      authors: [post.author],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedBlogPosts(post.id, 2);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col">
      {/* SEO Schema */}
      <JsonLd
        title={post.title}
        description={post.description}
        url={`/blog/${post.slug}`}
        faqs={post.faqs}
        article={{
          headline: post.title,
          description: post.description,
          datePublished: '2026-09-08',
          authorName: post.author,
        }}
      />

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
          <div className="flex items-center gap-4">
            <Link
              href="/blog"
              className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-red-600 flex items-center gap-1.5 transition"
            >
              <ArrowLeft size={14} />
              <span>บทความทั้งหมด</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-6">
          <Link href="/" className="hover:text-red-600 transition">
            หน้าหลัก
          </Link>
          <ChevronRight size={12} />
          <Link href="/blog" className="hover:text-red-600 transition">
            บทความ
          </Link>
          <ChevronRight size={12} />
          <span className="text-slate-900 dark:text-slate-200 truncate max-w-xs sm:max-w-md font-medium">
            {post.categoryName}
          </span>
        </nav>

        {/* Top Ad Spot */}
        <AdBanner slotId="blog-top-banner" format="horizontal" />

        {/* Article Header */}
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 dark:bg-red-950/40 text-red-600 border border-red-200 dark:border-red-900">
              {post.categoryName}
            </span>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Calendar size={13} />
              <span>{post.date}</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Clock size={13} />
              <span>ใช้เวลาอ่าน {post.readTime}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white leading-tight tracking-tight mb-4">
            {post.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            {post.description}
          </p>

          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            <User size={14} className="text-red-600" />
            <span>เขียนโดย: <strong>{post.author}</strong></span>
          </div>
        </header>

        {/* Action Callout Box to Related Tool */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/15 mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-200 flex items-center gap-1">
              <Sparkles size={13} />
              <span>เครื่องมือที่เกี่ยวข้องในบทความนี้</span>
            </span>
            <h2 className="text-base sm:text-lg font-bold mt-1 text-white">
              {post.relatedTool.name}
            </h2>
            <p className="text-xs text-rose-100 mt-0.5">
              ใช้งานฟรี 100% ประมวลผลในเครื่อง ไม่จำกัดขนาดไฟล์
            </p>
          </div>
          <Link
            href={post.relatedTool.route}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-red-600 font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>{post.relatedTool.ctaText}</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Article Body Sections */}
        <div className="space-y-10 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {post.sections.map((section, idx) => (
            <section
              key={idx}
              className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
            >
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                {section.heading}
              </h2>

              <p className="leading-relaxed">{section.content}</p>

              {section.subpoints && (
                <ul className="space-y-2 pl-2">
                  {section.subpoints.map((sub, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{sub}</span>
                    </li>
                  ))}
                </ul>
              )}

              {section.tip && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                  <Lightbulb size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block mb-0.5 font-bold">💡 เคล็ดลับน่ารู้:</strong>
                    <span>{section.tip}</span>
                  </div>
                </div>
              )}

              {section.highlightBox && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                  <strong className="text-slate-900 dark:text-white block mb-1 font-bold">
                    📌 {section.highlightBox.title}
                  </strong>
                  <p className="text-slate-600 dark:text-slate-400">
                    {section.highlightBox.description}
                  </p>
                </div>
              )}
            </section>
          ))}
        </div>

        {/* FAQs */}
        {post.faqs.length > 0 && (
          <section className="mt-12 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <HelpCircle size={20} className="text-red-600" />
              <span>คำถามที่พบบ่อย (FAQ)</span>
            </h2>
            <div className="space-y-4">
              {post.faqs.map((faq, fIdx) => (
                <div
                  key={fIdx}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                >
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mb-1.5">
                    {faq.question}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Middle Ad Spot */}
        <div className="my-10">
          <AdBanner slotId="blog-bottom-banner" format="horizontal" />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-12">
          <span className="text-xs text-slate-400 font-semibold">แท็กที่เกี่ยวข้อง:</span>
          {post.tags.map((tag, tIdx) => (
            <span
              key={tIdx}
              className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <section className="pt-8 border-t border-slate-200 dark:border-slate-800 mb-12">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <BookOpen size={18} className="text-red-600" />
              <span>บทความอื่นๆ ที่น่าสนใจ</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedPosts.map((rPost) => (
                <Link
                  key={rPost.id}
                  href={`/blog/${rPost.slug}`}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-red-500 hover:shadow-md transition group"
                >
                  <span className="text-[10px] font-bold text-slate-400 mb-1 block">
                    {rPost.categoryName} • {rPost.readTime}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-red-600 transition line-clamp-2 mb-2">
                    {rPost.title}
                  </h3>
                  <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                    อ่านต่อ <ArrowRight size={12} />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
