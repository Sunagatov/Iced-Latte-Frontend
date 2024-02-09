export const handleFavouriteButtonClick = async (
  id: string,
  token: string | null,
  isInFavourites: boolean,
  isActive: boolean,
  addFavourite: (id: string, token: string | null) => Promise<void>,
  removeFavourite: (id: string, token: string | null) => Promise<void>,
): Promise<void> => {
  try {
    if (token) {
      // User is logged in
      if (isInFavourites) {
        await removeFavourite(id, token)
      } else {
        await addFavourite(id, token)
      }
    } else if (isActive) {
      // User is not logged in, but isActive
      await removeFavourite(id, token)
    } else {
      // User is not logged in and not isActive
      await addFavourite(id, token)
    }
  } catch (error) {
    console.error('Error in handleButtonClick:', error)
    throw error
  }
}
