export default function validateFields(values) {
  let errors = {}

  Object.keys(values).forEach(function (el) {
    values[el] = parseFloat(values[el])
  })

  if (!values.triggerPrice) {
    errors.triggerPrice = 'Trigger Price is require'
  } else if (values.triggerPrice >= values.entryPrice) {
    errors.triggerPrice = `Trigger Price cannot be equal or higher than Entry Price: ${values.entryPrice}.00`
  } else if (!values.price) {
    errors.price = 'Price is require'
  } else if (values.price > values.triggerPrice) {
    errors.price = 'Price cannot be higher than Trigger Price'
  } else if (values.total <= values.minNotional) {
    errors.total = `Total needs to meet min-trading-total: ${values.minNotional}.00000000`
  } else if (values.quantity > values.entryQuantity) {
    errors.quantity = `Amount needs to meet the entry-amount: ${values.entryQuantity}`
  } else if (values.quantity > values.entryQuantity) {
    errors.quantity = `Total needs to meet min-trading-total: ${values.entryQuantity}`
  } /* else if (values.total > values.balance) {
    errors.total = 'Total can not exceed your balance.'
  } */

  return errors
}
