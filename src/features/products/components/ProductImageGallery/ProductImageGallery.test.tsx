import { render, screen, fireEvent, act } from '@testing-library/react'
import ProductImageGallery from '@/features/products/components/ProductImageGallery/ProductImageGallery'

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}))
jest.mock('@/shared/utils/getImgUrl', () => ({
  __esModule: true,
  default: (url: string | null, fallback: string) => url ?? fallback,
}))

describe('ProductImageGallery', () => {
  it('renders single image without navigation', () => {
    render(
      <ProductImageGallery productFileUrl="/img.jpg" productName="Coffee" />,
    )
    expect(screen.getByAltText('Coffee')).toBeInTheDocument()
    expect(screen.queryByLabelText('Previous image')).not.toBeInTheDocument()
  })

  it('renders thumbnails and arrows for multiple images', () => {
    render(
      <ProductImageGallery
        productFileUrl={null}
        productImageUrls={['/a.jpg', '/b.jpg']}
        productName="Latte"
      />,
    )
    expect(screen.getByLabelText('Previous image')).toBeInTheDocument()
    expect(screen.getByLabelText('Next image')).toBeInTheDocument()
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
  })

  it('advances to next image on next button click', () => {
    render(
      <ProductImageGallery
        productFileUrl={null}
        productImageUrls={['/a.jpg', '/b.jpg']}
        productName="Latte"
      />,
    )
    fireEvent.click(screen.getByLabelText('Next image'))
    expect(screen.getByText('2 / 2')).toBeInTheDocument()
  })

  it('wraps around to last image on prev from first', () => {
    render(
      <ProductImageGallery
        productFileUrl={null}
        productImageUrls={['/a.jpg', '/b.jpg', '/c.jpg']}
        productName="Latte"
      />,
    )
    fireEvent.click(screen.getByLabelText('Previous image'))
    expect(screen.getByText('3 / 3')).toBeInTheDocument()
  })

  it('responds to ArrowRight keyboard event', () => {
    render(
      <ProductImageGallery
        productFileUrl={null}
        productImageUrls={['/a.jpg', '/b.jpg']}
        productName="Latte"
      />,
    )
    act(() => {
      fireEvent.keyDown(window, { key: 'ArrowRight' })
    })
    expect(screen.getByText('2 / 2')).toBeInTheDocument()
  })

  it('responds to ArrowLeft keyboard event', () => {
    render(
      <ProductImageGallery
        productFileUrl={null}
        productImageUrls={['/a.jpg', '/b.jpg']}
        productName="Latte"
      />,
    )
    act(() => {
      fireEvent.keyDown(window, { key: 'ArrowLeft' })
    })
    expect(screen.getByText('2 / 2')).toBeInTheDocument()
  })

  it('navigates via thumbnail click', () => {
    render(
      <ProductImageGallery
        productFileUrl={null}
        productImageUrls={['/a.jpg', '/b.jpg']}
        productName="Latte"
      />,
    )
    fireEvent.click(screen.getByLabelText('View image 2'))
    expect(screen.getByText('2 / 2')).toBeInTheDocument()
  })
})
