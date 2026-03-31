import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: '--font-pj',
});

export const metadata: Metadata = {
  title: 'Kua — Effortless Marketing. Exponential Growth.',
  description: 'AI-powered marketing campaigns for the African merchant.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Kua',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  themeColor: '#00FFA3', // Electric Emerald
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        </head>
        <body className={`${plusJakarta.variable} font-sans min-h-screen bg-background text-white`}>
          {/* Full screen layout, letting components dictact width and scroll behavior */}
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
