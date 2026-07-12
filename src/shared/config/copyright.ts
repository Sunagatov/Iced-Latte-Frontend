export function getCopyrightYears(
  currentYear = new Date().getFullYear(),
): string {
  return currentYear === 2024 ? '2024' : `2024-${currentYear}`
}

export function getCopyrightLabel(
  currentYear = new Date().getFullYear(),
): string {
  return `© ${getCopyrightYears(currentYear)} Iced Latte · Personal Evaluation License`
}
