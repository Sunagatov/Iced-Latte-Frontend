// Function for formatting the date into the format for the list of product reviews
// "YYYY-MM-DDThh:mm:ss.sssZ" -> dd.mm.yyyy and hh:mm
export const formatReviewDate = (dateString: string | null) => {
  if (!dateString) {
    return {
      date: 'N/A',
      time: '',
    }
  }

  const date = new Date(dateString)
  const day = date.getDate()
  const month = new Intl.DateTimeFormat('en-US', { month: '2-digit' }).format(date)
  const year = date.getFullYear()

  return {
    date: `${day}.${month}.${year}`,
    time: new Date(dateString).getHours() + ':' + new Date(dateString).getMinutes()
  }
}
