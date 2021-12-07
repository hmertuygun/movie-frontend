/* eslint-disable no-loop-func */
import React, {
  useState,
  useEffect,
  useMemo,
  useContext,
  useCallback,
  useRef,
} from 'react'
import Select from 'react-select'
import { Popover } from 'react-tiny-popover'
import {
  Plus,
  ChevronDown,
  MoreHorizontal,
  Flag,
  Edit,
  Slash,
} from 'react-feather'

import WatchListItem from './components/WatchListItem'
import styles from './WatchListPanel.module.css'
import { useSymbolContext } from './context/SymbolContext'
import { UserContext } from '../contexts/UserContext'
import { orderBy } from 'lodash'
import { firebase } from '../firebase/firebase'
import AddWatchListModal from './AddWatchListModal'
import AddEmojiModal from './AddEmojiModal'
import {
  successNotification,
  errorNotification,
} from '../components/Notifications'
import { exchangeCreationOptions } from '../constants/ExchangeOptions'
import { WATCHLIST_INIT_STATE, DEFAULT_WATCHLIST } from '../constants/Trade'
import { ccxtClass } from '../constants/ccxtConfigs'

const WatchListPanel = () => {
  const {
    symbols,
    symbolDetails,
    templateDrawingsOpen,
    setSymbol,
    emojis,
    handleSaveEmojis,
    selectEmojiPopoverOpen,
    setSelectEmojiPopoverOpen,
  } = useSymbolContext()
  const { userData, isPaidUser } = useContext(UserContext)

  const [selectPopoverOpen, setSelectPopoverOpen] = useState(false)
  const [watchListPopoverOpen, setWatchListPopoverOpen] = useState(false)
  const [watchListOptionPopoverOpen, setWatchListOptionPopoverOpen] =
    useState(false)
  const [addWatchListModalOpen, setAddWatchListModalOpen] = useState(false)
  const [addEmojiModalOpen, setAddEmojiModalOpen] = useState(false)
  const [addWatchListLoading, setAddWatchListLoading] = useState(false)
  const [watchLists, setWatchLists] = useState([])
  const [activeWatchList, setActiveWatchList] = useState()
  const [marketData, setMarketData] = useState([])
  const [watchSymbolsList, setWatchSymbolsList] = useState([])
  const [loading, setLoading] = useState(false)
  const [symbolsList, setSymbolsList] = useState([])
  const symbolsSelectRef = useRef(null)
  const [templateWatchlist, setTemplateWatchlist] = useState()
  const [orderSetting, setOrderSetting] = useState({
    label: 'asc',
  })
  const [isGroupByFlag, setIsGroupByFlag] = useState(false)
  const [isEmojiDeleted, setIsEmojiDeleted] = useState([])

  const db = firebase.firestore()
  const FieldValue = firebase.firestore.FieldValue
  const { activeExchange } = useContext(UserContext)

  const initWatchList = useCallback(() => {
    try {
      db.collection('watch_list')
        .doc(userData.email)
        .set(WATCHLIST_INIT_STATE, { merge: true })
    } catch (err) {
      console.log(err)
    }
  }, [userData.email, db])

  useEffect(() => {
    if (!templateDrawingsOpen) {
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
                  setWatchSymbolsList(
                    activeList?.[activeExchange.exchange] ?? []
                  )
                  setActiveWatchList(activeList)
                  // if (
                  //   activeList?.[activeExchange.exchange] &&
                  //   activeList?.[activeExchange.exchange][0]
                  // ) {
                  //   setSymbol(activeList?.[activeExchange.exchange][0])
                  // }
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
    } else {
      try {
        setLoading(true)
        db.collection('watch_list')
          .doc('sheldonthesniper01@gmail.com')
          .onSnapshot((snapshot) => {
            if (snapshot.data()) {
              const lists = Object.keys(snapshot.data()?.lists)
              setWatchLists(snapshot.data()?.lists)
              const listsData = Object.values(snapshot.data()?.lists)

              setTemplateWatchlist(listsData)
              if (lists.length === 0) {
                // TODO IF SHELDONS WATCH LIST IS EMPTY
              } else {
                const activeList = listsData.find(
                  (list) => list.watchListName === snapshot.data()?.activeList
                )

                if (activeList) {
                  setWatchSymbolsList(activeList?.['binance'] ?? [])
                  setActiveWatchList(activeList)
                  if (activeList?.['binance'] && activeList?.['binance'][0]) {
                    setSymbol(activeList?.['binance'][0])
                  }
                }
              }
            }
          })
      } catch (error) {
        console.log(`Cannot fetch Sniper's watch lists`)
      } finally {
        setLoading(false)
      }
    }
  }, [
    activeExchange.exchange,
    initWatchList,
    userData.email,
    templateDrawingsOpen,
    db,
  ])

  const useInterval = (callback, delay) => {
    const savedCallback = React.useRef()

    useEffect(() => {
      savedCallback.current = callback
    }, [callback])

    useEffect(() => {
      function tick() {
        savedCallback.current()
      }
      if (delay !== null) {
        let id = setInterval(tick, delay)
        return () => clearInterval(id)
      }
    }, [delay])
  }

  useInterval(async () => {
    const symbolArray = []
    for (const symbol of watchSymbolsList) {
      let previousData = {}
      const activeMarketData = marketData[symbol.value.replace('/', '')]

      const tickSize = symbolDetails?.[symbol.value]?.tickSize
      if (!activeMarketData?.last) {
        previousData = symbolsList.find((curr) => symbol.value === curr.value)
      }

      symbolArray.push({
        ...symbol,
        percentage: activeMarketData?.percentage
          ? +activeMarketData?.percentage
          : previousData?.percentage
          ? previousData?.percentage
          : 0,
        last: activeMarketData?.last
          ? parseFloat(activeMarketData?.last)?.toFixed(tickSize)
          : previousData?.last
          ? previousData?.last
          : '',
      })
    }

    setLoading(false)
    setSymbolsList(symbolArray)
  }, 1000)

  async function loop(exchange, symbol) {
    while (true) {
      try {
        const ticker = await exchange.watchTicker(symbol)
        setMarketData((prevState) => {
          return {
            ...prevState,
            [`${exchange.id.toUpperCase()}:${symbol.replace('/', '')}`]: ticker,
          }
        })
      } catch (e) {
        console.log(e)
        break
      }
    }
  }

  useEffect(() => {
    let obj = {}
    let id = null
    watchSymbolsList.forEach((sy) => {
      let exc = sy.value.split(':')[0].toLowerCase()
      if (obj[exc]) {
        obj[exc].push(sy.label.replace('-', '/'))
      } else {
        obj[exc] = [sy.label.replace('-', '/')]
      }
    })
    if (obj?.bybit?.length) {
      var socket = new WebSocket('wss://stream.bybit.com/spot/quote/ws/v2')
      socket.onopen = function (event) {
        obj['bybit'].forEach((element) => {
          socket.send(
            JSON.stringify({
              topic: 'realtimes',
              event: 'sub',
              params: {
                symbol: element.replace('/', ''),
                binary: false,
              },
            })
          )
        })
      }
      socket.onmessage = function (event) {
        const { data } = JSON.parse(event.data)
        if (data) {
          setMarketData((prevState) => {
            return {
              ...prevState,
              [`BYBIT:${data.s}`]: { last: data.c, percentage: data.m },
            }
          })
        }
      }
      socket.onerror = (err) => {
        console.log(err)
      }

      id = setInterval(() => {
        socket.send(JSON.stringify({ ping: 1535975085052 }))
      }, 25000)
    }
    return () => {
      if (socket && id) {
        socket.close()
        clearInterval(id)
      }
    }
  }, [watchSymbolsList])

  const setItems = useCallback(async () => {
    let obj = {}
    watchSymbolsList.forEach((sy) => {
      let exc = sy.value.split(':')[0].toLowerCase()
      if (obj[exc]) {
        obj[exc].push(sy.label.replace('-', '/'))
      } else {
        obj[exc] = [sy.label.replace('-', '/')]
      }
    })

    for (const [key, value] of Object.entries(obj)) {
      const ccxtExchange = ccxtClass[key]
      if (ccxtExchange.has['watchTicker'] && key !== 'bybit') {
        Promise.all(value.map((symbol) => loop(ccxtExchange, symbol)))
      }
    }
  }, [watchSymbolsList])

  const getLogo = (symbol) => {
    const exchange = symbol.value.split(':')[0].toLowerCase()
    const obj = exchangeCreationOptions.find((sy) => sy.value === exchange)
    return obj.logo
  }

  useEffect(() => {
    setItems()
  }, [watchSymbolsList, setItems])

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
    const selected = symbols.filter(
      (symbol) => !symbolsList.some((item) => item.value === symbol.value)
    )
    const finalOptions =
      selected &&
      selected.map((item) => {
        return {
          ...item,
          searchLabel: `${item.base_asset}${item.quote_asset}`,
        }
      })
    return finalOptions
  }, [symbols, symbolsList])

  const handleChange = async (symbol) => {
    const symbols = [...symbolsList, { ...symbol, flag: 0 }].map((item) => ({
      label: item.label,
      value: item.value,
      flag: item.flag,
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
        description: `Cannot create watch lists, Please try again later.`,
      })
    }
  }

  const handleEmojiAssigning = async (value) => {
    try {
      const selectedSymbol = localStorage
        .getItem('selectedSymbol')
        .toUpperCase()
      const selectedExchange = localStorage
        .getItem('selectedExchange')
        .toUpperCase()
      const list = symbolsList
        .map((item) => ({
          label: item.label,
          value: item.value,
          flag: item.flag ? item.flag : 0,
        }))
        .map((item) => {
          if (item.value === `${selectedExchange}:${selectedSymbol}`) {
            return {
              ...item,
              flag: value,
            }
          }
          return item
        })
      await db
        .collection('watch_list')
        .doc(userData.email)
        .set(
          {
            lists: {
              [activeWatchList.watchListName]: {
                [activeExchange.exchange]: list,
              },
            },
          },
          { merge: true }
        )
    } catch (error) {
      console.log(error)
      errorNotification.open({
        description: `Cannot add emoji, Please try again later.`,
      })
    }
  }

  const removeWatchList = async (symbol) => {
    const symbols = symbolsList
      .filter((item) => {
        return !(item.value === symbol.value)
      })
      .map((item) => ({
        label: item.label,
        value: item.value,
        flag: item.flag,
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

  const orderedSymbolsList = orderBy(
    symbolsList,
    [Object.keys(orderSetting)],
    [Object.values(orderSetting)]
  )

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

  const handleSaveEmoji = () => {
    handleSaveEmojis()
    setAddEmojiModalOpen(false)
    if (isEmojiDeleted.length) {
      handleEmojiDeleteAssigning()
      setIsEmojiDeleted([])
    }
  }

  const handleEmojiDeleteAssigning = async () => {
    const symbol = symbolsList.map((symbol) => {
      if (isEmojiDeleted.includes(symbol.flag)) {
        return { ...symbol, flag: 0 }
      }
      return symbol
    })
    const symbols = symbol.map((item) => ({
      label: item.label,
      value: item.value,
      flag: item.flag,
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
      console.log(error)
    }
  }

  const handleWatchListItemClick = (watchListName) => {
    if (!templateDrawingsOpen) {
      db.collection('watch_list').doc(userData.email).set(
        {
          activeList: watchListName,
        },
        { merge: true }
      )
    } else {
      const activeList = templateWatchlist.find(
        (list) => list.watchListName === watchListName
      )
      setActiveWatchList(activeList)
      setWatchSymbolsList(activeList?.['binance'] ?? [])
      if (activeList?.['binance'] && activeList?.['binance'][0]) {
        setSymbol(activeList?.['binance'][0])
      }
    }
    setWatchListPopoverOpen(false)
  }

  const handleDelete = async () => {
    setWatchListOptionPopoverOpen(false)
    if (activeWatchList.watchListName === DEFAULT_WATCHLIST) {
      errorNotification.open({
        description: `Cannot delete Default Watchlist.`,
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

  let unassignedList = orderedSymbolsList.filter((lists) => lists.flag === 0)

  return (
    <div>
      <div
        className={`${styles.header} ${
          templateDrawingsOpen ? styles.headerFlex : ''
        }`}
      >
        {templateDrawingsOpen && (
          <span className={styles.headerTemplate}>
            You are viewing Sniper's watchlist.
          </span>
        )}
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
              {!templateDrawingsOpen && (
                <>
                  <div
                    className={styles.watchListRow}
                    onClick={() => {
                      setWatchListPopoverOpen(false)
                      setAddWatchListModalOpen(true)
                    }}
                  >
                    Create new list...
                  </div>
                </>
              )}
              {Object.keys(watchLists).map((list) => {
                return (
                  <div
                    key={list}
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
        {userData.email === 'sheldonthesniper01@gmail.com' &&
          !templateDrawingsOpen && (
            <Popover
              key="watchlist-emoji-popover"
              isOpen={selectEmojiPopoverOpen}
              positions={['bottom', 'top', 'right', 'left']}
              align="center"
              padding={10}
              reposition={false}
              onClickOutside={() => setSelectEmojiPopoverOpen(false)}
              content={({ position, nudgedLeft, nudgedTop }) => (
                <div className={styles.emojiPopover}>
                  <div className={styles.emojiContainer}>
                    <div className={styles.emojiWrapper}>
                      {emojis &&
                        emojis.map((emoji) => (
                          <div key={emoji.id}>
                            {emoji.emoji && (
                              <span
                                className={styles.selectedEmojiWrapper}
                                onClick={() => handleEmojiAssigning(emoji.id)}
                              >
                                {emoji.emoji}
                              </span>
                            )}
                          </div>
                        ))}
                    </div>
                    <span className={styles.settingsWrapper}>
                      <Edit onClick={() => setAddEmojiModalOpen(true)} />
                    </span>
                  </div>
                </div>
              )}
            >
              <div
                className={`${styles.watchListPlus} ${
                  styles.watchListControl
                } ${
                  selectEmojiPopoverOpen ? styles.watchListControlSelected : ''
                }`}
                onClick={() => {
                  setSelectEmojiPopoverOpen(true)
                }}
              >
                <Flag />
              </div>
            </Popover>
          )}
        {!templateDrawingsOpen && (
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
                  ref={symbolsSelectRef}
                  onChange={handleChange}
                  formatOptionLabel={(symbol) => (
                    <span>
                      <img
                        src={getLogo(symbol)}
                        style={{
                          width: '18px',
                          marginRight: '4px',
                          marginTop: '-2px',
                        }}
                      />
                      {symbol.label}
                    </span>
                  )}
                  styles={customStyles}
                  getOptionValue={(option) => option.searchLabel}
                />
              </div>
            )}
          >
            <div
              className={`${styles.watchListPlus} ${styles.watchListControl} ${
                selectPopoverOpen ? styles.watchListControlSelected : ''
              }`}
              onClick={() => {
                setSelectPopoverOpen(true)
                setTimeout(() => {
                  symbolsSelectRef?.current?.select?.focus()
                }, 0)
              }}
            >
              <Plus />
            </div>
          </Popover>
        )}
        {!templateDrawingsOpen ? (
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
                {userData.email === 'sheldonthesniper01@gmail.com' && (
                  <div
                    className={styles.watchListRow}
                    onClick={() => {
                      setIsGroupByFlag(!isGroupByFlag)
                      setWatchListOptionPopoverOpen(false)
                    }}
                  >
                    Group by flag
                  </div>
                )}
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
              className={`${styles.watchListOption} ${
                styles.watchListControl
              } ${
                watchListOptionPopoverOpen
                  ? styles.watchListControlSelected
                  : ''
              }`}
              onClick={() => setWatchListOptionPopoverOpen(true)}
            >
              <MoreHorizontal />
            </div>
          </Popover>
        ) : (
          isPaidUser && (
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
                    onClick={() => {
                      setIsGroupByFlag(!isGroupByFlag)
                      setWatchListOptionPopoverOpen(false)
                    }}
                  >
                    Group by flag
                  </div>
                </div>
              )}
            >
              <div
                className={`${styles.watchListOption} ${styles.groupMore} ${
                  styles.watchListControl
                } ${
                  watchListOptionPopoverOpen
                    ? styles.watchListControlSelected
                    : ''
                }`}
                onClick={() => setWatchListOptionPopoverOpen(true)}
              >
                <MoreHorizontal />
              </div>
            </Popover>
          )
        )}
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
      <div
        className={
          templateDrawingsOpen ? styles.watchLists2 : styles.watchLists
        }
      >
        {loading ? (
          <div className="pt-5 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            {(templateDrawingsOpen && isGroupByFlag) ||
            (userData.email === 'sheldonthesniper01@gmail.com' &&
              isGroupByFlag) ? (
              <>
                {emojis &&
                  emojis.map((emoji) => {
                    let list = orderedSymbolsList.filter(
                      (lists) => lists.flag === emoji.id
                    )
                    if (emoji.emoji) {
                      return (
                        <>
                          <div className={styles.groupEmojiWrapper}>
                            <span className={styles.groupEmoji}>
                              {emoji.emoji}
                            </span>
                            {list.map((symbol) => (
                              <WatchListItem
                                key={symbol.value}
                                symbol={symbol}
                                group={true}
                                removeWatchList={removeWatchList}
                              />
                            ))}
                          </div>
                        </>
                      )
                    }
                  })}
                <div className={styles.groupEmojiWrapper}>
                  <span className={styles.groupEmoji}>Unassigned</span>
                  {unassignedList &&
                    unassignedList.length > 0 &&
                    unassignedList.map((symbol) => (
                      <WatchListItem
                        key={symbol.value}
                        symbol={symbol}
                        group={true}
                        removeWatchList={removeWatchList}
                      />
                    ))}
                </div>
              </>
            ) : (
              orderedSymbolsList.map((symbol) => (
                <WatchListItem
                  key={symbol.value}
                  symbol={symbol}
                  removeWatchList={removeWatchList}
                />
              ))
            )}
          </>
        )}
      </div>
      {addWatchListModalOpen ? (
        <AddWatchListModal
          onClose={() => setAddWatchListModalOpen(false)}
          onSave={handleAddWatchList}
          isLoading={addWatchListLoading}
        />
      ) : null}
      {addEmojiModalOpen && (
        <AddEmojiModal
          onClose={() => setAddEmojiModalOpen(false)}
          onSave={handleSaveEmoji}
          setIsEmojiDeleted={setIsEmojiDeleted}
          isEmojiDeleted={isEmojiDeleted}
        />
      )}
    </div>
  )
}

export default WatchListPanel
