import React, { useState, useEffect, useContext } from 'react'
import { useSymbolContext } from '../../context/SymbolContext'
import { UserContext } from '../../../contexts/UserContext'
import styles from './SymbolSelect.module.css'
import Select from 'react-select'
import { matchSorter } from 'match-sorter'

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
  const [options, setOptions] = useState([])
  const [initialOptions, setInitialOptions] = useState([])

  const customStyles = {
    control: (styles, {}) => ({
      ...styles,
      boxShadow: 'none',
      border: '4px solid var(--trade-borders)',
      backgroundColor: 'var(--trade-background)',
      borderLeft: 0,
      borderTop: 0,
      borderBottom: 0,
      borderRadius: 0,
      height: '48px',
      minHeight: '48px',
      color: 'var(--grey)',

      '&:hover': {
        cursor: 'pointer',
      },
    }),

    input: (styles) => ({
      ...styles,
      color: 'var(--grey)',
    }),

    valueContainer: (styles) => ({
      ...styles,
      height: '41px',
      padding: '0 5px',
    }),

    singleValue: (styles) => ({
      ...styles,
      textTransform: 'capitalize',
      color: 'var(--grey)',
    }),

    option: (styles) => ({
      ...styles,
      textTransform: 'capitalize',
      padding: '5px 5px',
      backgroundColor: 'var(--trade-background)',
      color: 'var(--grey)',

      '&:hover': {
        cursor: 'pointer',
      },
    }),

    placeholder: (styles) => ({
      ...styles,
      textTransform: 'capitalize',
    }),

    indicatorsContainer: (styles) => ({
      ...styles,
      height: '41px',
    }),
  }

  useEffect(() => {
    const { exchange } = activeExchange
    const selected = symbols.filter((symbol) =>
      symbol.value.toLowerCase().includes(exchange.toLowerCase())
    )
    setInitialOptions(selected)
    setOptions(selected)
  }, [symbols, activeExchange.exchange])

  return (
    <div className={styles['SymbolSelect-Container']}>
      <div className={styles['Select-Container']}>
        <Select
          components={{
            IndicatorSeparator: () => null,
          }}
          options={exchanges}
          isSearchable={false}
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
          options={options}
          placeholder="Select trading pair"
          value={selectedSymbol}
          onChange={(value) => setSymbol(value)}
          isDisabled={isLoadingBalance || isLoading}
          styles={customStyles}
          onInputChange={(inputValue) => {
            setOptions(matchSorter(initialOptions, inputValue, { keys: ['label'] }))
          }}
        />
      </div>
    </div>
  )
}

export default SymbolSelect
