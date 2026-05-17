import type { ReactNode } from 'react'

export function highlightSearchMatch(text: string, query: string): ReactNode {
  if (!query) {
    return text
  }

  const startIndex = text.toLowerCase().indexOf(query.toLowerCase())

  if (startIndex === -1) {
    return text
  }

  return (
    <>
      {text.slice(0, startIndex)}
      <mark className="text-brand bg-transparent font-bold">
        {text.slice(startIndex, startIndex + query.length)}
      </mark>
      {text.slice(startIndex + query.length)}
    </>
  )
}
