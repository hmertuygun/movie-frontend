import React from 'react'
import { useSymbolContext } from '../../context/SymbolContext'
import styles from './SymbolSelect.module.css'
import Select from 'react-dropdown-select';

const SymbolSelect = () => {
  const {
    exchanges,
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
        <Select options={exchangeList} 
        values={ [selectedExchange] }
        backspaceDelete={false} />
      </div>

      <div className={styles['Select-Container']}>
        <Select options={symbolList} 
        values={ [selectedSymbol] }
        onChange={(value) => setSymbol(value[0])}
        backspaceDelete={false} />
      </div>
    </div>
  )
}

export default SymbolSelect
