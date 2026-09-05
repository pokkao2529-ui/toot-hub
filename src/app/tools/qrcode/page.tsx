'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  QrCode,
  Link as LinkIcon,
  Wifi,
  FileText,
  User,
  Download,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  Image as ImageIcon,
  RotateCcw,
  Palette,
  CreditCard,
  Eye,
  CheckCircle2,
  AlertCircle,
  Smartphone,
} from 'lucide-react';
import {
  renderQRCodeToCanvas,
  generateQRCodeSVG,
  downloadDataUrl,
  downloadBlob,
  generatePromptPayPayload,
} from '@/services/qrcode';
import { AdBanner } from '@/components/ads/AdBanner';
import { JsonLd } from '@/components/seo/JsonLd';

type QRType = 'url' | 'promptpay' | 'wifi' | 'text' | 'vcard';

const COLOR_PRESETS = [
  { name: 'คลาสสิก', dark: '#000000', light: '#ffffff' },
  { name: 'ทูลฮับ แดง', dark: '#dc2626', light: '#ffffff' },
  { name: 'น้ำเงินธุรกิจ', dark: '#1d4ed8', light: '#ffffff' },
  { name: 'เขียวมรกต', dark: '#059669', light: '#ffffff' },
  { name: 'ม่วงพรีเมียม', dark: '#7c3aed', light: '#ffffff' },
  { name: 'ดาร์กโหมด', dark: '#f8fafc', light: '#0f172a' },
];

