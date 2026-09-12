'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileText,
  ImageIcon,
  QrCode,
  BookOpen,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Layers,
  Zap,
  ArrowLeftRight,
  PenTool,
  Lock,
  Scissors,
  ImageMinus
} from 'lucide-react';
import { PDF_CATEGORIES, PDF_TOOLS } from '@/config/pdf-tools';

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 flex-shrink-0 z-50">
          <span className="text-2xl font-black bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 bg-clip-text text-transparent">
            TOOL HUB
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1 h-full">
          {/* Image Suite Menu */}
          <div 
            className="relative h-full flex items-center"
            onMouseEnter={() => setActiveMenu('image')}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition">
              <ImageIcon size={16} className={activeMenu === 'image' ? 'text-rose-600' : ''} />
              <span>Image Suite</span>
              <ChevronDown size={14} className={`transition-transform ${activeMenu === 'image' ? 'rotate-180' : ''}`} />
            </button>

            {/* Mega Menu Dropdown */}
            {activeMenu === 'image' && (
              <div className="absolute top-full left-0 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-b-xl overflow-hidden py-2">
                <Link href="/tools/image/compress" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <div className="p-2 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-lg"><Zap size={18} /></div>
                  <div><div className="text-sm font-bold">บีบอัดรูปภาพ</div><div className="text-xs text-slate-500">ลดขนาด JPG/PNG</div></div>
                </Link>
                <Link href="/tools/image/convert" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <div className="p-2 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-lg"><ArrowLeftRight size={18} /></div>
                  <div><div className="text-sm font-bold">แปลงรูปภาพ</div><div className="text-xs text-slate-500">สลับ JPG/PNG/WebP</div></div>
                </Link>
                <Link href="/tools/image/resize" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <div className="p-2 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-lg"><Layers size={18} /></div>
                  <div><div className="text-sm font-bold">ปรับขนาดรูป</div><div className="text-xs text-slate-500">ย่อขยาย/รูปติดบัตร</div></div>
                </Link>
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
                <Link href="/tools/image/remove-bg" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition relative">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg"><Scissors size={18} /></div>
                  <div>
                    <div className="text-sm font-bold flex items-center gap-2">ไดคัท / ลบพื้นหลัง <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded uppercase">New</span></div>
                    <div className="text-xs text-slate-500">ทำพื้นใส ลายเซ็น/รูปคน</div>
                  </div>
                </Link>
                <Link href="/tools/image/blur" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition relative">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg"><ImageMinus size={18} /></div>
                  <div>
                    <div className="text-sm font-bold flex items-center gap-2">เบลอ / โมเสก <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded uppercase">New</span></div>
                    <div className="text-xs text-slate-500">เซ็นเซอร์ใบหน้า/ข้อมูล</div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/tools/qrcode"
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition"
          >
            <QrCode size={16} className="text-red-600" />
            <span>QR Code Suite</span>
          </Link>
          
          <Link
            href="/blog"
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 transition"
          >
            <BookOpen size={16} className="text-amber-500" />
            <span>บทความ</span>
          </Link>

          {/* PDF Suite Menu (Mega Menu style) */}
          <div 
            className="relative h-full flex items-center"
            onMouseEnter={() => setActiveMenu('pdf')}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <Link href="/pdf" className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-red-600 dark:text-red-400 hover:text-red-700 transition">
              <FileText size={16} />
              <span>PDF Suite</span>
              <ChevronDown size={14} className={`transition-transform ${activeMenu === 'pdf' ? 'rotate-180' : ''}`} />
            </Link>

            {/* Mega Menu Dropdown for PDF */}
            {activeMenu === 'pdf' && (
              <div className="absolute top-full right-0 w-[600px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-b-xl overflow-hidden p-6">
                <div className="grid grid-cols-2 gap-6">
                  {PDF_CATEGORIES.slice(0, 4).map(category => (
                    <div key={category.id}>
                      <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                        {category.id === 'organize' && <Layers size={18} />}
                        {category.id === 'optimize' && <Zap size={18} />}
                        {category.id === 'convert' && <ArrowLeftRight size={18} />}
                        {category.id === 'edit' && <PenTool size={18} />}
                        {category.id === 'security' && <Lock size={18} />}
                        {category.nameTH}
                      </div>
                      <div className="flex flex-col space-y-2">
                        {PDF_TOOLS.filter(t => t.category === category.id && t.status === 'active').slice(0, 4).map(tool => (
                          <Link key={tool.id} href={tool.route} className="text-sm text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:underline flex items-center gap-2">
                            <ChevronRight size={12} className="text-slate-300" />
                            {tool.nameTH}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                  <Link href="/pdf" className="text-sm font-bold text-red-600 hover:text-red-700 flex items-center justify-center gap-1">
                    ดูเครื่องมือ PDF ทั้งหมด 36 รายการ <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={toggleMobileMenu}
            className="p-2 -mr-2 text-slate-600 hover:text-slate-900 focus:outline-none z-50"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full h-[calc(100vh-4rem)] bg-white dark:bg-slate-950 overflow-y-auto border-t border-slate-200 dark:border-slate-800 pb-20">
          <div className="px-4 py-6 space-y-6">
            
            <div>
              <div className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                <ImageIcon className="text-rose-600" size={20} /> Image Suite
              </div>
              <div className="grid grid-cols-1 gap-2 pl-4">
                <Link onClick={toggleMobileMenu} href="/tools/image/compress" className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-700 dark:text-slate-300 font-medium text-sm flex items-center gap-3"><Zap size={16} className="text-rose-500" /> บีบอัดรูปภาพ</Link>
                <Link onClick={toggleMobileMenu} href="/tools/image/convert" className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-700 dark:text-slate-300 font-medium text-sm flex items-center gap-3"><ArrowLeftRight size={16} className="text-rose-500" /> แปลงรูปภาพ</Link>
                <Link onClick={toggleMobileMenu} href="/tools/image/resize" className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-700 dark:text-slate-300 font-medium text-sm flex items-center gap-3"><Layers size={16} className="text-rose-500" /> ปรับขนาดรูปภาพ</Link>
                <Link onClick={toggleMobileMenu} href="/tools/image/remove-bg" className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-700 dark:text-amber-400 font-medium text-sm flex items-center gap-3"><Scissors size={16} /> ไดคัท / ลบพื้นหลัง <span className="ml-auto text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded">NEW</span></Link>
                <Link onClick={toggleMobileMenu} href="/tools/image/blur" className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-700 dark:text-amber-400 font-medium text-sm flex items-center gap-3"><ImageMinus size={16} /> เบลอ / โมเสก <span className="ml-auto text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded">NEW</span></Link>
              </div>
            </div>

            <div>
              <Link onClick={toggleMobileMenu} href="/tools/qrcode" className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                <QrCode className="text-red-600" size={20} /> QR Code Suite
              </Link>
            </div>

            <div>
              <div className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                <FileText className="text-red-600" size={20} /> PDF Suite
              </div>
              <div className="grid grid-cols-2 gap-2 pl-4">
                {PDF_TOOLS.filter(t => t.status === 'active').slice(0, 8).map(tool => (
                  <Link key={tool.id} onClick={toggleMobileMenu} href={tool.route} className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-600 dark:text-slate-400 text-xs flex items-center gap-2 truncate">
                    <ChevronRight size={12} className="text-slate-400 shrink-0" />
                    <span className="truncate">{tool.nameTH}</span>
                  </Link>
                ))}
              </div>
              <div className="mt-3 pl-4">
                <Link onClick={toggleMobileMenu} href="/pdf" className="inline-flex items-center gap-1 text-sm font-bold text-red-600">
                  ดู PDF Tools ทั้งหมด <ChevronRight size={16} />
                </Link>
              </div>
            </div>

            <div>
              <Link onClick={toggleMobileMenu} href="/blog" className="font-bold text-lg flex items-center gap-2 text-slate-900 dark:text-white">
                <BookOpen className="text-amber-500" size={20} /> บทความ / Blog
              </Link>
            </div>

          </div>
        </div>
      )}
    </header>
  );
}
