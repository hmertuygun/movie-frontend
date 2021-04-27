import React, { useMemo, useContext } from 'react'
import { useSymbolContext } from '../../context/SymbolContext'
import { UserContext } from '../../../contexts/UserContext'
import styles from './SymbolSelect.module.css'
import Select from 'react-select'
const SymbolSelect = () => {
  const {
    exchanges,
    symbols,
    selectedSymbol,
    setSymbol,
    setExchange,
    selectedExchange,
    isLoading,
    isLoadingBalance,
  } = useSymbolContext()

  const { activeExchange } = useContext(UserContext)

  const customStyles = {
    control: (styles, {}) => ({
      ...styles,
      boxShadow: 'none',
      border: '1px solid rgb(204, 204, 204)',
      borderRadius: '2px',
      height: '45px',
      minHeight: '45px',
      color: '#718096',

      '&:hover': {
        cursor: 'pointer',
      },
    }),

    valueContainer: (styles) => ({
      ...styles,
      height: '41px',
      padding: '0 5px'
    }),

    singleValue: (styles) => ({
      ...styles,
      textTransform: 'capitalize',
      color: '#718096',
    }),
    
    option: (styles) => ({
      ...styles,
      textTransform: 'capitalize',
      padding: '5px 5px',

      '&:hover': {
        cursor: 'pointer',
      },
    }),

    placeholder: (styles) => ({
      ...styles,
      textTransform: 'capitalize'
    }),

    indicatorsContainer: (styles) => ({
      ...styles,
      height: '41px'
    }),
  }

  const selectedSymbols = useMemo(() => {
    const { exchange } = activeExchange
    const selected = symbols.filter((symbol) =>
      symbol.value.toLowerCase().includes(exchange.toLowerCase())
    )
    return selected
  }, [symbols, activeExchange])

  return (
    <div className={styles['SymbolSelect-Container']}>
      <div className={styles['Select-Container']}>
        <Select
          components={{
            IndicatorSeparator: () => null,
          }}
          options={exchanges}
          styles={customStyles}
          onChange={(value) => setExchange(value)}
          value={activeExchange}
          isDisabled={isLoading}
        />
      </div>

      <div className={styles['Select-Container']}>
        <Select
          components={{
            IndicatorSeparator: () => null,
          }}
          options={Object.values(selectedSymbols)}
          placeholder="Select trading pair"
          value={selectedSymbol}
          onChange={(value) => setSymbol(value)}
          isDisabled={isLoadingBalance || isLoading}
          styles={customStyles}
        />
      </div>
    </div>
  )
}

export default SymbolSelect
