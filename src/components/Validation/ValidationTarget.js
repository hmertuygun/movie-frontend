export default function validateFields(values) {
  let errors = {}

  Object.keys(values).forEach(function (el) {
    values[el] = parseFloat(values[el])
  })

  if (!values.price) {
    errors.price = 'Price is required'
  } else {
    if (values.price < values.minPrice) {
      errors.price = 'Price needs to meet min-price-total'
    }
    if (values.price > values.maxPrice) {
      errors.price = 'Price needs to meet max-price-total'
    }
  }
  if (values.quantity < values.minQty) {
    errors.quantity = 'Amount needs to meet min-amount-total'
  }

  if (values.quantity > values.maxQty) {
    errors.quantity = 'Amount needs to meet max-amount-total'
  }

  if (!values.quantity) {
    errors.quantity = 'Quantity is required'
  } else if (values.totalQuantity + values.quantity >= values.entryQuantity) {
    errors.total = 'Target orders cannot exceed 100% of entry'
  }

  return errors
}
