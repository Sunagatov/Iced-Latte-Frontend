export default function createImgUrl(url: string | null): string | null {
  if (url === 'default file' || !url) {
    return null
  }

  return url
}
