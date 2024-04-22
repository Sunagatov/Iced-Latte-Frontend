import Image from 'next/image'
import AddToCartButton from '../../../components/Product/AddToCart/AddToCart'
import HeartWrapper from '../../../components/Product/HeartWrapper/HeartWrapper'
import getImgUrl from '@/utils/getImgUrl'
import ReviewComponent from '@/components/Review/ReviewComponent/ReviewComponent'
import { IProduct } from '@/types/Products'
import { getProduct } from '@/services/apiService'
import { productRating, productSize } from '@/constants/product'

type ProductProps = {
  params: {
    id: string
  }
}

async function getProductById(id: string): Promise<IProduct> {
  const result = await getProduct(id)

  return result
}

export default async function Page({ params }: Readonly<ProductProps>) {
  const product = await getProductById(params.id)

  return (
    <section>
      <div
        className={
          'mx-5 flex flex-col items-center gap-[21px] sm:justify-center lg:flex-row xl:gap-12'
        }
      >
        <Image
          src={getImgUrl(product.productFileUrl, 'coffee.png')}
          width={500}
          height={500}
          alt="product_image"
          className={
            'max-w-full md:h-[500px] md:w-full md:object-cover xl:w-[500px] xl:object-contain'
          }
        />
        <div
          className={'flex flex-col justify-center gap-6 pb-4 lg:self-start'}
        >
          <div className={'flex flex-col gap-[18px] '}>
            <h2 className={'text-4XL'}>{product.name}</h2>
            <div className={'flex items-center gap-2 text-L'}>
              <Image src="star.png" alt="star" className={'inline-block'} />
              <span>{productRating}</span>
              <span className={'text-placeholder'}>
                &#x2022; {productSize} g.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AddToCartButton product={product} />
            <HeartWrapper id={product.id} className="ml-2" />
          </div>
          <p className={'text-XL font-medium md:mt-4'}>{product.description}</p>
        </div>
      </div>
      <div className="mx-5 mt-12 xl:mt-20">
        <ReviewComponent productId={product.id} />
      </div>
    </section>
  )
}
