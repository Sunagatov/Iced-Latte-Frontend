import { StaticImageData } from 'next/image'

const DEFAULT_STATIC_FILE_URL_VALUE = 'default file'

export default function getImgUrl(
  staticFileUrl: string | null | undefined,
  localImage: StaticImageData | string,
): string | StaticImageData {
  if (
    typeof staticFileUrl === 'string' &&
    staticFileUrl != DEFAULT_STATIC_FILE_URL_VALUE
  ) {
    // return staticFileUrl
  }

  return localImage
}
