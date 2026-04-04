'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function RenderError({
  error,
  reset,
}: Readonly<{
  error: Error
  reset: () => void
}>) {
  const router = useRouter()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="flex h-full flex-col items-center justify-center">
      <h2 className="text-2XL text-center">Something went wrong!</h2>
      <button
        className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
        onClick={() => reset()}
      >
        Try again
      </button>
      <p className={'text-XL mt-4'}>Or</p>
      <button
        className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
        onClick={() => router.push('/')}
      >
        Homepage
      </button>
    </main>
  )
}
