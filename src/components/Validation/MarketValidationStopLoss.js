export default function validateFields(values) {
  let errors = {}

  Object.keys(values).forEach(function (el) {
    values[el] = parseFloat(values[el])
  })

  if (!values.quantity || values.quantity === 0) {
    errors.quantity = 'Quantity is required'
  }

  if (values.quantity && values.selectedSymbolLastPrice) {

    if (values.quantity > values.entryQuantity) {
      errors.total = 'Quantity can not exceed your entry order.'
    }
  }
  return errors
}
