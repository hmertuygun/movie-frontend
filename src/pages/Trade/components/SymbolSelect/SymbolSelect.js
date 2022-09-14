import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Select from 'react-select'
import { useSymbolContext } from 'contexts/SymbolContext'
import styles from './SymbolSelect.module.css'
import { useMediaQuery } from 'react-responsive'

import { customStyle } from 'styles'
import { useDispatch, useSelector } from 'react-redux'
import { updateExchangeKey } from 'store/actions'

const SymbolSelect = ({ showOnlyMarketSelection }) => {
  const { setSymbol } = useSymbolContext()
  const { selectedSymbol } = useSelector((state) => state.symbols)
  const { exchanges, isExchangeLoading, activeDD, activeExchange } =
    useSelector((state) => state.exchanges)
  const { userData } = useSelector((state) => state.users)
  const dispatch = useDispatch()
  const { isOnboardingSkipped } = useSelector((state) => state.appFlow)
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
            onChange={(value) =>
              dispatch(
                updateExchangeKey(value, setSymbol, activeExchange, userData)
              )
            }
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

SymbolSelect.propTypes = {
  showOnlyMarketSelection: PropTypes.func,
}

export default SymbolSelect
