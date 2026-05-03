type FiltersGroupTitleType = {
  title: string
}

const FiltersGroupTitle = ({ title }: Readonly<FiltersGroupTitleType>) => {
  return (
    <h3 className="mb-3 text-[13px] font-semibold text-black/70">
      {title}
    </h3>
  )
}

export default FiltersGroupTitle
