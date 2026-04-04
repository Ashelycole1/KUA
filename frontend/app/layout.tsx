import type { Metadata, Viewport } from 'next'
import { DM_Sans, Syne } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: '--font-dm-sans',
});

const syne = Syne({
  subsets: ["latin"],
  variable: '--font-syne',
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
  themeColor: '#1D9E75',
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
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <script
          async
          crossOrigin="anonymous"
          data-clerk-publishable-key={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
          src="https://cdn.jsdelivr.net/npm/@clerk/clerk-js@latest/dist/clerk.browser.js"
          type="text/javascript"
        ></script>
      </head>
      <body className={`${dmSans.variable} ${syne.variable} font-sans min-h-screen bg-ca text-tx`}>
        {children}
      </body>
    </html>
  )
}
