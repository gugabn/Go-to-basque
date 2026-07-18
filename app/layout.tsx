import type { Metadata, Viewport } from 'next'
import { Sora, Inter } from 'next/font/google'
import './globals.css'

const sora = Sora({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  display: 'swap',
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#070810',
}

export const metadata: Metadata = {
  title: 'Rumo à Basque',
  description: 'Poupança rumo à Basque Culinary — meta, ritmo e certificações',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Rumo à Basque',
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt" className={`${sora.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  )
}
