// Function for formatting the date into the desired format
export const formatDate = (dateString: string | null) => {
  if (!dateString) {
    return 'N/A'
  }

  const date = new Date(dateString)
  const day = date.getDate()
  const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date)
  const year = date.getFullYear()

  return `${day} ${month} ${year}`
}
