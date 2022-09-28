/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-loop-func */
import React, { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { AddEmoji, AddWatchList, NewWatchListItem } from '../components/Modals'
import { GroupByFlag, CreateNewList, EmojiList } from '../components/Popovers'

import { useSymbolContext } from 'contexts/SymbolContext'
import { ccxtClass } from 'constants/ccxtConfigs'
import { exchangeSystems } from 'constants/ExchangeOptions'
import {
  getIncomingSocket,
  getLastAndPercent,
  resolveGzip,
} from 'services/exchanges'
import { watchPanelSocket } from 'services/websocket'
import { consoleLogger } from 'utils/logger'

import styles from '../css/WatchListPanel.module.css'
import {
  getWatchList,
  updateSymbolsLists,
  updateWatchSymbolsLists,
} from 'store/actions'
import WatchListTable from './WatchListTable'

const WatchListPanel = () => {
  const { setSymbol } = useSymbolContext()
  const { templateDrawingsOpen } = useSelector((state) => state.templates)
  const { activeTrader } = useSelector((state) => state.trades)
  const { isPaidUser } = useSelector((state) => state.subscriptions)
  const { activeExchange } = useSelector((state) => state.exchanges)
  const { isAnalyst } = useSelector((state) => state.users)
  const { activeWatchList, symbolsList, watchSymbolsList } = useSelector(
    (state) => state.watchlist
  )
  const { symbols } = useSelector((state) => state.symbols)
  const [addWatchListModalOpen, setAddWatchListModalOpen] = useState(false)
  const [addEmojiModalOpen, setAddEmojiModalOpen] = useState(false)
  const [marketData, setMarketData] = useState([])
  const [loading, setLoading] = useState(false)

  const [isGroupByFlag, setIsGroupByFlag] = useState(false)
  const [isEmojiDeleted, setIsEmojiDeleted] = useState([])
  const dispatch = useDispatch()

  useEffect(() => {
    const email = templateDrawingsOpen ? activeTrader.id : null
    dispatch(getWatchList(email))
  }, [activeExchange.exchange, templateDrawingsOpen, activeTrader.id])

  useEffect(() => {
    let data = []
    if (templateDrawingsOpen) {
      const items = Object.values(activeWatchList).filter(
        (element) => typeof element === 'object'
      )
      const mergedItems = [].concat
        .apply([], items)
        .filter((v, i, a) => a.findIndex((v2) => v2.value === v.value) === i)
      if (mergedItems && mergedItems[0]) {
        setSymbol(mergedItems[0])
      }
      data = mergedItems
    } else {
      data = activeWatchList?.[activeExchange.exchange] ?? []
    }
    dispatch(updateWatchSymbolsLists(data))
  }, [activeWatchList])

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
      const { tickSize } = symbols.find((val) => {
        return symbol.value === val.value
      })
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
    dispatch(updateSymbolsLists(symbolArray))
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
    watchSymbolsList?.forEach((sy) => {
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

  return (
    <div>
      <div
        className={`${styles.header} ${
          templateDrawingsOpen ? styles.headerFlex : ''
        }`}
      >
        <CreateNewList
          styles={styles}
          openWatchListModal={setAddWatchListModalOpen}
        ></CreateNewList>

        {isAnalyst && !templateDrawingsOpen && (
          <EmojiList
            styles={styles}
            setAddEmojiModalOpen={setAddEmojiModalOpen}
          ></EmojiList>
        )}
        {!templateDrawingsOpen && <NewWatchListItem />}
        {!templateDrawingsOpen ? (
          <GroupByFlag
            styles={styles}
            setGroupByFlag={setIsGroupByFlag}
            isPaidUser={false}
          ></GroupByFlag>
        ) : (
          isPaidUser && (
            <GroupByFlag
              styles={styles}
              setGroupByFlag={setIsGroupByFlag}
              isPaidUser={isPaidUser}
            ></GroupByFlag>
          )
        )}
      </div>
      <WatchListTable
        styles={styles}
        isGroupByFlag={isGroupByFlag}
        getWatchSymbolsList={getWatchSymbolsList}
        loading={loading}
      ></WatchListTable>

      {addWatchListModalOpen ? (
        <AddWatchList onClose={() => setAddWatchListModalOpen(false)} />
      ) : null}
      {addEmojiModalOpen && (
        <AddEmoji
          onClose={() => setAddEmojiModalOpen(false)}
          setIsEmojiDeleted={setIsEmojiDeleted}
          isEmojiDeleted={isEmojiDeleted}
        />
      )}
    </div>
  )
}

export default WatchListPanel
