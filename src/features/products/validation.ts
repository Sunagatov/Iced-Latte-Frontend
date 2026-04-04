import * as yup from 'yup'

export const filterProductsByPriceSchema = yup.object().shape({
  fromPriceInput: yup.string().defined().matches(/^\d*\.?\d*$/, { excludeEmptyString: true, message: 'Invalid price' }),
  toPriceInput: yup
    .string()
    .defined()
    .matches(/^\d*\.?\d*$/, { excludeEmptyString: true, message: 'Invalid price' })
    .test('max-gte-min', 'Min price cannot be greater than max price', function(to) {
      const from = this.parent.fromPriceInput as string | undefined

      if (!from || !to) return true

      return parseFloat(from) <= parseFloat(to as string)
    }),
})
