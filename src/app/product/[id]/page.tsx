import Image from 'next/image'
import productImage from '../../../../public/card_logo.png'
import star from '../../../../public/star.png'
import { IProduct } from '@/models/Products'
import { getProduct } from '@/services/apiService'
import { productRating, productSize } from '@/constants/product'
import AddToCartButton from '../_components/AddToCart'

type ProductProps = {
  params: {
    id: string
  }
}

async function getProductById(id: string): Promise<IProduct> {
  const result = await getProduct(id)

  return result
}

export default async function Page({ params }: ProductProps) {
  const product = await getProductById(params.id)

  return (
    <section
      className={
        'flex flex-col gap-[21px] md:flex-row md:justify-center md:gap-12'
      }
    >
      <Image
        src={productImage}
        width={500}
        height={500}
        alt="product_image"
        className={'m-auto md:m-0'}
      ></Image>
      <div className={'flex flex-col gap-6 px-4 pb-4 md:max-w-[532px]'}>
        <div
          className={'flex flex-col gap-[18px] sm:items-center md:items-start'}
        >
          <h2 className={'text-4XL'}>{product.name}</h2>
          <div className={'flex items-center gap-2 text-L'}>
            <Image src={star} alt="star" className={'inline-block'} />
            <span>{productRating}</span>
            <span className={'text-placeholder'}>
              &#x2022; {productSize} g.
            </span>
          </div>
        </div>
        <AddToCartButton product={product} />
        <p className={'text-XL font-medium md:mt-4'}>{product.description}</p>
      </div>
    </section>
  )
}
