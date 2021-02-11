export default function validateFields(values) {
  let errors = {}

  Object.keys(values).forEach(function (el) {
    values[el] = parseFloat(values[el])
  })

  if (!values.quantity) {
    errors.quantity = 'Quantity is required'
  } else if (values.quantity > values.maxQty) {
    errors.quantity = `Amount needs to meet max-amount-total: ${values.maxQty}`
  } else if (values.total < values.minNotional) {
    errors.total = `Total needs to meet min-trading-total: ${values.minNotional}`
  } else if (values.total > values.balance) {
    errors.total = 'Total cannot not exceed your balance.'
  }

  return errors
}
