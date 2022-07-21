/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-loop-func */
import React, { useState, useEffect, useCallback } from 'react'
import { notify } from 'reapop'
import { orderBy } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'

import WatchListItem from './WatchListItem'
import { AddEmoji, AddWatchList, NewWatchListItem } from '../components/Modals'
import { GroupByFlag, CreateNewList, EmojiList } from '../components/Popovers'

import { useSymbolContext } from 'contexts/SymbolContext'
import { WATCHLIST_INIT_STATE, DEFAULT_WATCHLIST } from 'constants/Trade'
import { ccxtClass } from 'constants/ccxtConfigs'
import { exchangeSystems } from 'constants/ExchangeOptions'
import { INFO } from 'constants/Info'

import { firebase } from 'services/firebase'
import { setWatchlistData, getSnapShotDocument, saveEmojis } from 'services/api'
import {
  getIncomingSocket,
  getLastAndPercent,
  resolveGzip,
} from 'services/exchanges'
import { watchPanelSocket } from 'services/websocket'
import { consoleLogger } from 'utils/logger'

import sortTemplate from 'utils/sortTemplate'

import styles from '../css/WatchListPanel.module.css'
import { updateSelectEmojiPopoverOpen } from 'store/actions'
import MESSAGES from 'constants/Messages'

