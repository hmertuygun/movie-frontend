import React from 'react'
import { useSymbolContext } from '../../context/SymbolContext'
import styles from './SymbolSelect.module.css'
import Select from 'react-dropdown-select'

const SymbolSelect = () => {
  const {
    exchanges,
    symbols,
    selectedSymbol,
    setSymbol,
    selectedExchange,
    isLoading,
    isLoadingBalance,
  } = useSymbolContext()

  if (isLoading) {
    return <div>Loading exchanges..</div>
  }

  const handleSearch = ({ state }) => {
    const filteredData = Object.values(symbols).filter((search) =>
      search.label
        .split('-')[0]
        .toLowerCase()
        .includes(state.search.toLowerCase())
    )
    if (!filteredData.length) {
      return Object.values(symbols).filter((search) =>
        search.label.toLowerCase().includes(state.search.toLowerCase())
      )
    }
    return filteredData
  }

  return (
    <div className={styles['SymbolSelect-Container']}>
      <div className={styles['Select-Container']}>
        <Select
          options={exchanges}
          values={[selectedExchange]}
          backspaceDelete={false}
        />
      </div>

      <div className={styles['Select-Container']}>
        <Select
          options={Object.values(symbols)}
          placeholder="Select trading pair"
          values={[selectedSymbol]}
          valueField="label"
          onChange={(value) => setSymbol(value[0])}
          disabled={isLoadingBalance}
          searchFn={handleSearch}
        />
      </div>
    </div>
  )
}

export default SymbolSelect
