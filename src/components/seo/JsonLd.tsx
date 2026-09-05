'use client';

import React from 'react';
import type { PdfToolDefinition } from '@/config/pdf-tools';

export interface JsonLdProps {
  tool?: PdfToolDefinition;
  title?: string;
  description?: string;
  url?: string;
  faqs?: { question: string; answer: string }[];
  appUrl?: string;
}

export const JsonLd: React.FC<JsonLdProps> = ({
  tool,
  title,
  description,
  url,
  faqs = [],
  appUrl = 'https://toot-glawawfah-pokkao2529-7498.vercel.app',
}) => {
  const toolName = tool ? `${tool.nameTH} (${tool.name})` : (title || 'TOOL HUB');
  const toolDesc = tool ? tool.seoDescription : (description || 'ศูนย์รวมเครื่องมือออนไลน์ฟรี');
  const toolRoute = tool ? tool.route : (url || '');

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: toolName,
    operatingSystem: 'All',
    applicationCategory: 'BusinessApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'THB',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '1280',
    },
    description: toolDesc,
    url: `${appUrl}${toolRoute}`,
  };

  const faqSchema =
    faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.answer,
            },
          })),
        }
      : null;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'TOOL HUB',
        item: appUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: tool ? 'PDF Suite' : 'QR Code Suite',
        item: tool ? `${appUrl}/pdf` : `${appUrl}/tools/qrcode`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: tool ? tool.nameTH : (title || 'เครื่องมือ'),
        item: `${appUrl}${toolRoute}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
};
