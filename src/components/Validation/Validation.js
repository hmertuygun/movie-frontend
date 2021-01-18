export default function validateFields(values) {
  let errors = {}

  Object.keys(values).forEach(function (el) {
    values[el] = parseFloat(values[el])
  })

  if (!values.price || values.price === 0) {
    console.log(values.price)
    errors.price = 'Price is required'
  }
  if (values.price > values.maxPrice) {
    errors.price = 'Price needs to meet max-price-total'
  }
  if (values.price < values.minPrice) {
    errors.price = 'Price needs to meet min-price-total'
  }

  if (!values.quantity || values.quantity === 0) {
    errors.quantity = 'Quantity is required'
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
