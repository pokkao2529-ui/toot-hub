'use client';

import React, { useEffect } from 'react';

interface AdBannerProps {
  slotId?: string;
  format?: 'horizontal' | 'rectangle' | 'result';
  className?: string;
}

/**
 * Google AdSense Compliant Banner Component
 * Renders live Google Ads when Client ID is configured,
 * or a clean non-intrusive placeholder during development.
 */
export const AdBanner: React.FC<AdBannerProps> = ({
  slotId,
  format = 'horizontal',
  className = '',
}) => {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  useEffect(() => {
    if (clientId && typeof window !== 'undefined') {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense error:', err);
      }
    }
  }, [clientId]);

  // Dimensions based on standard high-performing IAB ad formats
  const sizeClasses = {
    horizontal: 'min-h-[90px] w-full max-w-4xl mx-auto',
    rectangle: 'min-h-[250px] w-full max-w-[336px] mx-auto',
    result: 'min-h-[100px] w-full max-w-lg mx-auto',
  }[format];

  if (!clientId) {
    // Development placeholder indicating monetized ad slot
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 p-4 text-center my-6 ${sizeClasses} ${className}`}
      >
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
          พื้นที่โฆษณา (Google AdSense Slot)
        </span>
        <p className="text-xs text-slate-400">
          พร้อมสร้างรายได้ทันทีเมื่อใส่รหัส AdSense Publisher ID
        </p>
      </div>
    );
  }

  return (
    <div className={`my-6 text-center overflow-hidden ${sizeClasses} ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={slotId || '1234567890'}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};
