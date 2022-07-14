import { consoleLogger } from 'utils/logger'

export default function validateFields(values) {
  let errors = {}

  Object.keys(values).forEach(function (el) {
    values[el] = parseFloat(values[el])
  })

  consoleLogger('validations ', values)

  /*   if (!values.quantity || values.quantity === 0) {
    errors.quantity = 'Quantity is required'
  }

  if (values.quantity > values.entryQuantity) {
    errors.total = `Quantity can not exceed your entry order: ${values.maxQty}.000000`
  }

  if (values.totalQuantity + values.quantity >= values.entryQuantity) {
    errors.total = 'Target orders cannot exceed 100% of entry'
  } */

  if (!values.price) {
    errors.price = 'Price is required'
  } else if (values.price < values.minPrice) {
    errors.price = `Price needs to meet min-price-total: ${values.minPrice}`
  } else if (values.price > values.maxPrice) {
    errors.price = `Price needs to meet max-price-total: ${values.maxPrice}`
  } else if (!values.quantity) {
    errors.quantity = 'Quantity is required'
  } else if (values.quantity < values.minQty) {
    errors.quantity = `Amount needs to meet min-amount-total: ${values.minQty}`
  } else if (values.quantity > values.maxQty) {
    errors.quantity = `Amount needs to meet max-amount-total: ${values.maxQty}`
  } else if (values.quantity > values.entryQuantity) {
    errors.quantity = `Amount cannot be heigher than Entry Quantity: ${values.entryQuantity}`
  } else if (values.totalQuantity + values.quantity >= values.entryQuantity) {
    errors.total = 'Target orders cannot exceed 100% of entry'
  }

  return errors
}