const WatchListPanel = () => {
  const { setSymbol } = useSymbolContext()
  const { emojis, selectEmojiPopoverOpen } = useSelector(
    (state) => state.emojis
  )
  const { templateDrawingsOpen } = useSelector((state) => state.templates)
  const { activeTrader } = useSelector((state) => state.trades)
  const { isPaidUser } = useSelector((state) => state.subscriptions)
  const { activeExchange } = useSelector((state) => state.exchanges)
  const { userData, isAnalyst } = useSelector((state) => state.users)

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
  const FieldValue = firebase.firestore.FieldValue
  const dispatch = useDispatch()

  const initWatchList = useCallback(() => {
    try {
      setWatchlistData(userData.email, WATCHLIST_INIT_STATE)
    } catch (err) {
      consoleLogger(err)
    }
  }, [userData.email])

  const updateWhenNoTemplates = () => {
    getSnapShotDocument('watch_list', userData.email).onSnapshot((snapshot) => {
      if (snapshot.data()) {
        if (!snapshot.data()?.lists) {
          initWatchList()
          return
        }
        const lists = Object.keys(snapshot.data()?.lists)
        setWatchLists(snapshot.data()?.lists)
        const listsData = Object.values(snapshot.data()?.lists)

        if (lists.length === 0) initWatchList()
        else {
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
  }

  const updateWhenTemplateOpen = () => {
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
              const items = Object.values(activeList).filter(
                (element) => typeof element === 'object'
              )
              const mergedItems = [].concat
                .apply([], items)
                .filter(
                  (v, i, a) => a.findIndex((v2) => v2.value === v.value) === i
                )
              setWatchSymbolsList(mergedItems ?? [])
              setActiveWatchList(activeList)
              if (mergedItems && mergedItems[0]) {
                setSymbol(mergedItems[0])
              }
            }
          }
        }
      }
    )
  }

  useEffect(() => {
    setLoading(true)
    if (!templateDrawingsOpen) {
      try {
        updateWhenNoTemplates()
      } catch (error) {
        consoleLogger(INFO['EMPTY_WATCH_LIST'])
      } finally {
        setLoading(false)
      }
    } else {
      try {
        updateWhenTemplateOpen()
      } catch (error) {
        consoleLogger(INFO['EMPTY_SNIPERS_LIST'])
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

      const tickSize = 4
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
          ? getLastAndPercent(exchange.id, { data: ticker })
          : ticker
        setMarketData((prevState) => {
          return {
            ...prevState,
            [`${exchange.id.toUpperCase()}:${symbol.replace('/', '')}`]:
              lastData,
          }
        })
      } catch (e) {
        consoleLogger(e)
        break
      }
    }
  }

  const getWatchSymbolsList = () => {
    let obj = {}
    watchSymbolsList.forEach((sy) => {
      let exc = sy.value.split(':')[0].toLowerCase()
      if (obj[exc]) {
        obj[exc].push(sy.label.replace('-', '/'))
      } else {
        obj[exc] = [sy.label.replace('-', '/')]
      }
    })
    return obj
  }

  useEffect(() => {
    let obj = getWatchSymbolsList()
    let sockets = []
    let exchanges = [...new Set(Object.keys(obj))]

    exchanges.forEach((exchangeValue) => {
      if (!exchangeSystems.own.includes(exchangeValue)) return

      watchPanelSocket({
        exchange: exchangeValue,
        symbolList: obj,
      }).then(({ ws, id }) => {
        ws.onmessage = async (msg) => {
          let data = {}
          let symbol = ''
          if (msg.data instanceof Blob) {
            data = await resolveGzip(msg.data)
            data = await getIncomingSocket(exchangeValue, data)
            if (data?.topic) symbol = data.topic.split('.')[1].toUpperCase()
          } else {
            data = await getIncomingSocket(exchangeValue, JSON.parse(msg.data))
            if (data?.s) symbol = data.s
          }
          if (data && symbol) {
            setMarketData((prevState) => {
              let evaluatedData = getLastAndPercent(exchangeValue, { data })
              return {
                ...prevState,
                [`${exchangeValue.toUpperCase()}:${symbol}`]: evaluatedData,
              }
            })
          }
        }
        sockets.push({
          exchange: exchangeValue,
          socket: ws,
          id: id,
        })
      })
    })

    return () => {
      if (sockets.length) {
        sockets.forEach(({ socket, id }) => {
          if (socket && id) {
            socket.close()
            clearInterval(id)
          }
        })
      }
    }
  }, [watchSymbolsList])

  const setItems = useCallback(async () => {
    let obj = getWatchSymbolsList()
    if (!obj) return
    for (const [key, value] of Object.entries(obj)) {
      const ccxtExchange = ccxtClass[key]
      if (
        ccxtExchange &&
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
      dispatch(notify(MESSAGES['watchlist-failed'], 'error'))
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
      consoleLogger(error)
      dispatch(notify(MESSAGES['emoji-failed'], 'error'))
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
      consoleLogger('Cannot save watch lists')
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

      dispatch(notify(MESSAGES['watchlist-created'], 'success'))
      setAddWatchListModalOpen(false)
    } catch (error) {
      consoleLogger('Cannot save watch lists')
    } finally {
      setAddWatchListLoading(false)
    }
  }

  const handleSaveEmoji = () => {
    saveEmojis(emojis, userData)
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
      consoleLogger(error)
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
      if (activeList) {
        const items = Object.values(activeList).filter(
          (element) => typeof element === 'object'
        )
        const mergedItems = [].concat
          .apply([], items)
          .filter((v, i, a) => a.findIndex((v2) => v2.value === v.value) === i)
        setWatchSymbolsList(mergedItems ?? [])
        setActiveWatchList(activeList)
        if (mergedItems && mergedItems[0]) {
          setSymbol(mergedItems[0])
        }
      }
    }
    setWatchListPopoverOpen(false)
  }

  const handleDelete = async () => {
    setWatchListOptionPopoverOpen(false)
    if (activeWatchList.watchListName === DEFAULT_WATCHLIST) {
      dispatch(notify(MESSAGES['delete-default-error'], 'error'))
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
      dispatch(notify(MESSAGES['delete-list-success'], 'success'))
    } catch (e) {
      consoleLogger(e)
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
        <CreateNewList
          styles={styles}
          isOpen={watchListPopoverOpen}
          setWatchListOpen={setWatchListPopoverOpen}
          openWatchListModal={setAddWatchListModalOpen}
          isTemplateDrawingsOpen={templateDrawingsOpen}
          watchLists={watchLists}
          handleWatchListItemClick={handleWatchListItemClick}
          activeWatchList={activeWatchList}
        ></CreateNewList>

        {isAnalyst && !templateDrawingsOpen && (
          <EmojiList
            styles={styles}
            isOpen={selectEmojiPopoverOpen}
            setEmojiListOpen={updateSelectEmojiPopoverOpen}
            emojis={emojis}
            handleEmojiAssigning={handleEmojiAssigning}
            setAddEmojiModalOpen={setAddEmojiModalOpen}
          ></EmojiList>
        )}
        {!templateDrawingsOpen && (
          <NewWatchListItem
            symbolsList={symbolsList}
            handleChange={handleChange}
          ></NewWatchListItem>
        )}
        {!templateDrawingsOpen ? (
          <GroupByFlag
            styles={styles}
            isOpen={watchListOptionPopoverOpen}
            setPopoverOpen={setWatchListOptionPopoverOpen}
            isAnalyst={isAnalyst}
            handleDelete={handleDelete}
            setGroupByFlag={setIsGroupByFlag}
            isPaidUser={false}
          ></GroupByFlag>
        ) : (
          isPaidUser && (
            <GroupByFlag
              styles={styles}
              isOpen={watchListOptionPopoverOpen}
              setPopoverOpen={setWatchListOptionPopoverOpen}
              isAnalyst={isAnalyst}
              handleDelete={handleDelete}
              setGroupByFlag={setIsGroupByFlag}
              isPaidUser={isPaidUser}
            ></GroupByFlag>
          )
        )}
      </div>
      <div className={styles.contentHeader}>
        <div
          onClick={() => handleOrderChange('label')}
          className={styles.labelColumn}
        >
          Symbol {sortTemplate(orderSetting.label)}
        </div>
        <div>Last</div>
        <div onClick={() => handleOrderChange('percentage')}>
          Chg% {sortTemplate(orderSetting.label)}
        </div>
      </div>
      <div
        className={
          templateDrawingsOpen ? styles.watchLists2 : styles.watchLists
        }
      >
        {!Object.keys(getWatchSymbolsList()).length && !loading ? (
          <div className="pt-5 text-center">
            <div className="text-primary" role="status">
              <span className="">Your watchlist is empty!</span>
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
        <AddWatchList
          onClose={() => setAddWatchListModalOpen(false)}
          onSave={handleAddWatchList}
          isLoading={addWatchListLoading}
        />
      ) : null}
      {addEmojiModalOpen && (
        <AddEmoji
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
