import type { Metadata } from 'next'
import FavouritesPage from '@/features/favorites/components/FavouritesPage'

export const metadata: Metadata = {
  title: 'Favourites',
  description: 'View the products you have saved on Iced Latte.',
}

export default function FavoritesPage() {
  return <FavouritesPage />
}
