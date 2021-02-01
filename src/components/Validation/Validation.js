export default function validateFields(values) {
  let errors = {}

  Object.keys(values).forEach(function (el) {
    values[el] = parseFloat(values[el])
  })

  if (!values.price) {
    errors.price = 'Price is required'
  } else {
    if (values.price < values.minPrice) {
      errors.price = `Amount needs to meet min-price-total: ${values.minPrice}.000000`
    } else if (values.price > values.maxPrice) {
      errors.price = `Amount needs to meet min-price-total: ${values.maxPrice}.00`
    } else if (values.quantity < values.minQty) {
      errors.quantity = `Amount needs to meet min-amount-total: ${values.minQty}.000000`
    }

    if (!values.quantity) {
      errors.quantity = 'Quantity is required'
    } else if (values.quantity > values.maxQty) {
      errors.quantity = `Amount needs to meet max-amount-total: ${values.maxQty}.000000`
    } else if (values.total < values.minNotional) {
      errors.total = `Total needs to meet min-trading-total: ${values.minNotional}.000000`
    } else if (values.total > values.balance) {
      errors.total = 'Total cannot not exceed your balance.'
    }
  }

  return errors
}
