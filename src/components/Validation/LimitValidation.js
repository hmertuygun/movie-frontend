export default function validateFields(values) {
  let errors = {}

  Object.keys(values).forEach(function (el) {
    values[el] = parseFloat(values[el])
  })

  if (!values.triggerPrice) {
    errors.triggerPrice = 'Please input Trigger Price'
  } else if (values.triggerPrice >= values.entryPrice) {
    errors.triggerPrice =
      'Trigger Price cannot be equal or higher than Entry Price'
  } else if (!values.price) {
    errors.price = 'Please input Price'
  } else if (values.price > values.triggerPrice) {
    errors.price = 'Price cannot be higher than Trigger Price'
  }

  if (values.quantity && values.selectedSymbolLastPrice) {
    if (values.total >= values.minNotional) {
      errors.total = 'Total needs to meet min-trading-total'
    }
    if (values.total > values.balance) {
      errors.total = 'Total can not exceed your balance.'
    }
  }
  return errors
}

