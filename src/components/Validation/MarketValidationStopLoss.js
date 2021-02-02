export default function validateFields(values) {
  let errors = {}

  Object.keys(values).forEach(function (el) {
    values[el] = parseFloat(values[el])
  })

  console.log('validation ', values)

  if (!values.triggerPrice) {
    errors.triggerPrice = 'Trigger Price is required'
  } else if (values.triggerPrice >= values.entryPrice) {
    errors.triggerPrice = `Trigger Price cannot be equal or higher than Entry Price: ${values.entryPrice}`
  } else if (!values.quantity) {
    errors.quantity = 'Quantity is required'
  } else if (values.quantity > values.entryQuantity) {
    errors.quantity = `Quantity can not exceed your entry order : ${values.entryQuantity}`
  } else if (values.quantity > values.entryQuantity) {
    errors.quantity = `Amount needs to meet the entry-amount: ${values.entryQuantity}`
  } else if (values.total <= values.minNotional) {
    errors.total = `Total needs to meet min-trading-total: ${values.minNotional}`
  }
  return errors
}
