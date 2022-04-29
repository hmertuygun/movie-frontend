import React, { useState, useEffect, useContext } from 'react'
import Select from 'react-select'
import { useSymbolContext } from 'contexts/SymbolContext'
import { UserContext } from 'contexts/UserContext'
import styles from './SymbolSelect.module.css'
import { useMediaQuery } from 'react-responsive'

import { customStyle } from 'styles'

const SymbolSelect = ({ showOnlyMarketSelection }) => {
  const {
    exchanges,
    selectedSymbol,
    setSymbol,
    setExchange,
    isLoading,
    activeDD,
    isExchangeLoading,
  } = useSymbolContext()
  const { activeExchange, isOnboardingSkipped } = useContext(UserContext)
  const [options, setOptions] = useState([])
  const isMobile = useMediaQuery({ query: `(max-width: 991.98px)` })
  const isTablet = useMediaQuery({ query: `(max-width: 1230px)` })

  useEffect(() => {
    if (!activeExchange?.exchange) return
    const finalOptions =
      activeDD &&
      activeDD.map((item) => {
        return {
          ...item,
          searchLabel: `${item.base_asset}${item.quote_asset}`,
        }
      })
    setOptions(finalOptions)
  }, [activeExchange?.exchange, activeExchange, activeDD])

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
          <span className={styles['Select-Title']}>Exchange</span>
          <Select
            components={{
              IndicatorSeparator: () => null,
            }}
            options={exchanges}
            isSearchable={false}
            styles={customStyle(
              isExchangeLoading,
              isOnboardingSkipped,
              isTablet,
              isMobile
            )}
            onChange={(value) => setExchange(value)}
            value={activeExchange}
            isDisabled={isExchangeLoading || isOnboardingSkipped}
          />
        </div>
      )}
      <div className={styles['Select-Container']}>
        <span className={styles['Select-Title']}>Symbol</span>
        <Select
          components={{
            IndicatorSeparator: () => null,
          }}
          options={options}
          placeholder="Select trading pair"
          value={selectedSymbol}
          onChange={(value) => setSymbol(value)}
          isDisabled={isExchangeLoading}
          styles={customStyle(
            isExchangeLoading,
            isOnboardingSkipped,
            isTablet,
            isMobile
          )}
          getOptionValue={(option) => option.searchLabel}
        />
      </div>
    </div>
  )
}

export default SymbolSelect
