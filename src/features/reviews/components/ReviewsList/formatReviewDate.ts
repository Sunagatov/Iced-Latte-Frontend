// This function takes a date string and returns an object with formatted date and time properties. If the input is null, it returns 'N/A' for the date and an empty string for the time. Otherwise, it formats the date as "DD.MM.YYYY" and the time as "HH:MM".

//  "YYYY-MM-DDThh:mm:ss.sssZ" -> dd.mm.yyyy and hh:mm

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
