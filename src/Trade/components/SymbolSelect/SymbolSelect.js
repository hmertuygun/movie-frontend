import React, { useState, useEffect, useContext, useMemo } from 'react'
import { useSymbolContext } from '../../context/SymbolContext'
import { UserContext } from '../../../contexts/UserContext'
import styles from './SymbolSelect.module.css'
import Select from 'react-select'
import { useMediaQuery } from 'react-responsive'
import { bybit } from 'ccxt'

const SymbolSelect = ({ showOnlyMarketSelection }) => {
  const {
    exchanges,
    selectedSymbol,
    setSymbol,
    setExchange,
    isLoading,
    binanceDD,
    binanceUSDD,
    ftxDD,
    kucoinDD,
    bybitDD,
  } = useSymbolContext()

  const EXCHANGES = useMemo(() => {
    return {
      binance: binanceDD,
      binanceus: binanceUSDD,
      ftx: ftxDD,
      kucoin: kucoinDD,
      bybit: bybitDD,
    }
  }, [binanceDD, binanceUSDD, ftxDD, kucoinDD, bybitDD])

  const { activeExchange, isOnboardingSkipped } = useContext(UserContext)
  const [options, setOptions] = useState([])
  const [initialOptions, setInitialOptions] = useState([])

  const isMobile = useMediaQuery({ query: `(max-width: 991.98px)` })
  const isTablet = useMediaQuery({ query: `(max-width: 1230px)` })

  const customStyles = {
    control: (styles) => ({
      ...styles,
      boxShadow: 'none',
      border: '4px solid var(--trade-borders)',
      backgroundColor: 'var(--trade-background)',
      opacity: isLoading || isOnboardingSkipped ? 0.4 : 1,
      borderLeft: (!isMobile ? 0 : '') || (isOnboardingSkipped ? '' : 0),
      borderRadius: 0,
      height: isOnboardingSkipped && isTablet ? '52px' : '56px',
      minHeight: isOnboardingSkipped && isTablet ? '52px' : '56px',
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
    const selected = EXCHANGES[exchange]
    const finalOptions =
      selected &&
      selected.map((item) => {
        return {
          ...item,
          searchLabel: `${item.base_asset}${item.quote_asset}`,
        }
      })
    setInitialOptions(finalOptions)
    setOptions(finalOptions)
  }, [
    binanceDD,
    ftxDD,
    kucoinDD,
    bybitDD,
    activeExchange?.exchange,
    binanceUSDD,
    activeExchange,
    EXCHANGES,
  ])

  return (
    <div
      className={`${styles['SymbolSelect-Container']} ${
        showOnlyMarketSelection ? styles['Mobile-Symbol-Container'] : ''
      } ${isOnboardingSkipped ? styles['skipped-container'] : ''}`}
    >
      {!isOnboardingSkipped && (
        <div
          className={`${styles['Select-Container']} ${
            showOnlyMarketSelection
              ? styles['Mobile-Select-Container-Type']
              : ''
          }`}
        >
          <Select
            components={{
              IndicatorSeparator: () => null,
            }}
            options={exchanges}
            isSearchable={false}
            styles={customStyles}
            onChange={(value) => setExchange(value)}
            value={activeExchange}
            isDisabled={isLoading || isOnboardingSkipped}
          />
        </div>
      )}
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
          getOptionValue={(option) => option.searchLabel}
        />
      </div>
    </div>
  )
}

export default SymbolSelect
