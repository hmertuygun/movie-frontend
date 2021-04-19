import React, { useMemo, useContext } from 'react'
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

  const customStyles = {
    control: (styles, {}) => ({
      ...styles,
      padding: '0px',
      width: '300px',
      boxShadow: 'none',
      minHeight: '36px',
      borderRadius: '2px',
      textTransform: 'capitalize',
      '&:hover': {
        backgroundColor: '#d6ddea',
        cursor: 'pointer',
      },
    }),
    option: (provided, state) => ({
      ...provided,
      textTransform: 'capitalize',
      cursor: 'pointer',
    }),
  }

  const selectedSymbols = useMemo(() => {
    const { exchange } = activeExchange
    const selected = symbols.filter((symbol) =>
      symbol.value.toLowerCase().includes(exchange.toLowerCase())
    )
    return selected
  }, [symbols, activeExchange])

  const handleSearch = ({ state }) => {
    const filteredData = Object.values(selectedSymbols).filter((search) =>
      search.label
        .split('-')[0]
        .toLowerCase()
        .includes(state.search.toLowerCase())
    )
    if (!filteredData.length) {
      return Object.values(selectedSymbols).filter((search) =>
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
          disabled={isLoading}
          backspaceDelete={false}
        />
      </div>

      <div className={styles['Select-Container']}>
        <Select
          options={Object.values(selectedSymbols)}
          placeholder="Select trading pair"
          values={[selectedSymbol]}
          onChange={(value) => setSymbol(value[0])}
          disabled={isLoadingBalance || isLoading}
          searchFn={handleSearch}
        />
      </div>
    </div>
  )
}

export default SymbolSelect
