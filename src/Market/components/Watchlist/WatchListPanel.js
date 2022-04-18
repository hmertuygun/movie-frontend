/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-loop-func */
import React, { useState, useEffect, useContext, useCallback } from 'react'

import { Popover } from 'react-tiny-popover'
import { ChevronDown, MoreHorizontal, Flag, Edit } from 'react-feather'
import { useNotifications } from 'reapop'

import WatchListItem from '../WatchListItem'
import styles from './WatchListPanel.module.css'
import { useSymbolContext } from '../../../Trade/context/SymbolContext'
import { UserContext } from '../../../contexts/UserContext'
import { orderBy } from 'lodash'
import { firebase } from '../../../firebase/firebase'
import AddWatchListModal from '../AddWatchListModal'
import AddEmojiModal from '../AddEmojiModal'
import {
  WATCHLIST_INIT_STATE,
  DEFAULT_WATCHLIST,
} from '../../../constants/Trade'
import { ccxtClass } from '../../../constants/ccxtConfigs'
import {
  setWatchlistData,
  getSnapShotDocument,
} from '../../../api/firestoreCall'
import {
  execExchangeFunc,
  getExchangeProp,
} from '../../../helpers/getExchangeProp'
import { exchangeSystems } from '../../../constants/ExchangeOptions'
import NewWatchListItem from './NewWatchListItem'

