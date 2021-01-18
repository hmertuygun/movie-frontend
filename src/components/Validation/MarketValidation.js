export default function validateFields(values) {
  let errors = {}

  Object.keys(values).forEach(function (el) {
    values[el] = parseFloat(values[el])
  })

  if (!values.quantity || values.quantity === 0) {
    errors.quantity = 'Quantity is required'
  }

  return errors
}
