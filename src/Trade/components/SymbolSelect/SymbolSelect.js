import React from 'react'
import { useSymbolContext } from '../../context/SymbolContext'
import styles from './SymbolSelect.module.css'

const SymbolSelect = () => {
  const {
    exchanges,
    setExchange,
    symbols,
    selectedSymbol,
    setSymbol,
    selectedExchange,
    isLoading,
  } = useSymbolContext()

  const exchangeList = exchanges.map((exchange) => {
    return { label: exchange, value: exchange }
  })

  const symbolList = symbols.map((symbol) => {
    return { label: symbol["label"], value: symbol["value"] }
  })

  if (isLoading) {
    return <div>Loading exchanges..</div>
  }

  return (
    <div className={styles['SymbolSelect-Container']}>
      <div className={styles['Select-Container']}>
        <label className={styles['Select-Label']} htmlFor="exchanges-drop">
          select exchange
        </label>
        <select
          className={styles['Select-Select']}
          name="exchanges-drop"
          id="exchanges-drop"
          value={selectedExchange}
          onChange={(event) => {
            setExchange(event.target.value)
          }}
        >
          {exchangeList.map((exchange, index) => (
            <option key={index} value={exchange.value}>
              {exchange.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles['Select-Container']}>
        <label className={styles['Select-Label']} htmlFor="symbols-drop">
          select symbol
        </label>
        <select
          className={styles['Select-Select']}
          name="symbols-drop"
          id="symbols-drop"
          onChange={(event) => {
            setSymbol(event.target.value)
          }}
          value={selectedSymbol}
        >
          {symbolList.map((symbol, index) => (
            <option key={index} value={symbol.value}>
              {symbol.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default SymbolSelect
