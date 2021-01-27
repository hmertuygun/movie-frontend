export default function validateFields(values) {
  let errors = {}

  Object.keys(values).forEach(function (el) {
    values[el] = parseFloat(values[el])
  })

  if (values.triggerPrice >= values.entryPrice) {
    errors.triggerPrice = 'Trigger Price cannot be higher than Entry Price'
  }

  if (values.price > values.triggerPrice) {
    errors.price = 'Price cannot be higher than Trigger Price'
  }

  if (!values.price || !values.triggerPrice) {
    errors.price = 'Price cannot be empty'
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
