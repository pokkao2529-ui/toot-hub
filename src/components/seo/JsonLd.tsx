'use client';

import React from 'react';
import type { PdfToolDefinition } from '@/config/pdf-tools';

interface JsonLdProps {
  tool: PdfToolDefinition;
  faqs?: { question: string; answer: string }[];
  appUrl?: string;
}

export const JsonLd: React.FC<JsonLdProps> = ({
  tool,
  faqs = [],
  appUrl = 'https://toot-hub.vercel.app',
}) => {
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `${tool.nameTH} (${tool.name})`,
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
    description: tool.seoDescription,
    url: `${appUrl}${tool.route}`,
  };

  const faqSchema = faqs.length > 0 ? {
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
  } : null;

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
        name: 'PDF Suite',
        item: `${appUrl}/pdf`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: tool.nameTH,
        item: `${appUrl}${tool.route}`,
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
