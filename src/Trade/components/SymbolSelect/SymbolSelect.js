import React, { useState, useEffect, useContext } from 'react'
import { useSymbolContext } from '../../context/SymbolContext'
import { UserContext } from '../../../contexts/UserContext'
import styles from './SymbolSelect.module.css'
import Select from 'react-select'
import { matchSorter } from 'match-sorter'
import { useMediaQuery } from 'react-responsive'

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
    binanceDD,
    ftxDD,
  } = useSymbolContext()

  const { activeExchange } = useContext(UserContext)
  const [options, setOptions] = useState([])
  const [initialOptions, setInitialOptions] = useState([])

  const isMobile = useMediaQuery({ query: `(max-width: 991.98px)` })

  const customStyles = {
    control: (styles, { }) => ({
      ...styles,
      boxShadow: 'none',
      border: '4px solid var(--trade-borders)',
      backgroundColor: 'var(--trade-background)',
      borderLeft: !isMobile ? 0 : '',
      borderRadius: 0,
      height: '56px',
      minHeight: '56px',
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

    option: (styles, { isDisabled, isFocused, isSelected }) => ({
      ...styles,
      textTransform: 'capitalize',
      padding: '5px 5px',
      backgroundColor: isDisabled
        ? 'var(--trade-background)'
        : isSelected
          ? 'var(--symbol-select-background-selected)'
          : isFocused
            ? 'var(--symbol-select-background-focus)'
            : 'var(--trade-background)',
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
    if (!activeExchange?.exchange) return
    let { exchange } = activeExchange
    exchange = exchange.toLowerCase()
    const selected = exchange === "binance" ? binanceDD : exchange === "ftx" ? ftxDD : null
    setInitialOptions(selected)
    setOptions(selected)
  }, [binanceDD, ftxDD, activeExchange.exchange])

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
          isDisabled={isLoading}
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
