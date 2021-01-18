export default function validateFields(values) {
  let errors = {}

  Object.keys(values).forEach(function (el) {
    values[el] = parseFloat(values[el])
  })

  if (!values.quantity || values.quantity === 0) {
    errors.quantity = 'Quantity is required'
  }

  if (values.quantity && values.selectedSymbolLastPrice) {
    if (values.total < values.minNotional) {
      errors.total = 'Total needs to meet min-trading-total'
    }
    if (values.total > values.balance) {
      errors.total = 'Total can not exceed your balance.'
    }
  }
  return errors
}