const WatchListPanel = () => {
  const {
    symbolDetails,
    templateDrawingsOpen,
    setSymbol,
    activeTrader,
    emojis,
    handleSaveEmojis,
    selectEmojiPopoverOpen,
    setSelectEmojiPopoverOpen,
  } = useSymbolContext()
  const { userData, isPaidUser, isAnalyst } = useContext(UserContext)
  const { notify } = useNotifications()

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
      setWatchlistData(userData.email, WATCHLIST_INIT_STATE)
    } catch (err) {
      console.log(err)
    }
  }, [userData.email, db])

  useEffect(() => {
    if (!templateDrawingsOpen) {
      try {
        setLoading(true)
        getSnapShotDocument('watch_list', userData.email).onSnapshot(
          (snapshot) => {
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
          }
        )
      } catch (error) {
        console.log('Cannot fetch watch lists')
      } finally {
        setLoading(false)
      }
    } else {
      try {
        setLoading(true)
        getSnapShotDocument('watch_list', activeTrader.id).onSnapshot(
          (snapshot) => {
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
          }
        )
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
    activeTrader.id,
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

        let lastData = !ticker?.percentage
          ? execExchangeFunc(exchange.id, 'getLastAndPercent', {
              data: ticker,
            })
          : ticker
        setMarketData((prevState) => {
          return {
            ...prevState,
            [`${exchange.id.toUpperCase()}:${symbol.replace('/', '')}`]:
              lastData,
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
    let sockets = []

    watchSymbolsList.forEach((sy) => {
      let exc = sy.value.split(':')[0].toLowerCase()
      if (obj[exc]) {
        obj[exc].push(sy.label.replace('-', '/'))
      } else {
        obj[exc] = [sy.label.replace('-', '/')]
      }
    })

    let exchanges = [...new Set(Object.keys(obj))]

    exchanges.forEach((exchangeValue) => {
      if (!exchangeSystems.own.includes(exchangeValue)) return
      var socket = new WebSocket(
        getExchangeProp(exchangeValue, 'socketEndpoint')
      )

      socket.onopen = function (event) {
        obj[exchangeValue].forEach((element) => {
          let subData = execExchangeFunc(
            exchangeValue,
            'ticketSocketSubscribe',
            element
          )
          socket.send(subData)
        })
      }
      socket.onmessage = async function (event) {
        let data = {}
        let symbol = ''
        if (event.data instanceof Blob) {
          data = await execExchangeFunc(
            exchangeValue,
            'resolveGzip',
            event.data
          )
          data = execExchangeFunc(exchangeValue, 'getIncomingSocket', {
            sData: data,
          })
          if (data?.topic) symbol = data.topic.split('.')[1].toUpperCase()
        } else {
          data = execExchangeFunc(exchangeValue, 'getIncomingSocket', {
            sData: JSON.parse(event.data),
          })
          if (data?.s) symbol = data.s
        }
        if (data && symbol) {
          setMarketData((prevState) => {
            let evaluatedData = execExchangeFunc(
              exchangeValue,
              'getLastAndPercent',
              {
                data,
              }
            )
            return {
              ...prevState,
              [`${exchangeValue.toUpperCase()}:${symbol}`]: evaluatedData,
            }
          })
        }
      }

      socket.onerror = (err) => {
        console.log(err)
      }

      id = setInterval(() => {
        socket.send(JSON.stringify({ ping: 1535975085052 }))
      }, 10000)

      sockets.push({ socket, id })
    })

    return () => {
      if (sockets.length) {
        sockets.forEach((element) => {
          if (element.socket && element.id) {
            element.socket.close()
            clearInterval(element.id)
          }
        })
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
      if (
        ccxtExchange.has['watchTicker'] &&
        exchangeSystems.ccxt.includes(key)
      ) {
        Promise.all(value.map((symbol) => loop(ccxtExchange, symbol)))
      }
    }
  }, [watchSymbolsList])

  useEffect(() => {
    setItems()
  }, [watchSymbolsList, setItems])

  const handleChange = async (symbol) => {
    const symbols = [...symbolsList, { ...symbol, flag: 0 }].map((item) => ({
      label: item.label,
      value: item.value,
      flag: item.flag || 0,
    }))
    try {
      let data = {
        lists: {
          [activeWatchList.watchListName]: {
            [activeExchange.exchange]: symbols,
          },
        },
      }
      setWatchlistData(userData.email, data)
    } catch (error) {
      notify({
        status: 'error',
        title: 'Error',
        message: 'Cannot create watch lists, Please try again later.',
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
      let data = {
        lists: {
          [activeWatchList.watchListName]: {
            [activeExchange.exchange]: list,
          },
        },
      }
      await setWatchlistData(userData.email, data)
    } catch (error) {
      console.log(error)
      notify({
        status: 'error',
        title: 'Error',
        message: 'Cannot add emoji, Please try again later!',
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
        flag: item.flag || 0,
      }))
    try {
      let data = {
        lists: {
          [activeWatchList.watchListName]: {
            [activeExchange.exchange]: symbols,
          },
        },
      }
      setWatchlistData(userData.email, data)
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
      let data = {
        lists: {
          [watchListName]: { watchListName },
        },
      }
      setWatchlistData(userData.email, data)

      notify({
        status: 'success',
        title: 'Success',
        message: 'Watch list created!',
      })
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
      let data = {
        lists: {
          [activeWatchList.watchListName]: {
            [activeExchange.exchange]: symbols,
          },
        },
      }
      setWatchlistData(userData.email, data)
    } catch (error) {
      console.log(error)
    }
  }

  const handleWatchListItemClick = (watchListName) => {
    if (!templateDrawingsOpen) {
      let data = {
        activeList: watchListName,
      }
      setWatchlistData(userData.email, data)
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
      notify({
        status: 'error',
        title: 'Error',
        message: 'Cannot delete Default Watchlist.',
      })
      return
    }
    try {
      const ref = getSnapShotDocument('watch_list', userData.email)
      const filedName = `lists.${activeWatchList.watchListName}`
      await ref.update({
        [filedName]: FieldValue.delete(),
      })
      await ref.update({
        activeList: DEFAULT_WATCHLIST,
      })
      notify({
        status: 'success',
        title: 'Success',
        message: 'Watch list deleted!',
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
        {isAnalyst && !templateDrawingsOpen && (
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
              className={`${styles.watchListPlus} ${styles.watchListControl} ${
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
          <NewWatchListItem
            symbolsList={symbolsList}
            handleChange={handleChange}
          ></NewWatchListItem>
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
                {isAnalyst && (
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
            (isAnalyst && isGroupByFlag) ? (
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
                            {list.length ? (
                              list.map((symbol) => (
                                <WatchListItem
                                  key={symbol.value}
                                  symbol={symbol}
                                  group={true}
                                  removeWatchList={removeWatchList}
                                />
                              ))
                            ) : (
                              <p className="text-center">
                                No market assigned to this flag
                              </p>
                            )}
                          </div>
                        </>
                      )
                    }
                  })}
                {unassignedList && unassignedList.length > 0 && (
                  <div className={styles.groupEmojiWrapper}>
                    <span className={styles.groupEmoji}>Unassigned</span>
                    {unassignedList.map((symbol) => (
                      <WatchListItem
                        key={symbol.value}
                        symbol={symbol}
                        group={true}
                        removeWatchList={removeWatchList}
                      />
                    ))}
                  </div>
                )}
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
