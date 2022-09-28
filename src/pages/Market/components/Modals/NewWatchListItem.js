/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useMemo, useEffect } from 'react'
import { Plus, Search, X } from 'react-feather'

import { Modal } from 'components'
import { QuoteAssets } from 'constants/QuoteAssets'
import styles from '../../css/WatchListPanel.module.css'
import { useDispatch, useSelector } from 'react-redux'
import { DEFAULT_ACTIVE_EXCHANGE } from 'constants/Default'
import { EXCHANGES } from 'constants/Exchanges'
import { getAllowedExchanges } from 'utils/exchangeSelection'
import { saveWatchList } from 'store/actions'
import { notify } from 'reapop'
import MESSAGES from 'constants/Messages'
import { ExchangeSelection, SearchFilter } from '../Popovers'

const NewWatchListItem = () => {
  const [selectPopoverOpen, setSelectPopoverOpen] = useState(false)
  const { symbols } = useSelector((state) => state.symbols)
  const { activeExchange } = useSelector((state) => state.exchanges)
  const { activeWatchList, symbolsList, watchLists } = useSelector(
    (state) => state.watchlist
  )
  const [selectedSymbols, setSelectedSymbols] = useState([])
  const [searchText, setSearchText] = useState('')
  const [selectedExchanges, setSelectedExchanges] = useState([
    DEFAULT_ACTIVE_EXCHANGE[0].exchange,
  ])
  const [filteredItem, setFilteredItem] = useState([])
  const dispatch = useDispatch()

  const extractExchange = (symbol) => {
    if (symbol) return symbol.split(':')[0]
  }

  const updatedSymbols = useMemo(() => {
    if (symbols.length < 2) return []
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
        if (!selectedExchanges.includes('all'))
          return selectedExchanges.includes(
            extractExchange(symbol.value).toLowerCase()
          )
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
        const updateText = searchText.replace('-', '').replace('/', '')
        const searchLabel =
          `${symbol.base_asset}${symbol.quote_asset}${symbol.value}`.toLowerCase()
        if (searchText !== '') {
          return searchLabel.includes(updateText.toLowerCase())
        }
        return symbol
      })
    return filteredSymbols
  }, [symbols, symbolsList, searchText, filteredItem])

  useEffect(() => {
    setSelectedSymbols(searchText.length > 2 ? updatedSymbols : [])
  }, [updatedSymbols, watchLists])

  const getLogo = (symbol) => {
    const exchange = extractExchange(symbol).toLowerCase()
    const obj = EXCHANGES[exchange]
    if (obj?.logo) return obj.logo
  }

  const onModalClose = () => {
    setSearchText('')
    setSelectPopoverOpen(false)
    setSelectedExchanges([DEFAULT_ACTIVE_EXCHANGE[0].exchange])
  }

  const updateLoading = (symbol, value) => {
    const symbolList = JSON.parse(JSON.stringify(selectedSymbols))
    const index = symbolList.findIndex((obj) => obj.value === symbol.value)
    symbolList[index].isLoading = true
    setSelectedSymbols(symbolList, value)
  }

  const handleChange = async (symbol) => {
    updateLoading(symbol, true)
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
      await dispatch(saveWatchList(data))
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
            <div className="modal-header">
              <div>Symbol Search</div>
              <X onClick={onModalClose} className={styles.modalClose} />
            </div>
            <div className={styles.watchlistModalHeader}>
              <ExchangeSelection
                selectedExchanges={selectedExchanges}
                setSelectedExchanges={setSelectedExchanges}
              />

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
                  <SearchFilter
                    filteredItem={filteredItem}
                    setFilteredItem={setFilteredItem}
                    QuoteAssets={QuoteAssets}
                  />
                </div>
              </div>
            </div>
            {selectedSymbols.length === 0 && (
              <p className={styles.searchMessage}>
                <center>
                  {searchText.length === 0
                    ? 'Search for the symbols'
                    : searchText.length < 3
                    ? 'Keyword should have at least 3 characters'
                    : selectedSymbols.length === 0 && 'No Symbols found'}
                </center>
              </p>
            )}
            <ul className={styles.searchResult}>
              <li>
                {searchText.length > 2 && selectedSymbols.length > 0 && (
                  <>
                    <p>Symbol</p>
                    <p>Exchange</p>
                  </>
                )}
              </li>
              {selectedSymbols.map((symbol) => {
                return (
                  <li key={symbol.value}>
                    <p className={styles.symbolLabel}>{symbol.label}</p>
                    <p>
                      <img src={getLogo(symbol.value)} alt="" />
                      {extractExchange(symbol.value)}
                    </p>

                    {symbol.isLoading ? (
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      ></span>
                    ) : (
                      <p
                        className={styles.actions}
                        onClick={() => handleChange(symbol)}
                      >
                        +
                      </p>
                    )}
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
