export default function validateFields(values) {
  let errors = {}

  if (values.price >= 0 && values.price < 10 && values.price !== '') {
    console.log('validate price ', values)
    errors.price = 'price should be higher 10 US'
  }

  if (values.tempBalance) {
    errors.balance = 'insufficient balance'
  }

  /*   if (!values.email) {
      errors.email = 'Email required'
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      errors.email = 'Email address is invalid'
    }
  
    */
  return errors
}
