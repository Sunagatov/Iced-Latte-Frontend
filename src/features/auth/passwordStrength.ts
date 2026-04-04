export function getPasswordStrength(pw: string): {
  score: number
  label: string
  color: string
} {
  if (!pw) return { score: 0, label: '', color: '' }
  let score = 0

  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[@$!%*?&]/.test(pw)) score++
  const map = [
    { label: 'Weak', color: 'bg-negative' },
    { label: 'Fair', color: 'bg-yellow-400' },
    { label: 'Good', color: 'bg-yellow-400' },
    { label: 'Strong', color: 'bg-positive' },
    { label: 'Very strong', color: 'bg-positive' },
  ]

  return { score, ...map[score] }
}
