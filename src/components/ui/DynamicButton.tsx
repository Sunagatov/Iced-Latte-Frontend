'use client'
type Props = {
  value: string
  onClick?: () => void
  className?: string
  children?: React.ReactNode
}
const DynamicButton = ({ value, ...props }: Props) => {
  return (
    <>
      <button {...props} type="submit">
        <span>{value}</span>
      </button>
    </>
  )
}

export default DynamicButton
