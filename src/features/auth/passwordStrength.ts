export function getPasswordStrength(pw: string): {
  score: number
  label: string
  color: string
} {
  if (!pw) return { score: 0, label: '', color: '' }
  let score = 0

  if (pw.length >= 15) score++
  if (pw.length >= 20) score++
  if (pw.length >= 25) score++
  if (pw.length >= 30 && new Set(pw.toLowerCase()).size >= 8) score++
  const map = [
    { label: 'Too short', color: 'bg-negative' },
    { label: 'Minimum length', color: 'bg-yellow-400' },
    { label: 'Good length', color: 'bg-yellow-400' },
    { label: 'Long passphrase', color: 'bg-positive' },
    { label: 'Very long passphrase', color: 'bg-positive' },
  ]

  return { score, ...map[score] }
}
