'use client'

import { useState } from 'react'
import FavElement from '../FavElement/FavElement'
import Loader from '@/shared/components/Loader/Loader'
import { IProduct } from '@/features/products/types'
import { useFavouritesStore } from '@/features/favorites/store'

function ListIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="4" width="16" height="2" rx="1" fill={active ? '#6B21A8' : '#9CA3AF'} />
      <rect x="2" y="9" width="16" height="2" rx="1" fill={active ? '#6B21A8' : '#9CA3AF'} />
      <rect x="2" y="14" width="16" height="2" rx="1" fill={active ? '#6B21A8' : '#9CA3AF'} />
    </svg>
  )
}

function GridIcon({ active }: { active: boolean }) {
  const c = active ? '#6B21A8' : '#9CA3AF'
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="2" width="7" height="7" rx="1.5" fill={c} />
      <rect x="11" y="2" width="7" height="7" rx="1.5" fill={c} />
      <rect x="2" y="11" width="7" height="7" rx="1.5" fill={c} />
      <rect x="11" y="11" width="7" height="7" rx="1.5" fill={c} />
    </svg>
  )
}

export default function FavouritesFull() {
  const { favourites, loading } = useFavouritesStore()
  const uniqueFavourites = favourites.filter((item, index, self) => self.findIndex(i => i.id === item.id) === index)
  const [view, setView] = useState<'list' | 'grid'>('list')

  const renderContent = () => {
    if (loading) return <Loader />
    if (view === 'grid') {
      return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {uniqueFavourites.map((item: IProduct) => (
            <FavElement key={item.id} product={item} view="grid" />
          ))}
        </div>
      )
    }
    return (
      <div className="flex flex-col gap-3">
        {uniqueFavourites.map((item: IProduct) => (
          <FavElement key={item.id} product={item} view="list" />
        ))}
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[960px] px-4 pt-10 pb-16">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Favourites</h1>
          <span className="text-sm font-medium text-tertiary">{uniqueFavourites.length} items</span>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-primary/20 p-1">
          <button
            onClick={() => setView('list')}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
              view === 'list' ? 'bg-brand-second' : 'hover:bg-secondary'
            }`}
            aria-label="List view"
          >
            <ListIcon active={view === 'list'} />
          </button>
          <button
            onClick={() => setView('grid')}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
              view === 'grid' ? 'bg-brand-second' : 'hover:bg-secondary'
            }`}
            aria-label="Grid view"
          >
            <GridIcon active={view === 'grid'} />
          </button>
        </div>
      </div>
      {renderContent()}
    </div>
  )
}
