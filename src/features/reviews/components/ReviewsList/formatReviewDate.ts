const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

export const formatReviewDate = (dateString: string | null) => {
  if (!dateString) return { date: 'N/A', time: '' }

  const date = new Date(dateString)

  return {
    date: dateFormatter.format(date),
    time: timeFormatter.format(date),
  }
}
