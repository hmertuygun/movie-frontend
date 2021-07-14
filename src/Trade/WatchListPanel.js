import React, { useState, useEffect, useMemo, useContext } from 'react'
import Select from 'react-select'
import { Popover } from 'react-tiny-popover'
import { Plus } from 'react-feather'

import WatchListItem from './components/WatchListItem'
import styles from './WatchListPanel.module.css'
import { useSymbolContext } from './context/SymbolContext'
import { UserContext } from '../contexts/UserContext'
import { orderBy } from 'lodash'
import { firebase } from '../firebase/firebase'

const WatchListPanel = () => {
  const { symbols, isLoading, isLoadingBalance, lastMessage, symbolDetails } =
    useSymbolContext()
  const { userData } = useContext(UserContext)

  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [watchSymbolsList, setWatchSymbolsList] = useState([])
  const [loading, setLoading] = useState(false)
  const [symbolsList, setSymbolsList] = useState([])
  const [orderSetting, setOrderSetting] = useState({
    label: 'asc',
  })

  const db = firebase.firestore()
  const { activeExchange } = useContext(UserContext)

  useEffect(() => {
    try {
      setLoading(true)
      db.collection('watch_list')
        .doc(userData.email)
        .onSnapshot((snapshot) => {
          if (snapshot.data()?.[activeExchange.exchange]) {
            setWatchSymbolsList(snapshot.data()?.[activeExchange.exchange])
          } else {
            setWatchSymbolsList([])
          }
        })
    } catch (error) {
      console.log('Cannot fetch watch lists')
    } finally {
      setLoading(false)
    }
  }, [activeExchange.exchange, db, userData.email])

  useEffect(() => {
    const symbolArray = []
    for (const symbol of watchSymbolsList) {
      const activeMarketData = lastMessage.find((data) => {
        return data.symbol.replace('/', '') === symbol.label.replace('-', '')
      })

      const tickSize = symbolDetails?.[symbol.value]?.tickSize
      if (!activeMarketData?.lastPrice) {
        return
      }
      symbolArray.push({
        ...symbol,
        percentage: activeMarketData?.priceChangePercent,
        lastPrice: Number(activeMarketData?.lastPrice)?.toFixed(tickSize),
      })
    }

    setSymbolsList(symbolArray)
  }, [
    lastMessage,
    watchSymbolsList,
    symbolDetails,
    orderSetting.symbol,
    orderSetting.percentage,
  ])

  const customStyles = {
    control: (styles) => ({
      ...styles,
      boxShadow: 'none',
      border: '4px solid var(--trade-borders)',
      backgroundColor: 'var(--trade-background)',
      borderRadius: '2px',
      height: '45px',
      minHeight: '45px',
      color: 'var(--grey)',

      '&:hover': {
        cursor: 'pointer',
      },
    }),

    input: (styles) => ({
      ...styles,
      color: 'var(--grey)',
    }),

    valueContainer: (styles) => ({
      ...styles,
      height: '41px',
      padding: '0 5px',
    }),

    singleValue: (styles) => ({
      ...styles,
      textTransform: 'capitalize',
      color: 'var(--grey)',
    }),

    option: (styles, { isDisabled, isFocused, isSelected }) => ({
      ...styles,
      textTransform: 'capitalize',
      padding: '5px 5px',
      backgroundColor: isDisabled
        ? 'var(--trade-background)'
        : isSelected
        ? 'var(--symbol-select-background-selected)'
        : isFocused
        ? 'var(--symbol-select-background-focus)'
        : 'var(--trade-background)',
      color: 'var(--grey)',

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
      .filter((symbol) => {
        const exchangeString = symbol.value.split(':')?.[0]?.toLowerCase()
        return exchangeString === exchange
      })
      .filter(
        (symbol) => !symbolsList.some((item) => item.value === symbol.value)
      )
    return selected
  }, [symbols, activeExchange, symbolsList])

  const handleChange = async (symbol) => {
    const symbols = [...symbolsList, symbol].map((item) => ({
      label: item.label,
      value: item.value,
    }))
    try {
      db.collection('watch_list')
        .doc(userData.email)
        .set(
          {
            [activeExchange.exchange]: symbols,
          },
          { merge: true }
        )
    } catch (error) {
      console.log('Cannot save watch lists')
    }
  }

  const removeWatchList = async (symbol) => {
    const symbols = symbolsList
      .filter((item) => {
        return !(item.label === symbol.label && item.value === symbol.value)
      })
      .map((item) => ({
        label: item.label,
        value: item.value,
      }))
    try {
      db.collection('watch_list')
        .doc(userData.email)
        .set(
          {
            [activeExchange.exchange]: symbols,
          },
          { merge: true }
        )
    } catch (error) {
      console.log('Cannot save watch lists')
    }
  }

  const handleOrderChange = (orderItem) => {
    setOrderSetting((setting) => {
      switch (orderItem) {
        case 'label':
          return {
            label: setting.label === 'asc' ? 'desc' : 'asc',
          }

        case 'percentage':
          return {
            percentage: setting.percentage === 'asc' ? 'desc' : 'asc',
          }

        default:
          break
      }
    })
  }

  const orderedSymbolsList = useMemo(() => {
    const orderedSymbolsList = orderBy(
      symbolsList,
      [Object.keys(orderSetting)],
      [Object.values(orderSetting)]
    )

    return orderedSymbolsList
  }, [orderSetting, symbolsList])

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
        <div onClick={() => handleOrderChange('label')}>
          Symbol{' '}
          {orderSetting.label ? (
            orderSetting.label === 'asc' ? (
              <span className="fa fa-sort-amount-up-alt" />
            ) : (
              <span className="fa fa-sort-amount-down" />
            )
          ) : null}
        </div>
        <div>Last</div>
        <div onClick={() => handleOrderChange('percentage')}>
          Chg%
          {orderSetting.percentage ? (
            orderSetting.percentage === 'asc' ? (
              <span className="fa fa-sort-amount-up-alt" />
            ) : (
              <span className="fa fa-sort-amount-down" />
            )
          ) : null}
        </div>
      </div>
      <div>
        {loading && (
          <div className="pt-5 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        )}
        {orderedSymbolsList.map((symbol) => (
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
