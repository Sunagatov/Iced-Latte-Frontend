type FiltersGroupTitleType = {
  title: string
}

const FiltersGroupTitle = ({ title }: Readonly<FiltersGroupTitleType>) => {
  return (
    <h3 className="mb-3 text-xs font-semibold tracking-widest text-black/40 uppercase">
      {title}
    </h3>
  )
}

export default FiltersGroupTitle
