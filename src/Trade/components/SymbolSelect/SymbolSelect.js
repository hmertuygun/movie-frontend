import React, { useContext } from 'react'
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
    control: (styles, { }) => ({
      ...styles,
      padding: '0px',
      width: '300px',
      boxShadow: 'none',
      minHeight: '40px',
      textTransform: 'capitalize',
      '&:hover': {
        backgroundColor: '#d6ddea',
        cursor: 'pointer',
      },
    }),
    option: (provided, state) => ({
      ...provided,
      textTransform: 'capitalize',
      cursor: 'pointer',
    }),
  }

  return (
    <div className={styles['SymbolSelect-Container']}>
      <Select
        placeholder="Choose Exchange"
        value={activeExchange}
        isSearchable={false}
        components={{
          IndicatorSeparator: () => null,
        }}
        onChange={(value) => {
          setExchange(value)
        }}
        styles={customStyles}
        disabled={isLoading}
        options={exchanges}
      />
      <Select
        placeholder="Choose Exchange"
        value={selectedSymbol}
        components={{
          IndicatorSeparator: () => null,
        }}
        onChange={(value) => setSymbol(value)}
        styles={customStyles}
        disabled={isLoadingBalance || isLoading}
        options={Object.values(symbols)}
      />
    </div>
  )
}

export default SymbolSelect
