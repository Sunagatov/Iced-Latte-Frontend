'use client'

type Entry = { id: string; label: string; quantity?: number }
export default function GuestDraftReview({
  message,
  entries,
  busy,
  onRemove,
  onQuantity,
  onRetry,
  onDiscard,
}: {
  message: string
  entries: Entry[]
  busy: boolean
  onRemove: (id: string) => void
  onQuantity?: (id: string, quantity: number) => void
  onRetry: () => void
  onDiscard: () => void
}) {
  return (
    <section
      aria-label="Guest items needing review"
      className="mx-auto my-4 max-w-[1100px] rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm"
    >
      <h2 className="font-semibold">Guest items need review</h2>
      <p className="mt-1">{message}</p>
      <p className="mt-1 text-black/60">
        These items are kept in this browser. Your account collection remains
        available below.
      </p>
      <ul className="my-3 max-h-64 space-y-2 overflow-y-auto">
        {entries.map((entry) => (
          <li key={entry.id} className="flex flex-wrap items-center gap-3">
            <span className="min-w-0 flex-1 break-words">{entry.label}</span>
            {entry.quantity !== undefined && onQuantity && (
              <input
                aria-label={`Guest quantity for ${entry.label}`}
                type="number"
                min={1}
                max={99}
                value={entry.quantity}
                disabled={busy}
                className="w-16 rounded border border-black/20 bg-white p-1"
                onChange={(event) => {
                  const quantity = Number(event.target.value)

                  if (
                    Number.isInteger(quantity) &&
                    quantity >= 1 &&
                    quantity <= 99
                  )
                    onQuantity(entry.id, quantity)
                }}
              />
            )}
            <button
              type="button"
              disabled={busy}
              className="underline"
              onClick={() => onRemove(entry.id)}
            >
              Remove from draft
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-4">
        <button
          type="button"
          disabled={busy}
          className="bg-brand-solid rounded px-3 py-2 text-white disabled:opacity-50"
          onClick={onRetry}
        >
          {busy ? 'Checking…' : 'Retry corrected draft'}
        </button>
        <button
          type="button"
          disabled={busy}
          className="underline"
          onClick={onDiscard}
        >
          Discard guest draft
        </button>
      </div>
    </section>
  )
}
