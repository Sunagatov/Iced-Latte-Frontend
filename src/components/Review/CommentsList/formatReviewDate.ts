export const formatReviewDate = (dateString: string | null) => {
  if (!dateString) {
    return {
      date: 'N/A',
      time: '',
    }
  }

  const date = new Date(dateString)
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0') // Months are zero-indexed
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')

  return {
    date: `${day}.${month}.${year}`,
    time: `${hours}:${minutes}`,
  }
}
