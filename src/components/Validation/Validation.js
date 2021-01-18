export default function validateFields(values) {
  let errors = {}

  Object.keys(values).forEach(function (el) {
    values[el] = parseInt(values[el])
  })

  if (!values.price || values.price < 1) {
    errors.price = 'Price is require'
  }
  if (!values.quantity || values.quantity === 0) {
    errors.quantity = 'Quantity is require'
  }
  if (values.quantity && values.price) {
    if (values.total < values.minNotional) {
      errors.total = 'Total needs to meet min-trading-total'
    }
    if (values.total > values.balance) {
      errors.total = 'Total can not exceed your balance.'
    }
  }

  return errors
}

/*



  if (values.type === 'stoploss')
    console.log('validateFields called --> ', values.type)
  console.log('validateFields called --> ', values.validationFields)

  Object.keys(values.validationFields).forEach(function (el) {
    values.validationFields[el] = parseInt(values.validationFields[el])
  })
  console.log('stoploss validation : ', values.validationFields)

  if (values.total > values.balance) {
    errors.total = 'Total can not exceed your balance.'
  }


*/
