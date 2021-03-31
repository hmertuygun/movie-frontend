import React, { useState, useEffect, useContext } from 'react'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import AccordionHeader from './AccordionHeader'
import useSortableData from '../../utils/useSortableData'
import Accordion from './Accordion'
// import { data } from '../../utils/mock-data'
import { PositionContext } from '../../context/PositionContext'
import { useSymbolContext } from '../../../Trade/context/SymbolContext'
import { UserContext } from '../../../contexts/UserContext'

const AccordionContainer = () => {
  const { positions, isLoading } = useContext(PositionContext)
  const { symbolDetails } = useSymbolContext()
  const { activeExchange } = useContext(UserContext)
  const [message, setMessage] = useState([])
  const [data, setData] = useState([])
  const { sendMessage, lastMessage, readyState } = useWebSocket(
    'wss://stream.binance.com:9443/stream'
  )

  useEffect(() => {
    if (lastMessage && 'data' in JSON.parse(lastMessage.data)) {
      const marketData = JSON.parse(lastMessage.data).data
      setMessage(marketData)
    }
  }, [lastMessage])

  useEffect(() => {
    const positionsData = positions.map((position) => {
      const { amount, dateOpened, entry, orders, symbol } = position
      const quoteAsset = symbol.split('-')?.[1]
      const currentPrice = Number(
        message.find((message) => message.s === symbol.replace('-', ''))?.c
      )
      const selectedSymbol = symbolDetails[`BINANCE:${symbol.replace('-', '')}`]

      // if no market data for position's symbol, return previous market data
      if (!currentPrice) return data.find((item) => item.market === symbol)
      let ROE = ''
      let PNL = ''
      if (entry > currentPrice) {
        ROE = '-' + (((entry - currentPrice) * 100) / entry).toFixed(2)
        PNL =
          '-' +
          ((entry - currentPrice) * amount).toFixed(selectedSymbol?.tickSize) +
          ` ${quoteAsset}`
      } else {
        ROE = '+' + (((currentPrice - entry) * 100) / entry).toFixed(2)
        PNL =
          '+' +
          ((currentPrice - entry) * amount).toFixed(selectedSymbol?.tickSize) +
          ` ${quoteAsset}`
      }
      let positionValue = currentPrice * amount
      if (quoteAsset !== 'USDT') {
        const quotePrice = Number(
          message.find((message) => message.s === `${quoteAsset}USDT`)?.c
        )
        positionValue *= quotePrice
      }
      const modifiedData = {
        market: symbol,
        ROE,
        PNL,
        entryPrice: Number(entry.toFixed(selectedSymbol?.tickSize)),
        currentPrice,
        units: amount,
        date: dateOpened,
        orders,
        position: positionValue,
      }
      return modifiedData
    })
    setData(positionsData)
  }, [positions, message])

  const onUnload = () => {
    localStorage.removeItem(
      `position_${activeExchange.apiKeyName}_${activeExchange.exchange}`
    )
  }

  useEffect(() => {
    sendMessage(
      JSON.stringify({
        id: 1,
        method: 'SUBSCRIBE',
        params: ['!ticker@arr'],
      })
    )
    window.addEventListener('beforeunload', onUnload)
    return () => {
      window.removeEventListener('beforeunload', onUnload)
    }
  }, [])

  const { items, requestSort } = useSortableData(data)

  let rows = items.map((item, idx) => {
    return <Accordion key={idx} {...item} />
  })

  return (
    <div
      className="bg-section-secondary"
      style={{ minHeight: 'calc(100vh - 71px)' }}
    >
      <div className="container" style={{ paddingTop: '48px' }}>
        <AccordionHeader
          requestSort={requestSort}
          liveUpdate={readyState === ReadyState.OPEN}
        />

        <div className="flex-wrap mx-0 row align-items-center flex-lg-nowrap pr-md-6 d-none d-lg-block">
          <div className="flex-wrap py-0 pr-0 card-body d-flex align-items-center flex-lg-nowrap font-weight-bold">
            <div
              className="col-auto pt-3 pr-0 mr-3 col-lg-2 align-items-center pt-lg-0 zindex-100"
              style={{ paddingLeft: '1.85rem' }}
            >
              Market
            </div>
            <div className="col-auto px-0 pt-3 pl-0 ml-2 col-lg-1 px-md-0 ml-md-0 pt-lg-0">
              <div
                className="mb-0 text-center align-items-center"
                data-toggle="tooltip"
                data-placement="top"
                title="Return on Equity"
              >
                <span className="text-md font-weight-bold">ROE %</span>
              </div>
            </div>
            <div className="col-auto px-0 pt-3 pl-0 ml-2 col-lg-2 pl-md-2 ml-md-0 pt-lg-0">
              <div
                className="mb-0 text-center align-items-center"
                data-toggle="tooltip"
                data-placement="top"
                title="Profit & Loss"
              >
                <span className="text-md font-weight-bold">PNL</span>
              </div>
            </div>
            <div className="px-0 py-3 col-12 col-lg-7 d-flex align-items-center position-static py-lg-3">
              <div className="px-0 col col-lg-12 position-static text-lg-center">
                <div className="flex-wrap d-flex flex-lg-nowrap align-items-center">
                  <div className="px-0 col-12 col-lg-3 position-static">
                    <span id="value">Entry Price</span>
                  </div>
                  <div className="px-0 col-12 col-lg-3 position-static">
                    <span id="value">Current Price</span>
                  </div>
                  <div className="px-0 col-12 col-lg-3 position-static">
                    <span id="value">Units</span>
                  </div>
                  <div className="px-0 col-12 col-lg-3 position-static text-muted">
                    <span id="value">Date Opened</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="accordion" className="accordion accordion-spaced">
          {isLoading ? (
            <div className="pt-5 text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          ) : (
            rows
          )}
        </div>
      </div>
    </div>
  )
}

export default AccordionContainer
