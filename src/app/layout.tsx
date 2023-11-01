<<<<<<< HEAD
import './globals.css'
import { Header } from '@/components/header'
import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import React from 'react'
=======
import React from 'react'
import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
>>>>>>> development

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Online store',
  description: 'Online store',
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
<<<<<<< HEAD
      <body className={inter.className}>
        <Header />
        {children}
      </body>
=======
      <body className={inter.className}>{children}</body>
>>>>>>> development
    </html>
  )
}
