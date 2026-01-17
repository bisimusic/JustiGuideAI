import type { Metadata } from 'next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Providers } from './providers'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'JustiGuide AI - Immigration Platform',
  description: 'AI-powered immigration platform connecting immigrants with vetted lawyers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
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
