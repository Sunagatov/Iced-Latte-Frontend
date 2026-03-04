'use client'

import React, { useState } from 'react'

interface AIReviewSummaryProps {
  summary: string
  reviewsCount: number
}

const AIReviewSummary = ({ summary, reviewsCount }: AIReviewSummaryProps) => {
  const [expanded, setExpanded] = useState(false)

  const isLong = summary.length > 180
  const displayText = isLong && !expanded ? summary.slice(0, 180).trimEnd() + '…' : summary

  return (
    <div className="flex h-full flex-col rounded-2xl border border-black/6 bg-white p-5 shadow-sm sm:p-6">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <svg className="h-4 w-4 shrink-0 text-violet-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2l1.8 5.4H19l-4.3 3.2 1.6 5.4L12 13l-4.3 3 1.6-5.4L5 7.4h5.2z" />
        </svg>
        <span className="text-sm font-semibold text-slate-800">Customers say</span>
        <span className="ml-auto text-xs text-slate-400">
          {reviewsCount} review{reviewsCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Quote */}
      <div className="relative pl-5">
        <span className="absolute left-0 top-[-4px] text-3xl leading-none text-violet-300 select-none">"</span>
        <p className="text-sm leading-relaxed text-slate-700 sm:text-[15px]">
          {displayText}
          {isLong && (
            <button
              onClick={() => setExpanded(v => !v)}
              className="ml-1.5 font-semibold text-violet-600 hover:underline focus:outline-none"
            >
              {expanded ? 'less' : 'more'}
            </button>
          )}
        </p>
        <span className="text-3xl leading-none text-violet-300 select-none">"</span>
      </div>

      <p className="mt-4 text-[11px] text-slate-400">
        Generated from customer reviews · May not reflect every opinion
      </p>
    </div>
  )
}

export default AIReviewSummary
