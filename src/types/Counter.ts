export type PropsCounter = {
  theme: 'dark' | 'light'
  className?: string
  count: number
  removeProduct: () => void
  addProduct: () => void
}
