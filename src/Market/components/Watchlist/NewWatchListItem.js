/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useMemo, useEffect } from 'react'
import styles from './WatchListPanel.module.css'
import { useSymbolContext } from '../../../Trade/context/SymbolContext'
import { exchangeCreationOptions } from '../../../constants/ExchangeOptions'
import { Filter, Plus, Search, X } from 'react-feather'
import { Modal, Loader } from '../../../components'
import { Popover } from 'react-tiny-popover'
import { QuoteAssets } from '../../../constants/QuoteAssets'

const NewWatchListItem = ({ symbolsList, handleChange }) => {
  const [selectPopoverOpen, setSelectPopoverOpen] = useState(false)
  const { symbols } = useSymbolContext()
  const [selectedSymbols, setSelectedSymbols] = useState([])
  const [searchText, setSearchText] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState(
    exchangeCreationOptions[0].value // making Binance as default selected exchange
  )
  const [loading, setLoading] = useState(true)
  const [filteredItem, setFilteredItem] = useState([])
  const extractExchange = (symbol) => {
    return symbol.split(':')[0]
  }

  const updateFilter = (filter) => {
    if (filteredItem.includes(filter)) {
      const filterIndex = filteredItem.indexOf(filter)
      const newFilter = [...filteredItem]
      newFilter.splice(filterIndex, 1)
      setFilteredItem(newFilter)
    } else {
      setFilteredItem([...filteredItem, filter])
    }
  }

  const updatedSymbols = useMemo(() => {
    if (!symbols.length) return []
    setLoading(false)
    const selected = symbols
      .filter(
        (symbol) => !symbolsList.some((item) => item.value === symbol.value)
      )
      .filter((symbol) => {
        if (selectedTab !== 'all')
          return extractExchange(symbol.value).toLowerCase() === selectedTab
        return symbol
      })
      .filter((symbol) => {
        if (filteredItem.length > 0) {
          return filteredItem.includes(symbol.quote_asset)
        }
        return symbol
      })

    const filteredSymbols =
      selected &&
      selected.filter((symbol) => {
        const searchLabel =
          `${symbol.base_asset}${symbol.quote_asset}${symbol.value}`.toLowerCase()
        if (searchText !== '') {
          return searchLabel.includes(searchText.toLowerCase())
        }
        return symbol
      })
    return filteredSymbols
  }, [symbols, symbolsList, selectedTab, searchText, filteredItem])

  useEffect(() => {
    if (updatedSymbols?.length !== selectedSymbols.length)
      setSelectedSymbols(updatedSymbols)
  }, [updatedSymbols])

  const getLogo = (symbol) => {
    const exchange = extractExchange(symbol).toLowerCase()
    const obj = exchangeCreationOptions.find((sy) => sy.value === exchange)
    if (obj?.logo) return obj.logo
  }

  const isSelectedTab = (exchange) => {
    return selectedTab === extractExchange(exchange).toLowerCase()
  }

  const onModalClose = () => {
    setSearchText('')
    setSelectPopoverOpen(false)
  }

  return (
    <>
      <div
        className={`${styles.watchListPlus} ${styles.watchListControl} ${
          selectPopoverOpen ? styles.watchListControlSelected : ''
        }`}
        onClick={() => {
          setSelectPopoverOpen(true)
        }}
      >
        <Plus />
      </div>
      {selectPopoverOpen && (
        <Modal onClose={onModalClose}>
          <div className={styles.newWatchListModal}>
            <X onClick={onModalClose} className={styles.modalClose} />
            <div className={styles.watchlistModalHeader}>
              <div>Symbol Search</div>
              <div className={styles.exchangeTabs}>
                <span
                  className={
                    isSelectedTab('all')
                      ? 'badge badge-primary'
                      : 'badge badge-secondary'
                  }
                  onClick={() => setSelectedTab('all')}
                >
                  All
                </span>
                {exchangeCreationOptions.map((exchange) => {
                  return (
                    <span
                      className={
                        isSelectedTab(exchange.value)
                          ? 'badge badge-primary'
                          : 'badge badge-secondary'
                      }
                      onClick={() => setSelectedTab(exchange.value)}
                      key={exchange.value}
                    >
                      <img src={exchange.image} alt={exchange.label} />
                    </span>
                  )
                })}
              </div>
              <div className={styles.searchBox}>
                <input
                  placeholder="Search"
                  onChange={(e) => setSearchText(e.target.value)}
                  value={searchText}
                />
                <div className={styles.icons}>
                  {searchText && <X onClick={() => setSearchText('')} />}
                  <Search />

                  <Popover
                    key="symbol-filter"
                    isOpen={isFilterOpen}
                    positions={['bottom', 'top', 'right']}
                    align="end"
                    padding={10}
                    reposition={false}
                    onClickOutside={() => setIsFilterOpen(false)}
                    content={({ position, nudgedLeft, nudgedTop }) => (
                      <div className={styles.filterPopover}>
                        {QuoteAssets.map((asset) => (
                          <div
                            className="custom-control custom-checkbox"
                            key={asset}
                          >
                            <input
                              type="checkbox"
                              class="custom-control-input"
                              id={asset}
                              data-toggle="indeterminate"
                              checked={filteredItem.includes(asset)}
                              onChange={() => updateFilter(asset)}
                            />
                            <label class="custom-control-label" htmlFor={asset}>
                              {asset}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  >
                    <Filter onClick={() => setIsFilterOpen(true)} />
                  </Popover>
                </div>
              </div>
            </div>

            <ul className={styles.searchResult}>
              <li>
                {loading ? (
                  <Loader />
                ) : (
                  <>
                    <p>Symbol</p>
                    <p>Exchange</p>
                  </>
                )}
                {!loading && selectedSymbols.length === 0 && (
                  <center>No Symbols found</center>
                )}
              </li>
              {selectedSymbols.map((symbol) => {
                return (
                  <li key={symbol.value}>
                    <p
                      className={styles.symbolLabel}
                      onClick={() => handleChange(symbol)}
                    >
                      {symbol.label}
                    </p>
                    <p>
                      <img src={getLogo(symbol.value)} alt="" />
                      {extractExchange(symbol.value)}
                    </p>
                  </li>
                )
              })}
            </ul>
          </div>
        </Modal>
      )}
    </>
  )
}

export default NewWatchListItem