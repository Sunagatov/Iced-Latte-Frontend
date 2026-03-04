import * as yup from 'yup'

export const filterProductsByPriceSchema = yup.object().shape({
  toPriceInput: yup.string().defined().matches(/^\d+$/, { excludeEmptyString: true, message: 'Invalid code format' }),
  fromPriceInput: yup.string().defined().matches(/^\d+$/, { excludeEmptyString: true, message: 'Invalid code format' }),
})
