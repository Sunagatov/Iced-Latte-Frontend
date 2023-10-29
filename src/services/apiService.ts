export async function getAllProducts(url: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST_LOCAL}/${url}`)

  return res.json()
}
