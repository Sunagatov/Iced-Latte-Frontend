type ProductProps = {
  params: {
    id: string
  }
}

const Product = ({ params }: ProductProps) => {
  return <h1>Product: {params.id}</h1>
}

export default Product
