import React, { useState, useEffect, useContext, useMemo } from 'react'
import { useSymbolContext } from '../../context/SymbolContext'
import { UserContext } from '../../../contexts/UserContext'
import styles from './SymbolSelect.module.css'
import Select from 'react-select'
import { customStyle } from '../../../styles/symbolSelect.custom'
import { useMediaQuery } from 'react-responsive'

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
    okexDD,
    huobiDD,
  } = useSymbolContext()
  const { activeExchange, isOnboardingSkipped } = useContext(UserContext)
  const [options, setOptions] = useState([])
  const allExchanges = useMemo(() => {
    return {
      binance: binanceDD,
      binanceus: binanceUSDD,
      ftx: ftxDD,
      kucoin: kucoinDD,
      bybit: bybitDD,
      huobipro: huobiDD,
      okex: okexDD,
    }
  }, [binanceDD, binanceUSDD, ftxDD, kucoinDD, bybitDD, huobiDD, okexDD])
  const isMobile = useMediaQuery({ query: `(max-width: 991.98px)` })
  const isTablet = useMediaQuery({ query: `(max-width: 1230px)` })

  useEffect(() => {
    if (!activeExchange?.exchange) return
    let { exchange } = activeExchange
    exchange = exchange.toLowerCase()
    const selected = allExchanges[exchange]
    const finalOptions =
      selected &&
      selected.map((item) => {
        return {
          ...item,
          searchLabel: `${item.base_asset}${item.quote_asset}`,
        }
      })
    setOptions(finalOptions)
  }, [
    binanceDD,
    ftxDD,
    kucoinDD,
    activeExchange?.exchange,
    binanceUSDD,
    bybitDD,
    okexDD,
    huobiDD,
    activeExchange,
    allExchanges,
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
            styles={customStyle(
              isLoading,
              isOnboardingSkipped,
              isTablet,
              isMobile
            )}
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
          styles={customStyle(
            isLoading,
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
