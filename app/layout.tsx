import type { Metadata, Viewport } from 'next';
import { LanguageProvider } from '@/context/LanguageContext';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#050814',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'छठ महापर्व 2026 | Chhath Mahaparv 2026 — Digital Journey',
  description:
    'भगवान सूर्य और छठी मैया को समर्पित आस्था के महापर्व छठ 2026 का भव्य डिजिटल अनुभव। लाइव काउंटडाउन, पटना, वाराणसी, दिल्ली समेत सभी शहरों के सटीक सूर्य अर्घ्य मुहूर्त, पावन छठ संगीत, 4 दिवसीय अनुष्ठान और डिजिटल दीपदान।',
  keywords: [
    'Chhath Puja 2026',
    'छठ महापर्व 2026',
    'Chhath Puja dates 2026',
    'Chhath Puja timings',
    'Sandhya Arghya 2026',
    'Usha Arghya 2026',
    'Chhath sunset time Patna',
    'Chhath sunrise time',
    'Nahay Khay date 2026',
    'Kharna date 2026',
    'Chhath Puja wishes',
    'Sharda Sinha Chhath Geet',
    'छठी मैया',
    'सूर्य अर्घ्य',
  ],
  authors: [{ name: 'Chhath Mahaparv Heritage Collective' }],
  creator: 'Chhath Mahaparv 2026',
  publisher: 'Chhath Mahaparv',
  metadataBase: new URL('https://chhath2026.in'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'छठ महापर्व 2026 | Chhath Mahaparv 2026 — Live Sacred Experience',
    description:
      'सूर्य देव और छठी मैया को समर्पित लोक आस्था का महापर्व। लाइव काउंटडाउन, सटीक अर्घ्य समय, पावन संगीत, चार दिवसीय अनुष्ठान व डिजिटल दीपदान।',
    url: 'https://chhath2026.in',
    siteName: 'छठ महापर्व 2026 (Chhath Mahaparv)',
    locale: 'hi_IN',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Chhath Mahaparv 2026 Sacred Ghat River Sunrise and Floating Diyas',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'छठ महापर्व 2026 | Chhath Mahaparv 2026',
    description:
      'लाइव काउंटडाउन, शहर अनुसार सटीक अर्घ्य मुहूर्त, पारंपरिक छठ गीत व पावन अनुष्ठान का डिजिटल अनुभव।',
    images: ['/og-image.jpg'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192.svg',
    apple: '/icons/icon-192.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Structured Data (JSON-LD) for Chhath Puja 2026 Event & Website
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Event',
        '@id': 'https://chhath2026.in/#event',
        name: 'छठ महापर्व 2026 (Chhath Mahaparv 2026)',
        description:
          'Ancient Vedic solar festival dedicated to Lord Surya and Chhathi Maiya featuring 36-hour nirjala vrat, Sandhya Arghya, and Usha Arghya.',
        startDate: '2026-11-13T06:00:00+05:30',
        endDate: '2026-11-16T08:00:00+05:30',
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
        location: {
          '@type': 'Place',
          name: 'Ganga Ghats, Patna & Rivers across India',
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'IN',
          },
        },
      },
      {
        '@type': 'WebSite',
        '@id': 'https://chhath2026.in/#website',
        url: 'https://chhath2026.in',
        name: 'छठ महापर्व 2026 Digital Journey',
        description: 'Immersive experiential website for Chhath Mahaparv 2026.',
        inLanguage: ['hi', 'en', 'bho'],
      },
    ],
  };

  return (
    <html lang="hi" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Yatra+One&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="antialiased selection:bg-amber-500/30 selection:text-amber-200">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}

