import { components } from 'react-select'
import { exchangeCreationOptions } from 'constants/ExchangeOptions'

const UserMenuControl = ({ children, ...props }) => {
  const { value } = props.selectProps
  let selectedExchange = exchangeCreationOptions.find(
    (exchange) => exchange.value === value.exchange
  )
  return (
    <components.Control {...props}>
      <div className="d-flex align-items-center w-100 ml-2">
        <img
          src={selectedExchange?.logo}
          alt={selectedExchange?.label}
          className="exchange-field-icon"
        />
        {children}
      </div>
    </components.Control>
  )
}

export default UserMenuControl
