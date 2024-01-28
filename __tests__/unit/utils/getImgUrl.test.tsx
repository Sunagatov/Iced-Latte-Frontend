import getImgUrl from '../../../src/utils/getImgUrl'
import productImg from '../../../../public/coffee.png'

describe('getImgUrl', () => {
  /* Uncomment out when img loading optimization is ready IL-263

  it('should return minio url when url is not empty and not a stub', () => {
    const VALID_URL = "https://host:port/tmp_path"
    expect(getImgUrl(VALID_URL, productImg)).toBe(VALID_URL)
  })
  */

  it('should return local image when url is a stub', () => {
    expect(getImgUrl("default file", productImg)).toBe(productImg)
  })

  it('should return local image when url is null', () => {
    expect(getImgUrl(null, productImg)).toBe(productImg)
  })
})