export default function validateFields(values) {
  let errors = {}

  Object.keys(values).forEach(function (el) {
    values[el] = parseFloat(values[el])
  })

  if (!values.quantity || values.quantity === 0) {
    errors.quantity = 'Quantity is required'
  }

  if (values.quantity > values.entryQuantity) {
    errors.total = 'Quantity can not exceed your entry order.'
  }

  if (values.totalQuantity + values.quantity >= values.entryQuantity) {
    errors.total = 'Target orders cannot exceed 100% of entry'
  }

  return errors
}
