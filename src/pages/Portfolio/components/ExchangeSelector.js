import { exchangeCreationOptions } from 'constants/ExchangeOptions'
import { PortfolioContext } from 'contexts/PortfolioContext'
import { useSymbolContext } from 'contexts/SymbolContext'
import { ThemeContext } from 'contexts/ThemeContext'
import { useContext } from 'react'
import Select from 'react-select'
import getLogo from 'utils/getExchangeLogo'

const customStyles = {}

const MultiValueLabel = (props) => {
  let selectedExchange = exchangeCreationOptions.find(
    (exchange) => exchange.value === props.data.exchange
  )
  return (
    <div className="d-flex align-items-center w-100 p-1">
      <img
        src={selectedExchange?.logo}
        alt={selectedExchange?.label}
        className="exchange-field-icon mr-2"
      />
      {props.data.apiKeyName}
    </div>
  )
}

const Option = (props) => {
  return (
    <div className="d-flex align-items-center w-100 p-1 ml-3">
      <div
        onClick={() => props.selectOption(props.data)}
        className="custom-control"
      >
        <input
          type="checkbox"
          className="custom-control-input"
          checked={props.isSelected}
        />
        <label className="custom-control-label">
          <span className="exchange-svg">
            <img
              style={{ width: '18px', marginRight: '4px', marginTop: '-2px' }}
              src={getLogo(props.data.exchange)}
              alt={props.data.exchange}
            ></img>
          </span>
          {props.data.apiKeyName}
        </label>
      </div>
    </div>
  )
}

const ExchangeSelector = ({ onChange }) => {
  const { exchanges } = useSymbolContext()
  const { theme } = useContext(ThemeContext)
  const { setSelectedExchanges, selectedExchanges, loading } =
    useContext(PortfolioContext)

  return (
    <Select
      closeMenuOnSelect={false}
      components={{ MultiValueLabel, Option }}
      isLoading={loading}
      styles={{
        ...customStyles,
        multiValueLabel: (base) => ({
          ...base,
        }),
        control: (base) => ({
          ...base,
          background: theme == 'DARK' ? '#2c4056' : base.backgroundColor,
          border:
            theme == 'DARK'
              ? '1px solid #223244'
              : `${base.borderWidth} ${base.borderStyle} ${base.borderColor}`,
        }),
        multiValue: (base) => ({
          ...base,
          background: theme == 'DARK' ? '#141d27' : base.backgroundColor,
          border:
            theme == 'DARK'
              ? '1px solid #223244'
              : `${base.borderWidth} ${base.borderStyle} ${base.borderColor}`,
        }),
        menu: (base) => ({
          ...base,
          background: theme == 'DARK' ? '#141d27' : base.backgroundColor,
          border:
            theme == 'DARK'
              ? '1px solid #223244'
              : `${base.borderWidth} ${base.borderStyle} ${base.borderColor}`,
        }),
      }}
      defaultValue={selectedExchanges[0]}
      hideSelectedOptions={false}
      onChange={(values) => setSelectedExchanges(values)}
      isMulti
      options={exchanges}
    />
  )
}

export default ExchangeSelector
