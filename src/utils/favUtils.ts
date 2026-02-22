export const handleFavouriteButtonClick = async (
  id: string,
  token: string | null,
  isFavourited: boolean,
  addFavourite: (id: string, token: string | null) => Promise<void>,
  removeFavourite: (id: string, token: string | null) => Promise<void>,
): Promise<void> => {
  try {
    if (isFavourited) {
      await removeFavourite(id, token)
    } else {
      await addFavourite(id, token)
    }
  } catch (error) {
    console.error('Error in handleFavouriteButtonClick:', error)
  }
}
