import React from 'react'
import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Iced Latte',
  description: 'Iced Latte',
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html lang="en">
      <body className={inter.className + ' flex min-h-screen flex-col'}>
        <Header />
        <main className={'min-w-[360px] grow'}>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
