export const sortOptions = [
  {
    label: 'Price: Low to High',
    value: { sortAttribute: 'price', sortDirection: 'asc' },
  },
  {
    label: 'Price: High to Low',
    value: { sortAttribute: 'price', sortDirection: 'desc' },
  },
  {
    label: 'High rating first',
    value: { sortAttribute: '', sortDirection: 'desc' }, //not implemented on the backend yet
  },
  {
    label: 'Low rating first',
    value: { sortAttribute: '', sortDirection: 'asc' }, //not implemented on the backend yet
  },
  {
    label: 'Best Sellers',
    value: { sortAttribute: '', sortDirection: 'asc' }, //not implemented on the backend yet
  },
] as const
 