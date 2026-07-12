import './globals.css'
import 'react-toastify/dist/ReactToastify.css'
import { GoogleAnalytics } from '@next/third-parties/google'
import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ToastContainer } from 'react-toastify'
import Header from '@/app/layout/Header'
import Footer from '@/app/layout/Footer'
import AppProviders from '@/app/providers/AppProviders'
import WebVitalsReporter from '@/app/providers/WebVitalsReporter'
import { GOOGLE_ANALYTICS_MEASUREMENT_ID } from '@/shared/config/analytics'
import React from 'react'

const inter = Inter({ subsets: ['latin'] })
const siteUrl = process.env.NEXT_PUBLIC_FRONTEND_URL

if (!siteUrl) {
  throw new Error('NEXT_PUBLIC_FRONTEND_URL is required')
}

export const metadata: Metadata = {
  title: {
    default: 'Iced Latte — Marketplace',
    template: '%s | Iced Latte',
  },
  description:
    'Discover thousands of products from trusted sellers. A source-available marketplace project.',
  openGraph: {
    title: 'Iced Latte — Marketplace',
    description:
      'Discover thousands of products from trusted sellers. A source-available marketplace project.',
    url: siteUrl,
    siteName: 'Iced Latte',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Iced Latte — Marketplace',
    description: 'Discover thousands of products from trusted sellers.',
  },
  metadataBase: new URL(siteUrl),
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        suppressHydrationWarning
        className={inter.className + ' flex min-h-screen flex-col bg-[#F8F7F4]'}
      >
        <WebVitalsReporter />
        <ToastContainer />
        <AppProviders>
          <Header />
          <main className={'min-w-[360px] grow'}>{children}</main>
          <Footer />
          {GOOGLE_ANALYTICS_MEASUREMENT_ID && (
            <GoogleAnalytics gaId={GOOGLE_ANALYTICS_MEASUREMENT_ID} />
          )}
        </AppProviders>
      </body>
    </html>
  )
}
