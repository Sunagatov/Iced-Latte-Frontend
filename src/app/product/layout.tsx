import { Metadata } from 'next'

export const metadata: Metadata = {
  description: 'Product page',
}

interface ProductLayoutProps {
  children: React.ReactNode
}

export default function ProductLayout({ children }: ProductLayoutProps) {
  return <div>{children}</div>
}
