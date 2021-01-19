export default function validateFields(values) {
  let errors = {}

  Object.keys(values).forEach(function (el) {
    values[el] = parseFloat(values[el])
  })

  if (!values.price) {
    errors.price = 'Price is required'
  }

  if (!values.quantity || values.quantity === 0) {
    errors.quantity = 'Quantity is required'
  }
  if (values.quantity && values.entryQuantity) {
    if (values.quantity > values.entryQuantity) {
      errors.total = 'Quantity cannot exceed entry quantity'
    }
  }

  return errors
}
