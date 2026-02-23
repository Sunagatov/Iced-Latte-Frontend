import './globals.css'
import 'react-toastify/dist/ReactToastify.css'
import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ToastContainer } from 'react-toastify'
import Header from '@/shared/components/Header/Header'
import Footer from '@/shared/components/Footer/Footer'
import AuthInterceptor from '@/shared/providers/AuthInterceptor'
import AppInitProvider from '@/shared/providers/AppInitProvider'
import PerformanceTracker from '@/shared/components/PerformanceTracker'
import React from 'react'

const inter = Inter({ subsets: ['latin'] })

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const metadata: Metadata = {
  title: 'Iced Latte',
  description: 'Iced Latte',
}

export interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({
  children,
}: Readonly<RootLayoutProps>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className={inter.className + ' flex min-h-screen flex-col'}>
        <ToastContainer />
        <AuthInterceptor>
          <AppInitProvider>
            <PerformanceTracker>
              <Header />
              <main className={'min-w-[360px] grow'}>{children}</main>
              <Footer />
            </PerformanceTracker>
          </AppInitProvider>
        </AuthInterceptor>
      </body>
    </html>
  )
}
