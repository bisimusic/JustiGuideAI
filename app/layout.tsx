import type { Metadata } from 'next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Providers } from './providers'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'JustiGuide AI - Immigration Platform | From Months to Hours',
  description: 'AI-powered immigration platform connecting immigrants with vetted lawyers. Transform your immigration process from overwhelming to effortless. 47,000+ users helped, 500+ vetted lawyers, 95% success rate.',
  keywords: [
    'immigration',
    'immigration lawyer',
    'visa application',
    'green card',
    'H1B visa',
    'O1A visa',
    'immigration platform',
    'AI immigration',
    'immigration software',
    'immigration services',
    'USCIS',
    'immigration attorney',
    'legal immigration',
    'immigration help',
    'immigration assistance',
  ],
  authors: [{ name: 'JustiGuide AI' }],
  creator: 'JustiGuide AI',
  publisher: 'JustiGuide AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://justiguide.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://justiguide.com',
    title: 'JustiGuide AI - Immigration Platform | From Months to Hours',
    description: 'AI-powered immigration platform connecting immigrants with vetted lawyers. Transform your immigration process from overwhelming to effortless.',
    siteName: 'JustiGuide AI',
    images: [
      {
        url: '/assets/file-VqtLhVngyJTcoRdkTestqJ-Guarder Icon - Transparent_1759804664573.png',
        width: 1200,
        height: 630,
        alt: 'JustiGuide AI - Immigration Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JustiGuide AI - Immigration Platform | From Months to Hours',
    description: 'AI-powered immigration platform connecting immigrants with vetted lawyers. 47,000+ users helped, 500+ vetted lawyers, 95% success rate.',
    images: ['/assets/file-VqtLhVngyJTcoRdkTestqJ-Guarder Icon - Transparent_1759804664573.png'],
    creator: '@justiguide',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/assets/file-VqtLhVngyJTcoRdkTestqJ-Guarder Icon - Transparent_1759804664573.png',
    shortcut: '/assets/file-VqtLhVngyJTcoRdkTestqJ-Guarder Icon - Transparent_1759804664573.png',
    apple: '/assets/file-VqtLhVngyJTcoRdkTestqJ-Guarder Icon - Transparent_1759804664573.png',
  },
  verification: {
    google: 'your-google-verification-code', // Replace with actual verification code
  },
  category: 'Legal Services',
  classification: 'Immigration Legal Services',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Favicon */}
        <link rel="icon" type="image/png" href="/assets/file-VqtLhVngyJTcoRdkTestqJ-Guarder Icon - Transparent_1759804664573.png" />
        <link rel="apple-touch-icon" href="/assets/file-VqtLhVngyJTcoRdkTestqJ-Guarder Icon - Transparent_1759804664573.png" />
        
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        
        {/* Additional SEO Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="language" content="English" />
        <meta name="geo.region" content="US-CA" />
        <meta name="geo.placename" content="San Francisco" />
        <meta name="geo.position" content="37.7749;-122.4194" />
        <meta name="ICBM" content="37.7749, -122.4194" />
        
        {/* Structured Data - JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'JustiGuide AI',
              url: 'https://justiguide.com',
              logo: 'https://justiguide.com/assets/file-VqtLhVngyJTcoRdkTestqJ-Guarder Icon - Transparent_1759804664573.png',
              description: 'AI-powered immigration platform connecting immigrants with vetted lawyers',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'San Francisco',
                addressRegion: 'CA',
                addressCountry: 'US',
              },
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+1-866-779-5127',
                contactType: 'Customer Service',
                email: 'info@justiguide.com',
              },
              sameAs: [
                'https://time.com/collections/best-inventions-2025/7318500/justiguide-relo/',
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'JustiGuide AI',
              url: 'https://justiguide.com',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://justiguide.com/search?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Service',
              serviceType: 'Immigration Legal Services',
              provider: {
                '@type': 'Organization',
                name: 'JustiGuide AI',
              },
              areaServed: {
                '@type': 'Country',
                name: 'United States',
              },
              description: 'AI-powered immigration platform connecting immigrants with vetted lawyers',
            }),
          }}
        />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  )
}
