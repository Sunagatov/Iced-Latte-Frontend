import * as yup from 'yup'

export const filterProductsByPriceSchema = yup.object().shape({
  toPriceInput: yup.string().matches(/^\d+$/, 'Invalid code format'),
  fromPriceInput: yup.string().matches(/^\d+$/, 'Invalid code format'),
})
