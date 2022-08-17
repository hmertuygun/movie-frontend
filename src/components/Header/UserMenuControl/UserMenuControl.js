import { components } from 'react-select'
import { EXCHANGES } from 'constants/Exchanges'

const UserMenuControl = ({ children, ...props }) => {
  const { value } = props.selectProps
  let selectedExchange = EXCHANGES[value.exchange]
  return (
    <components.Control {...props}>
      <div className="d-flex align-items-center w-100 ml-2">
        <div
          className="user-menu-dropdown"
          style={
            selectedExchange?.label === 'Kraken'
              ? { width: 18, height: 18 }
              : { width: 13, height: 13 }
          }
        >
          <img
            src={selectedExchange?.logo}
            alt={selectedExchange?.label}
            className="w-100"
          />
        </div>
        {children}
      </div>
    </components.Control>
  )
}

export default UserMenuControl
