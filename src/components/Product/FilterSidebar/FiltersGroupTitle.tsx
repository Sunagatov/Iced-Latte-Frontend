'use client'

type FiltersGroupTitleType = {
  title: string
}

const FiltersGroupTitle = ({ title }: Readonly<FiltersGroupTitleType>) => {
  return <h3 className="mb-4 text-2XL font-medium text-primary">{title}</h3>
}

export default FiltersGroupTitle
