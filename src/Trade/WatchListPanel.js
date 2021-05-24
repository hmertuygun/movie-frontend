import React, { useState, useEffect, useMemo, useContext } from 'react'
import Select from 'react-select'
import { Popover } from 'react-tiny-popover'
import { Plus } from 'react-feather'

import WatchListItem from './components/WatchListItem'
import styles from './WatchListPanel.module.css'
import { useSymbolContext } from './context/SymbolContext'
import { UserContext } from '../contexts/UserContext'
import { getWatchLists, saveWatchLists } from '../api/api'

const WatchListPanel = () => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [watchSymbols, setWatchSymbols] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const getWatchListsData = async () => {
      setLoading(true)
      try {
        const response = await getWatchLists()
        setWatchSymbols(response.data.data)
      } catch (error) {
        console.log('Cannot fetch watch lists')
      } finally {
        setLoading(false)
      }
    }
    getWatchListsData()
  }, [])

  const {
    symbols,
    isLoading,
    isLoadingBalance,
  } = useSymbolContext()

  const { activeExchange } = useContext(UserContext)

  const customStyles = {
    control: (styles, {}) => ({
      ...styles,
      boxShadow: 'none',
      border: '1px solid rgb(204, 204, 204)',
      borderRadius: '2px',
      height: '45px',
      minHeight: '45px',
      color: '#718096',

      '&:hover': {
        cursor: 'pointer',
      },
    }),

    valueContainer: (styles) => ({
      ...styles,
      height: '41px',
      padding: '0 5px',
    }),

    singleValue: (styles) => ({
      ...styles,
      textTransform: 'capitalize',
      color: '#718096',
    }),

    option: (styles) => ({
      ...styles,
      textTransform: 'capitalize',
      padding: '5px 5px',

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

  const selectedSymbols = useMemo(() => {
    const { exchange } = activeExchange
    const selected = symbols
      .filter((symbol) =>
        symbol.value.toLowerCase().includes(exchange.toLowerCase())
      )
      .filter(
        (symbol) => !watchSymbols.some((item) => item.value === symbol.value)
      )
    return selected
  }, [symbols, activeExchange, watchSymbols])

  const handleChange = async (symbol) => {
    const symbols = [...watchSymbols, symbol]
    try {
      await saveWatchLists(symbols)
      setWatchSymbols(symbols)
    } catch (error) {
      console.log('Cannot save watch lists')
    }
  }

  const removeWatchList = async (symbol) => {
    const symbols = watchSymbols.filter((item) => {
      return !(item.label === symbol.label && item.value === symbol.value)
    })
    try {
      await saveWatchLists(symbols)
      setWatchSymbols(symbols)
    } catch (error) {
      console.log('Cannot save watch lists')
    }
  }

  return (
    <div>
      <div className={styles.header}>
        <div>WatchList</div>
        <Popover
          isOpen={isPopoverOpen}
          positions={['bottom', 'top', 'right', 'left']}
          padding={10}
          reposition={false}
          onClickOutside={() => setIsPopoverOpen(false)}
          content={({ position, nudgedLeft, nudgedTop }) => (
            <div className={styles.modal}>
              <Select
                components={{
                  IndicatorSeparator: () => null,
                }}
                options={Object.values(selectedSymbols)}
                placeholder="Search"
                onChange={handleChange}
                isDisabled={isLoadingBalance || isLoading}
                styles={customStyles}
              />
            </div>
          )}
        >
          <Plus onClick={() => setIsPopoverOpen(true)} />
        </Popover>
      </div>
      <div className={styles.contentHeader}>
        <div>Symbol</div>
        <div>Chg%</div>
      </div>
      <div className={styles.content}>
        {loading && (
          <div className="pt-5 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        )}
        {watchSymbols.map((symbol) => (
          <WatchListItem
            key={symbol.value}
            symbol={symbol}
            removeWatchList={removeWatchList}
          />
        ))}
      </div>
    </div>
  )
}

export default WatchListPanel