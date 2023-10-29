import ProductList from './_components/ProductList'

export default function Home() {
  return (
    <>
      <nav className={'h-[98px] bg-black'}></nav>
      <h1 className={'text-6XL w-[1144px] m-auto'}>All Coffee</h1>
      <ProductList />
    </>
  )
}
