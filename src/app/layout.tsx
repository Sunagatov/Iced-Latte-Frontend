'use client'

import React from 'react'
import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'
import { Hero } from '@/components/Hero'
import { useRouter } from 'next/navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Online store',
  description: 'Online store',
}
interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  const router = useRouter()

  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        {router.pathname === '/' && <Hero />}
        {children}
      </body>
    </html>
  )
}
