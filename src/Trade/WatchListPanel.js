import React, {
  useState,
  useEffect,
  useMemo,
  useContext,
  useCallback,
} from 'react'
import Select from 'react-select'
import { Popover } from 'react-tiny-popover'
import { Plus, ChevronDown, MoreHorizontal } from 'react-feather'

import WatchListItem from './components/WatchListItem'
import styles from './WatchListPanel.module.css'
import { useSymbolContext } from './context/SymbolContext'
import { UserContext } from '../contexts/UserContext'
import { orderBy } from 'lodash'
import { firebase } from '../firebase/firebase'
import AddWatchListModal from './AddWatchListModal'
import {
  successNotification,
  errorNotification,
} from '../components/Notifications'

const DEFAULT_WATCHLIST = 'Watch List'

const WatchListPanel = () => {
  const { symbols, isLoading, isLoadingBalance, lastMessage, symbolDetails } =
    useSymbolContext()
  const { userData } = useContext(UserContext)

  const [selectPopoverOpen, setSelectPopoverOpen] = useState(false)
  const [watchListPopoverOpen, setWatchListPopoverOpen] = useState(false)
  const [watchListOptionPopoverOpen, setWatchListOptionPopoverOpen] =
    useState(false)
  const [addWatchListModalOpen, setAddWatchListModalOpen] = useState(false)
  const [addWatchListLoading, setAddWatchListLoading] = useState(false)
  const [watchLists, setWatchLists] = useState([])
  const [activeWatchList, setActiveWatchList] = useState()

  const [watchSymbolsList, setWatchSymbolsList] = useState([])
  const [loading, setLoading] = useState(false)
  const [symbolsList, setSymbolsList] = useState([])
  const [orderSetting, setOrderSetting] = useState({
    label: 'asc',
  })

  const db = firebase.firestore()
  const FieldValue = firebase.firestore.FieldValue
  const { activeExchange } = useContext(UserContext)

  const initWatchList = useCallback(() => {
    db.collection('watch_list')
      .doc(userData.email)
      .set(
        {
          activeList: DEFAULT_WATCHLIST,
          lists: { DEFAULT_WATCHLIST: { watchListName: DEFAULT_WATCHLIST } },
        },
        { merge: true }
      )
  }, [userData.email])

  useEffect(() => {
    try {
      setLoading(true)
      db.collection('watch_list')
        .doc(userData.email)
        .onSnapshot((snapshot) => {
          if (snapshot.data()) {
            if (!snapshot.data()?.lists) {
              initWatchList()
              return
            }
            const lists = Object.keys(snapshot.data()?.lists)
            setWatchLists(snapshot.data()?.lists)
            const listsData = Object.values(snapshot.data()?.lists)

            if (lists.length === 0) {
              initWatchList()
            } else {
              const activeList = listsData.find(
                (list) => list.watchListName === snapshot.data()?.activeList
              )

              if (activeList) {
                setWatchSymbolsList(activeList?.[activeExchange.exchange] ?? [])
                setActiveWatchList(activeList)
              }
            }
          } else {
            initWatchList()
            setWatchSymbolsList([])
          }
        })
    } catch (error) {
      console.log('Cannot fetch watch lists')
    } finally {
      setLoading(false)
    }
  }, [activeExchange.exchange, initWatchList, userData.email])

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
      backgroundColor: 'var(--modal-background)',
      border: 0,
      borderRadius: '4px',
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

    menu: (styles) => ({
      ...styles,
      margin: 0,
      background: 'var(--modal-background)',
    }),

    option: (styles, { isDisabled, isFocused, isSelected }) => ({
      ...styles,
      textTransform: 'capitalize',
      padding: '5px 5px',
      backgroundColor: isDisabled
        ? 'var(--modal-background)'
        : isSelected
        ? 'var(--symbol-select-background-selected)'
        : isFocused
        ? 'var(--symbol-select-background-focus)'
        : 'var(--modal-background)',
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
            lists: {
              [activeWatchList.watchListName]: {
                [activeExchange.exchange]: symbols,
              },
            },
          },
          { merge: true }
        )
    } catch (error) {
      errorNotification.open({
        description: `Cannot create watch lists, Please try again later!`,
      })
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
            lists: {
              [activeWatchList.watchListName]: {
                [activeExchange.exchange]: symbols,
              },
            },
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

  const handleAddWatchList = ({ watchListName }) => {
    setAddWatchListLoading(true)
    try {
      db.collection('watch_list')
        .doc(userData.email)
        .set(
          {
            lists: {
              [watchListName]: { watchListName },
            },
          },
          { merge: true }
        )
      successNotification.open({ description: `Watch list created!` })
      setAddWatchListModalOpen(false)
    } catch (error) {
      console.log('Cannot save watch lists')
    } finally {
      setAddWatchListLoading(false)
    }
  }

  const handleWatchListItemClick = (watchListName) => {
    db.collection('watch_list').doc(userData.email).set(
      {
        activeList: watchListName,
      },
      { merge: true }
    )
    setWatchListPopoverOpen(false)
  }

  const handleDelete = async () => {
    setWatchListOptionPopoverOpen(false)
    if (activeWatchList.watchListName === DEFAULT_WATCHLIST) {
      errorNotification.open({
        description: `Cannot delete Default Watch list!`,
      })
      return
    }
    try {
      const ref = db.collection('watch_list').doc(userData.email)
      const filedName = `lists.${activeWatchList.watchListName}`
      await ref.update({
        [filedName]: FieldValue.delete(),
      })
      await ref.update({
        activeList: DEFAULT_WATCHLIST,
      })
      successNotification.open({
        description: 'Watch list deleted!',
      })
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <div>
      <div className={styles.header}>
        <Popover
          key="watchlist-select-popover"
          isOpen={watchListPopoverOpen}
          positions={['bottom', 'top', 'right']}
          align="start"
          padding={10}
          reposition={false}
          onClickOutside={() => setWatchListPopoverOpen(false)}
          content={({ position, nudgedLeft, nudgedTop }) => (
            <div className={styles.watchListModal}>
              <div
                className={styles.watchListRow}
                onClick={() => {
                  setWatchListPopoverOpen(false)
                  setAddWatchListModalOpen(true)
                }}
              >
                Create new list...
              </div>
              {Object.keys(watchLists).map((list) => {
                return (
                  <div
                    className={styles.watchListRow}
                    onClick={() => handleWatchListItemClick(list)}
                  >
                    {list}
                  </div>
                )
              })}
            </div>
          )}
        >
          <div
            className={`${styles.watchListDropdown} ${
              styles.watchListControl
            } ${watchListPopoverOpen ? styles.watchListControlSelected : ''}`}
            onClick={() => setWatchListPopoverOpen(true)}
          >
            <span>{activeWatchList?.watchListName}</span>
            <ChevronDown size={15} style={{ marginLeft: '5px' }} />
          </div>
        </Popover>
        <Popover
          key="watchlist-creation-popover"
          isOpen={selectPopoverOpen}
          positions={['bottom', 'top', 'right', 'left']}
          align="end"
          padding={10}
          reposition={false}
          onClickOutside={() => setSelectPopoverOpen(false)}
          content={({ position, nudgedLeft, nudgedTop }) => (
            <div className={styles.newWatchListModal}>
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
          <div
            className={`${styles.watchListPlus} ${styles.watchListControl} ${
              selectPopoverOpen ? styles.watchListControlSelected : ''
            }`}
            onClick={() => setSelectPopoverOpen(true)}
          >
            <Plus />
          </div>
        </Popover>
        <Popover
          key="watchlist-option"
          isOpen={watchListOptionPopoverOpen}
          positions={['bottom', 'top', 'right']}
          align="end"
          padding={10}
          reposition={false}
          onClickOutside={() => setWatchListOptionPopoverOpen(false)}
          content={({ position, nudgedLeft, nudgedTop }) => (
            <div className={styles.watchListModal}>
              <div
                className={styles.watchListRow}
                onClick={() => handleDelete()}
              >
                Delete this list
              </div>
            </div>
          )}
        >
          <div
            className={`${styles.watchListOption} ${styles.watchListControl} ${
              watchListOptionPopoverOpen ? styles.watchListControlSelected : ''
            }`}
            onClick={() => setWatchListOptionPopoverOpen(true)}
          >
            <MoreHorizontal />
          </div>
        </Popover>
      </div>
      <div className={styles.contentHeader}>
        <div
          onClick={() => handleOrderChange('label')}
          className={styles.labelColumn}
        >
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
        {loading ? (
          <div className="pt-5 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        ) : (
          orderedSymbolsList.map((symbol) => (
            <WatchListItem
              key={symbol.value}
              symbol={symbol}
              removeWatchList={removeWatchList}
            />
          ))
        )}
      </div>
      {addWatchListModalOpen ? (
        <AddWatchListModal
          onClose={() => setAddWatchListModalOpen(false)}
          onSave={handleAddWatchList}
          isLoading={addWatchListLoading}
        />
      ) : null}
    </div>
  )
}

export default WatchListPanel
