export default function validateFields(values) {
  console.log('validateFields called --> ', values)
  let errors = {}

  if (!values.price) {
    errors.price = 'No price'
  }
  if (!values.quantity) {
    errors.quantity = 'No quantity'
  }
  if (values.quantity && values.price) {
    if (values.total < 10) {
      errors.total = 'Total Amount should be higher 10 US'
    }
  }

  return errors
}
