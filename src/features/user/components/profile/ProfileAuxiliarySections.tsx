'use client'

import { UserReviews } from '@/features/reviews/public'

export function ProfileReviewsSection() {
  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.06]">
      <div className="flex items-center gap-2 border-b border-black/[0.06] px-5 py-4">
        <svg className="h-5 w-5 text-brand" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
        <h2 className="font-semibold text-black/80">My Reviews</h2>
      </div>
      <div className="p-5">
        <UserReviews />
      </div>
    </div>
  )
}
