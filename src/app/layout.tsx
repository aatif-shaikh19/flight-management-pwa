import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Navbar } from '@/components/ui/Navbar'
import { InstallPrompt } from '@/components/ui/InstallPrompt'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SkyBook — Flight Management',
  description: 'Search, book, and manage your flights across India',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SkyBook',
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        {children}
        <InstallPrompt />
      </body>
    </html>
  )
}
