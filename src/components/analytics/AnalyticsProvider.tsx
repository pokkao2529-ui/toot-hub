'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { app } from '@/lib/firebase';

/**
 * TOOL HUB — Analytics Provider
 * - Init Firebase Analytics (GA4) เมื่อโหลดในเบราว์เซอร์
 * - Track page_view อัตโนมัติทุกครั้งที่เปลี่ยนหน้า
 * - ปลอดภัย: ไม่ส่งข้อมูลส่วนตัวใดๆ
 */
export function AnalyticsProvider() {
  const pathname = usePathname();

  useEffect(() => {
    async function initAndTrack() {
      if (typeof window === 'undefined') return;
      try {
        const { getAnalytics, isSupported, logEvent } = await import('firebase/analytics');
        const supported = await isSupported();
        if (!supported) return;

        const analytics = getAnalytics(app);

        // Track page_view on route change
        logEvent(analytics, 'page_view', {
          page_path: pathname,
          page_title: typeof document !== 'undefined' ? document.title : '',
        });
      } catch {
        // Fail silently
      }
    }
    initAndTrack();
  }, [pathname]);

  return null;
}
