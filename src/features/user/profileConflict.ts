import type { UserData } from './types'

// Reapply only fields the user actually edited. Untouched fields come from the
// current server profile, so reviewing a conflict cannot restore stale values.
export function keepProfileEdits(
  base: UserData,
  draft: UserData,
  latest: UserData,
): UserData {
  const merged = { ...latest, address: { ...latest.address } }
  const same = (a: unknown, b: unknown) => (a ?? '') === (b ?? '')

  for (const field of [
    'firstName',
    'lastName',
    'birthDate',
    'phoneNumber',
  ] as const) {
    if (!same(base[field], draft[field]))
      Object.assign(merged, { [field]: draft[field] })
  }
  for (const field of ['country', 'city', 'line', 'postcode'] as const) {
    if (!same(base.address?.[field], draft.address?.[field]))
      merged.address[field] = draft.address?.[field]
  }

  return merged
}
