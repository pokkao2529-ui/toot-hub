import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://toot-hub.vercel.app'),
  title: {
    default: "TOOL HUB — ศูนย์รวมเครื่องมือออนไลน์ฟรี & PDF Suite",
    template: "%s | TOOL HUB",
  },
  description: "ศูนย์รวมเครื่องมือออนไลน์คุณภาพสูง ฟรี ปลอดภัย และรวดเร็ว พร้อมชุดเครื่องมือ PDF Suite ครบวงจร",
  openGraph: {
    title: "TOOL HUB — ศูนย์รวมเครื่องมือออนไลน์ฟรี & PDF Suite",
    description: "ศูนย์รวมเครื่องมือออนไลน์คุณภาพสูง ฟรี ปลอดภัย และรวดเร็ว พร้อมชุดเครื่องมือ PDF Suite ครบวงจร",
    url: "https://toot-hub.vercel.app",
    siteName: "TOOL HUB",
    locale: "th_TH",
    type: "website",
  },
  other: {
    "google-adsense-account": "ca-pub-5688187756853332",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="google-adsense-account" content="ca-pub-5688187756853332" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5688187756853332"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
