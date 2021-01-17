export default function validateFields(values) {
  console.log('validateFields called --> ', values)
  let errors = {}

  /*   Object.keys(values).forEach(function (el) {
    values[el] = parseInt(values[el])
  }) */

  if (!values.price || values.price < 1) {
    errors.price = 'Price is require'
  }
  if (!values.quantity || values.quantity === 0) {
    errors.quantity = 'Quantity is require'
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
