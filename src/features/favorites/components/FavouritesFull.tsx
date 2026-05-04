'use client'

import { useState, useEffect } from 'react'
import FavElement from './FavElement'
import type { IProduct } from '@/features/products/types'
import { useFavouritesStore } from '@/features/favorites/state/favoritesStore'

function ListIcon({ active }: { active: boolean }) {
  const c = active ? '#1B4332' : '#9CA3AF'

  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect fill={c} height="2" rx="1" width="16" x="2" y="4" />
      <rect fill={c} height="2" rx="1" width="16" x="2" y="9" />
      <rect fill={c} height="2" rx="1" width="16" x="2" y="14" />
    </svg>
  )
}

function GridIcon({ active }: { active: boolean }) {
  const c = active ? '#1B4332' : '#9CA3AF'

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
  const favourites: IProduct[] = useFavouritesStore((s) => s.favourites)
  const [view, setView] = useState<'list' | 'grid'>(() => {
    if (typeof window === 'undefined') return 'list'
    const saved = window.localStorage.getItem('favourites-view')

    return saved === 'grid' ? 'grid' : 'list'
  })

  useEffect(() => {
    window.localStorage.setItem('favourites-view', view)
  }, [view])

  const renderContent = () => {
    if (view === 'grid') {
      return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {favourites.map((item: IProduct) => (
            <FavElement key={item.id} product={item} view="grid" />
          ))}
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-3">
        {favourites.map((item: IProduct) => (
          <FavElement key={item.id} product={item} view="list" />
        ))}
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 pt-10 pb-16">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-black/80">
            Favourites
          </h1>
          <span className="text-sm text-black/40">
            {favourites.length} {favourites.length === 1 ? 'item' : 'items'}
          </span>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-black/[0.06] bg-white p-1">
          <button
            aria-label="List view"
            aria-pressed={view === 'list'}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
              view === 'list' ? 'bg-[#F0F7F4]' : 'hover:bg-black/[0.03]'
            }`}
            onClick={() => setView('list')}
          >
            <ListIcon active={view === 'list'} />
          </button>
          <button
            aria-label="Grid view"
            aria-pressed={view === 'grid'}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
              view === 'grid' ? 'bg-[#F0F7F4]' : 'hover:bg-black/[0.03]'
            }`}
            onClick={() => setView('grid')}
          >
            <GridIcon active={view === 'grid'} />
          </button>
        </div>
      </div>
      {renderContent()}
    </div>
  )
}
