/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { Filter, Plus, Search, X } from 'react-feather'
import { Popover } from 'react-tiny-popover'

import { Modal, Loader } from 'components'
import { QuoteAssets } from 'constants/QuoteAssets'
import styles from '../../css/WatchListPanel.module.css'
import { useDispatch, useSelector } from 'react-redux'
import { DEFAULT_ACTIVE_EXCHANGE } from 'constants/Default'
import { EXCHANGES } from 'constants/Exchanges'
import { getAllowedExchanges } from 'utils/exchangeSelection'
import { saveWatchList } from 'store/actions'
import { notify } from 'reapop'
import MESSAGES from 'constants/Messages'

const NewWatchListItem = () => {
  const [selectPopoverOpen, setSelectPopoverOpen] = useState(false)
  const { symbols } = useSelector((state) => state.symbols)
  const { isCanaryUser } = useSelector((state) => state.users)
  const { activeExchange } = useSelector((state) => state.exchanges)
  const { activeWatchList, symbolsList } = useSelector(
    (state) => state.watchlist
  )
  const [selectedSymbols, setSelectedSymbols] = useState([])
  const [searchText, setSearchText] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState(
    DEFAULT_ACTIVE_EXCHANGE[0].exchange // making Binance as default selected exchange
  )
  const [loading, setLoading] = useState(true)
  const [filteredItem, setFilteredItem] = useState([])
  const dispatch = useDispatch()

  const extractExchange = (symbol) => {
    if (symbol) return symbol.split(':')[0]
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

  const filteredExchanges = useMemo(() => {
    return Object.entries(EXCHANGES).filter(([exchangeName, exchange]) => {
      return getAllowedExchanges().some((item) => item.value === exchangeName)
    })
  }, [isCanaryUser])

  const updatedSymbols = useMemo(() => {
    if (!symbols.length) return []
    setLoading(false)
    const selected = symbols
      .filter((symbol) => {
        return getAllowedExchanges().some(
          (item) => item.value === extractExchange(symbol.value).toLowerCase()
        )
      })
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
    const obj = EXCHANGES[exchange]
    if (obj?.logo) return obj.logo
  }

  const isSelectedTab = useCallback(
    (exchange) => {
      if (exchange)
        return selectedTab === extractExchange(exchange).toLowerCase()
    },
    [selectedTab]
  )

  const onModalClose = () => {
    setSearchText('')
    setSelectPopoverOpen(false)
  }

  const handleChange = (symbol) => {
    const symbols = [...symbolsList, { ...symbol, flag: 0 }].map((item) => ({
      label: item.label,
      value: item.value,
      flag: item.flag || 0,
    }))
    try {
      const { watchListName } = activeWatchList
      const data = {
        lists: {
          [watchListName]: {
            watchListName: watchListName,
            [activeExchange.exchange]: symbols,
          },
        },
      }
      dispatch(saveWatchList(data))
    } catch (error) {
      dispatch(notify(MESSAGES['watchlist-failed'], 'error'))
    }
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
                {filteredExchanges.map(([exchangeName, exchange]) => {
                  return (
                    <span
                      className={
                        isSelectedTab(exchangeName)
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
                  className="form-control"
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
                              className="custom-control-input"
                              id={asset}
                              data-toggle="indeterminate"
                              checked={filteredItem.includes(asset)}
                              onChange={() => updateFilter(asset)}
                            />
                            <label
                              className="custom-control-label"
                              htmlFor={asset}
                            >
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
