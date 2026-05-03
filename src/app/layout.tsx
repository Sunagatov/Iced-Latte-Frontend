import './globals.css'
import 'react-toastify/dist/ReactToastify.css'
import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ToastContainer } from 'react-toastify'
import Header from '@/app/layout/Header/Header'
import Footer from '@/app/layout/Footer/Footer'
import AppProviders from '@/app/providers/AppProviders'
import React from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Iced Latte — Specialty Coffee Marketplace',
    template: '%s | Iced Latte',
  },
  description:
    'Discover curated specialty coffees from the world\'s best roasters. An open-source coffee marketplace built by the community.',
  openGraph: {
    title: 'Iced Latte — Specialty Coffee Marketplace',
    description:
      'Discover curated specialty coffees from the world\'s best roasters. An open-source coffee marketplace built by the community.',
    url: 'https://iced-latte.uk',
    siteName: 'Iced Latte',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Iced Latte — Specialty Coffee Marketplace',
    description:
      'Discover curated specialty coffees from the world\'s best roasters.',
  },
  metadataBase: new URL('https://iced-latte.uk'),
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        suppressHydrationWarning
        className={inter.className + ' flex min-h-screen flex-col'}
      >
        <ToastContainer />
        <AppProviders>
          <Header />
          <main className={'min-w-[360px] grow'}>{children}</main>
          <Footer />
        </AppProviders>
      </body>
    </html>
  )
}
