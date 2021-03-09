import React, { useContext } from 'react'
import { useSymbolContext } from '../../context/SymbolContext'
import { UserContext } from '../../../contexts/UserContext'
import styles from './SymbolSelect.module.css'
import Select from 'react-dropdown-select'

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

  if (isLoading) {
    return null
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
          style={{ textTransform: 'capitalize' }}
          searchable={false}
          onChange={(value) => setExchange(value[0])}
          values={[activeExchange]}
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
