export default function validateFields(values) {
  let errors = {}

  Object.keys(values).forEach(function (el) {
    values[el] = parseFloat(values[el])
  })

  console.log('validation ', values)

  if (!values.triggerPrice) {
    errors.triggerPrice = 'Please input Trigger Price'
  } else if (values.triggerPrice >= values.entryPrice) {
    errors.triggerPrice =
      'Trigger Price cannot be equal or higher than Entry Price'
  } else if (!values.quantity || values.quantity === 0) {
    errors.quantity = 'Quantity is required'
  } else if (values.quantity && values.selectedSymbolLastPrice) {
    if (values.quantity > values.entryQuantity) {
      errors.total = 'Quantity can not exceed your entry order.'
    }
  } else if (values.total <= values.minNotional) {
    errors.total = 'Total needs to meet min-trading-total'
  } else if (values.total > values.balance) {
    errors.total = 'Total can not exceed your balance.'
  }
  return errors
}
