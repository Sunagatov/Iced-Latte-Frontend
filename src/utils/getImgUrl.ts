import { StaticImageData } from 'next/image'

const MINIO_URL_STUB = 'default file'

export default function getImgUrl(
  minioUrl: string | null,
  localImage: StaticImageData,
): string | StaticImageData {
  if (typeof minioUrl === 'string' && minioUrl != MINIO_URL_STUB) {
    // Uncomment out when img loading optimization is ready IL-263
    // return minioUrl
  }

  return localImage
}
