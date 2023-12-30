import { toast } from 'react-toastify'
export const showError = (error: unknown) => {
  if (error instanceof Error) {
    toast.error(`An error occurred: ${error.message}`)
  } else {
    toast.error(`An unknown error occurred`)
  }
}
