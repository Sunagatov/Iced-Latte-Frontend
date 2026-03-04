interface PasswordStrengthBarProps {
  score: number
  label: string
  color: string
}

export default function PasswordStrengthBar({ score, label, color }: Readonly<PasswordStrengthBarProps>) {
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${i < score ? color : 'bg-tertiary'}`}
          />
        ))}
      </div>
      <p className={`mt-1 text-xs font-medium ${score >= 3 ? 'text-positive' : score >= 2 ? 'text-yellow-500' : 'text-negative'}`}>
        {label}
      </p>
    </div>
  )
}
