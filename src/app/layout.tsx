import './globals.css'
import 'react-toastify/dist/ReactToastify.css'
import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ToastContainer } from 'react-toastify'
import Header from '@/components/Header/Header'
import Footer from '@/components/Footer/Footer'
import InterceptorsForRefreshToken from '@/Context/InterceptorsForRefreshToken'
import GlobalFavoritesAndCartInit from '@/Context/GlobalFavoritesAndCartInit'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Iced Latte',
  description: 'Iced Latte',
}

export interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html lang="en">
      <body className={inter.className + ' flex min-h-screen flex-col'}>
        <ToastContainer />
        <InterceptorsForRefreshToken>
          <GlobalFavoritesAndCartInit >
            <Header />
            <main className={'min-w-[360px] grow'}>{children}</main>
            <Footer />
          </GlobalFavoritesAndCartInit>
        </InterceptorsForRefreshToken>
      </body>
    </html>
  )
}
