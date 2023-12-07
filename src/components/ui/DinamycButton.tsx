'use client'
type Props = {
  value: string
  onClick?: () => void
  className?: string
  children?: React.ReactNode
}

const ButtonSubmit = ({ value, ...props }: Props) => {
  return (
    <>
      <button {...props} type="button">
        <span>{value}</span>
      </button>
    </>
  )
}

export default ButtonSubmit
