const PREFIX = 'iced-review-draft:'

export type ReviewDraft = { text: string; rating: number }

export function reviewDraftKey(owner: string, productId: string): string {
  return `${PREFIX}${JSON.stringify([owner, productId])}`
}

export function readReviewDraft(key: string): ReviewDraft {
  try {
    const draft = JSON.parse(sessionStorage.getItem(key) ?? 'null')

    if (typeof draft?.text === 'string' && Number.isInteger(draft.rating) && draft.rating >= 0 && draft.rating <= 5)
      return { text: draft.text.slice(0, 1500), rating: draft.rating }
  } catch { /* Storage is optional. */ }

  return { text: '', rating: 0 }
}

export function saveReviewDraft(key: string, draft: ReviewDraft): void {
  try {
    if (!draft.text && !draft.rating) sessionStorage.removeItem(key)
    else sessionStorage.setItem(key, JSON.stringify({ ...draft, text: draft.text.slice(0, 1500) }))
  } catch { /* Storage is optional. */ }
}

export function clearReviewDrafts(): void {
  try {
    Object.keys(sessionStorage).filter(key => key.startsWith(PREFIX)).forEach(key => sessionStorage.removeItem(key))
  } catch { /* Storage is optional. */ }
}
