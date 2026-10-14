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
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-5688187756853332';

  useEffect(() => {
    if (clientId && slotId && typeof window !== 'undefined') {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense error:', err);
      }
    }
  }, [clientId, slotId]);

  // Dimensions based on standard high-performing IAB ad formats
  const sizeClasses = {
    horizontal: 'min-h-[90px] w-full max-w-4xl mx-auto',
    rectangle: 'min-h-[250px] w-full max-w-[336px] mx-auto',
    result: 'min-h-[100px] w-full max-w-lg mx-auto',
  }[format];

  // Validate slotId: AdSense slot IDs must be 9-12 digits number string
  const isValidNumericSlot = slotId && /^\d{9,12}$/.test(slotId);

  // Don't render ad if no valid numeric slot ID provided — avoids AdSense TagError & policy violations
  if (!isValidNumericSlot || !clientId) {
    return null;
  }

  return (
    <div className={`my-6 text-center overflow-hidden ${sizeClasses} ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};