export default function QRCodeGeneratorPage() {
  const [qrType, setQrType] = useState<QRType>('url');

  // Input states
  const [url, setUrl] = useState('https://toot-glawawfah-pokkao2529-7498.vercel.app');
  const [promptPayTarget, setPromptPayTarget] = useState('');
  const [promptPayAmount, setPromptPayAmount] = useState('');
  const [promptPayError, setPromptPayError] = useState('');

  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiEncryption, setWifiEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [wifiHidden, setWifiHidden] = useState(false);

  const [text, setText] = useState('');

  const [vcardName, setVcardName] = useState('');
  const [vcardPhone, setVcardPhone] = useState('');
  const [vcardEmail, setVcardEmail] = useState('');
  const [vcardOrg, setVcardOrg] = useState('');

  // Styling states
  const [colorDark, setColorDark] = useState('#000000');
  const [colorLight, setColorLight] = useState('#ffffff');
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoSizePercent, setLogoSizePercent] = useState(22);
  const [downloadResolution, setDownloadResolution] = useState(1024);

  // Status states
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Compute final payload string based on current tab
  const getPayload = useCallback((): string => {
    switch (qrType) {
      case 'url':
        return url.trim() || 'https://';
      case 'promptpay':
        if (!promptPayTarget.trim()) return '';
        try {
          const amt = promptPayAmount ? parseFloat(promptPayAmount) : undefined;
          return generatePromptPayPayload({
            target: promptPayTarget.trim(),
            amount: amt && !isNaN(amt) && amt > 0 ? amt : undefined,
          });
        } catch (err: any) {
          return '';
        }
      case 'wifi':
        if (!wifiSsid.trim()) return '';
        return `WIFI:S:${wifiSsid};T:${wifiEncryption};P:${wifiPassword};H:${wifiHidden ? 'true' : 'false'};;`;
      case 'text':
        return text.trim();
      case 'vcard':
        if (!vcardName.trim() && !vcardPhone.trim()) return '';
        return `BEGIN:VCARD\nVERSION:3.0\nN:${vcardName}\nFN:${vcardName}\nORG:${vcardOrg}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nEND:VCARD`;
      default:
        return '';
    }
  }, [
    qrType,
    url,
    promptPayTarget,
    promptPayAmount,
    wifiSsid,
    wifiPassword,
    wifiEncryption,
    wifiHidden,
    text,
    vcardName,
    vcardPhone,
    vcardEmail,
    vcardOrg,
  ]);

  // Live render to canvas
  useEffect(() => {
    const payload = getPayload();
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (qrType === 'promptpay' && promptPayTarget.trim()) {
      try {
        const amt = promptPayAmount ? parseFloat(promptPayAmount) : undefined;
        generatePromptPayPayload({
          target: promptPayTarget.trim(),
          amount: amt && !isNaN(amt) && amt > 0 ? amt : undefined,
        });
        setPromptPayError('');
      } catch (err: any) {
        setPromptPayError(err.message || 'เบอร์หรือเลขบัตรประชาชนไม่ถูกต้อง');
      }
    } else {
      setPromptPayError('');
    }

    setIsGenerating(true);
    renderQRCodeToCanvas(canvas, {
      text: payload || 'https://toot-hub.com',
      width: 400,
      margin: 2,
      colorDark,
      colorLight,
      logoDataUrl,
      logoSizePercent,
      errorCorrectionLevel: logoDataUrl ? 'H' : 'M',
    }).finally(() => {
      setIsGenerating(false);
    });
  }, [getPayload, colorDark, colorLight, logoDataUrl, logoSizePercent, qrType, promptPayTarget, promptPayAmount]);

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setLogoDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Download High-Res PNG
  const handleDownloadPNG = async () => {
    const payload = getPayload();
    if (!payload) return;

    // Create an offscreen canvas with target high-res width
    const exportCanvas = document.createElement('canvas');
    await renderQRCodeToCanvas(exportCanvas, {
      text: payload,
      width: downloadResolution,
      margin: 2,
      colorDark,
      colorLight,
      logoDataUrl,
      logoSizePercent,
      errorCorrectionLevel: 'H',
    });

    const dataUrl = exportCanvas.toDataURL('image/png');
    downloadDataUrl(dataUrl, `qrcode-toolhub-${Date.now()}.png`);
  };

  // Download SVG
  const handleDownloadSVG = async () => {
    const payload = getPayload();
    if (!payload) return;

    const svgString = await generateQRCodeSVG(payload, {
      colorDark,
      colorLight,
      margin: 2,
    });
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    downloadBlob(blob, `qrcode-toolhub-${Date.now()}.svg`);
  };

  // Copy to Clipboard
  const handleCopy = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  const currentPayload = getPayload();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <JsonLd
        title="สร้าง QR Code ฟรี ไม่มีวันหมดอายุ — TOOL HUB"
        description="เครื่องมือสร้าง QR Code ออนไลน์ฟรี รองรับลิงก์ URL, พร้อมเพย์ (PromptPay), Wi-Fi, และฝังโลโก้ตรงกลาง ความละเอียดสูง ไม่จำกัดครั้ง"
        url="/tools/qrcode"
      />

      {/* Header */}
      <header className="w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-2xl font-black bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 bg-clip-text text-transparent">
              TOOL HUB
            </Link>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <QrCode size={18} className="text-red-600" />
              <span>QR Code Suite</span>
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/pdf"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              📄 ไปที่ PDF Suite
            </Link>
          </div>
        </div>
      </header>

      {/* Top Banner Ad Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-4">
        <AdBanner slotId="top-banner-qrcode" format="horizontal" />
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Title Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-4 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 mb-3">
            <ShieldCheck size={14} />
            <span>ฟรีตลอดชีพ ไม่มีวันหมดอายุ • สแกนได้ไม่จำกัด</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-3">
            สร้าง QR Code ออนไลน์ ฟรี คมชัดระดับ HD
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            แปลงลิงก์ URL, สร้างคิวอาร์โค้ดพร้อมเพย์รับเงิน, สแกนต่อ Wi-Fi และฝังรูปโลโก้ตรงกลาง ดาวน์โหลดไฟล์ PNG หรือ SVG ไปใช้งานได้ทันที
          </p>
        </div>

        {/* Studio Grid (Controls on Left, Live Preview on Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Generator Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Type Selector Tabs */}
            <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap gap-1">
              {[
                { id: 'url', label: 'ลิงก์ URL', icon: LinkIcon },
                { id: 'promptpay', label: 'พร้อมเพย์ 🇹🇭', icon: CreditCard },
                { id: 'wifi', label: 'ต่อ Wi-Fi', icon: Wifi },
                { id: 'text', label: 'ข้อความ', icon: FileText },
                { id: 'vcard', label: 'นามบัตร vCard', icon: User },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = qrType === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setQrType(tab.id as QRType)}
                    className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition ${
                      active
                        ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon size={15} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* 2. Type Specific Inputs */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              {/* Tab: URL */}
              {qrType === 'url' && (
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    ระบุลิงก์เว็บไซต์ หรือ URL
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <LinkIcon size={16} />
                    </div>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://yourwebsite.com หรือลิงก์เพจ/แผนที่"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    💡 รองรับทั้งลิงก์เว็บไซต์, Google Drive, แผนที่ Google Maps, เพจ Facebook, IG, LINE
                  </p>
                </div>
              )}

              {/* Tab: PromptPay */}
              {qrType === 'promptpay' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      เบอร์มือถือ หรือ เลขบัตรประชาชน (13 หลัก)
                    </label>
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      มาตรฐาน EMVCo ธนาคารไทย
                    </span>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Smartphone size={16} />
                    </div>
                    <input
                      type="text"
                      value={promptPayTarget}
                      onChange={(e) => setPromptPayTarget(e.target.value)}
                      placeholder="เช่น 0812345678 หรือ 1100400123456"
                      className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border rounded-xl text-sm focus:outline-none focus:ring-2 ${
                        promptPayError
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-slate-200 dark:border-slate-800 focus:ring-red-500'
                      }`}
                    />
                  </div>

                  {promptPayError && (
                    <div className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
                      <AlertCircle size={14} />
                      <span>{promptPayError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      ระบุจำนวนเงิน (บาท) — ไม่บังคับ
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={promptPayAmount}
                      onChange={(e) => setPromptPayAmount(e.target.value)}
                      placeholder="เช่น 150.00 (เว้นว่างไว้หากต้องการให้ผู้โอนระบุเอง)"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              )}

              {/* Tab: Wi-Fi */}
              {qrType === 'wifi' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      ชื่อสัญญาณ Wi-Fi (SSID)
                    </label>
                    <input
                      type="text"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      placeholder="เช่น MyHome_WiFi หรือ CoffeeShop_Guest"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      รหัสผ่าน Wi-Fi
                    </label>
                    <input
                      type="text"
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      placeholder="ใส่รหัสผ่าน Wi-Fi"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">ความปลอดภัย</label>
                      <select
                        value={wifiEncryption}
                        onChange={(e) => setWifiEncryption(e.target.value as any)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                      >
                        <option value="WPA">WPA / WPA2 / WPA3 (ทั่วไป)</option>
                        <option value="WEP">WEP</option>
                        <option value="nopass">ไม่มีรหัสผ่าน (เปิดสาธารณะ)</option>
                      </select>
                    </div>

                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                        <input
                          type="checkbox"
                          checked={wifiHidden}
                          onChange={(e) => setWifiHidden(e.target.checked)}
                          className="rounded text-red-600 focus:ring-red-500"
                        />
                        <span>เป็นเครือข่ายที่ซ่อนชื่อ (Hidden)</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Text */}
              {qrType === 'text' && (
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    ข้อความทั่วไป
                  </label>
                  <textarea
                    rows={4}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="พิมพ์ข้อความ รหัสโค้ด หรือบันทึกที่คุณต้องการบรรจุลงใน QR Code..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              )}

              {/* Tab: vCard */}
              {qrType === 'vcard' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      ชื่อ - นามสกุล
                    </label>
                    <input
                      type="text"
                      value={vcardName}
                      onChange={(e) => setVcardName(e.target.value)}
                      placeholder="เช่น สมชาย ใจดี"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      เบอร์โทรศัพท์
                    </label>
                    <input
                      type="tel"
                      value={vcardPhone}
                      onChange={(e) => setVcardPhone(e.target.value)}
                      placeholder="0812345678"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      อีเมล
                    </label>
                    <input
                      type="email"
                      value={vcardEmail}
                      onChange={(e) => setVcardEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      ชื่อบริษัท / องค์กร
                    </label>
                    <input
                      type="text"
                      value={vcardOrg}
                      onChange={(e) => setVcardOrg(e.target.value)}
                      placeholder="ชื่อบริษัทหรือแผนก"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 3. Custom Styling (Colors & Logo) */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <Palette size={18} className="text-red-600" />
                <span>ปรับแต่งสีสันและใส่รูปโลโก้</span>
              </div>

              {/* Color Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">ชุดสีสำเร็จรูป</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => {
                        setColorDark(preset.dark);
                        setColorLight(preset.light);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium hover:border-red-500 transition"
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10"
                        style={{ backgroundColor: preset.dark }}
                      />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Color Pickers */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">สีตัว QR Code</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={colorDark}
                      onChange={(e) => setColorDark(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700 bg-transparent p-0.5"
                    />
                    <input
                      type="text"
                      value={colorDark}
                      onChange={(e) => setColorDark(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">สีพื้นหลัง</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={colorLight}
                      onChange={(e) => setColorLight(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700 bg-transparent p-0.5"
                    />
                    <input
                      type="text"
                      value={colorLight}
                      onChange={(e) => setColorLight(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Logo / Icon Upload */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    🖼️ ฝังโลโก้ / รูปภาพตรงกลาง
                  </label>
                  {logoDataUrl && (
                    <button
                      onClick={() => setLogoDataUrl(null)}
                      className="text-xs text-red-600 hover:text-red-700 font-semibold"
                    >
                      ลบโลโก้ออก
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-red-500 bg-slate-50 dark:bg-slate-950 text-xs font-semibold flex items-center gap-2 transition"
                  >
                    <ImageIcon size={16} />
                    <span>{logoDataUrl ? 'เปลี่ยนรูปโลโก้' : 'อัปโหลดรูปภาพ / โลโก้ (PNG, JPG, SVG)'}</span>
                  </button>

                  {logoDataUrl && (
                    <div className="h-10 w-10 rounded-lg border border-slate-200 dark:border-slate-800 p-1 bg-white flex items-center justify-center overflow-hidden">
                      <img src={logoDataUrl} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  ระบบจะปรับระดับความถูกต้อง (Error Correction: High) ให้อัตโนมัติเพื่อให้สแกนติดง่าย 100%
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Live Preview & Download Card (5 cols) */}
          <div className="lg:col-span-5 sticky top-24 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none text-center">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  ตัวอย่างผลลัพธ์ (Live Preview)
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                  <CheckCircle2 size={13} />
                  <span>พร้อมใช้งาน</span>
                </span>
              </div>

              {/* Canvas Preview Container */}
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 inline-flex items-center justify-center mx-auto mb-6 shadow-inner">
                <canvas
                  ref={canvasRef}
                  className="max-w-full h-auto rounded-lg shadow-sm"
                  style={{ width: '280px', height: '280px' }}
                />
              </div>

              {/* Resolution Selector */}
              <div className="flex items-center justify-between text-xs font-semibold mb-4 px-2">
                <span className="text-slate-500">ความละเอียดไฟล์ดาวน์โหลด:</span>
                <select
                  value={downloadResolution}
                  onChange={(e) => setDownloadResolution(Number(e.target.value))}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium border-0 focus:ring-1 focus:ring-red-500"
                >
                  <option value={512}>512 x 512 px (โซเชียล)</option>
                  <option value={1024}>1024 x 1024 px (คมชัดสูง HD)</option>
                  <option value={2048}>2048 x 2048 px (Ultra HD ป้ายไวนิล)</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  onClick={handleDownloadPNG}
                  disabled={!currentPayload}
                  className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-red-500/20 transition flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  <span>ดาวน์โหลดภาพ PNG ({downloadResolution}px)</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleDownloadSVG}
                    disabled={!currentPayload}
                    className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Download size={15} />
                    <span>ไฟล์เวกเตอร์ SVG</span>
                  </button>

                  <button
                    onClick={handleCopy}
                    disabled={!currentPayload}
                    className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    {copied ? (
                      <>
                        <Check size={15} className="text-emerald-500" />
                        <span className="text-emerald-600">คัดลอกแล้ว!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={15} />
                        <span>คัดลอกรูปภาพ</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Privacy Notice */}
              <p className="text-[11px] text-slate-400 mt-4 flex items-center justify-center gap-1">
                <ShieldCheck size={13} className="text-emerald-500" />
                <span>สร้างในเครื่องคุณทันที ไม่มีการบันทึกข้อมูลลงเซิร์ฟเวอร์</span>
              </p>
            </div>

            {/* AdSense Placement: High CTR Box below Download */}
            <AdBanner slotId="qrcode-download-rect" format="rectangle" />
          </div>
        </div>

        {/* SEO & FAQ Section */}
        <section className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-800 max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 text-center">
            คำถามที่พบบ่อยเกี่ยวกับการสร้าง QR Code (FAQ)
          </h2>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
                <HelpCircle size={16} className="text-red-600" />
                <span>QR Code ที่สร้างจาก TOOL HUB มีวันหมดอายุหรือไม่?</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                ไม่มีวันหมดอายุเด็ดขาด! QR Code ที่สร้างจาก TOOL HUB เป็นประเภท Static QR Code ข้อมูลทั้งหมดจะถูกเข้ารหัสลงไปในตัวภาพโค้ดโดยตรง สามารถสแกนได้ตลอดชีพ ไม่จำกัดจำนวนครั้ง และไม่มีการเก็บเงินย้อนหลัง
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
                <HelpCircle size={16} className="text-red-600" />
                <span>QR Code พร้อมเพย์ (PromptPay) ปลอดภัยหรือไม่ สามารถสแกนจ่ายได้ทุกธนาคารไหม?</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                ปลอดภัย 100% เพราะระบบของเราคำนวณรหัสตามมาตรฐานสากล EMVCo ของธนาคารแห่งประเทศไทยอย่างถูกต้อง สามารถใช้แอปพลิเคชันของทุกธนาคารในไทยสแกนเพื่อโอนเงินได้ทันที และข้อมูลของคุณจะไม่ถูกส่งไปยังเซิร์ฟเวอร์ใดๆ
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
                <HelpCircle size={16} className="text-red-600" />
                <span>การใส่รูปโลโก้ตรงกลาง จะทำให้สแกนไม่ติดหรือไม่?</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                ระบบได้ตั้งค่าระดับการกู้คืนข้อผิดพลาด (Error Correction Level) เป็นระดับ High (30%) อัตโนมัติเมื่อมีการใส่รูปโลโก้ ทำให้สามารถสแกนได้แม่นยำแม้พื้นที่ตรงกลางจะมีรูปภาพบดบังอยู่
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 text-center text-xs text-slate-500">
        <p>© 2026 TOOL HUB. ศูนย์รวมเครื่องมือออนไลน์ฟรี • ปลอดภัย ไม่เก็บข้อมูล</p>
      </footer>
    </div>
  );
}
