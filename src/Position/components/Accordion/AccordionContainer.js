import React, { useState, useEffect, useContext, useRef } from 'react'
import * as Sentry from '@sentry/browser'

import Tooltip from '../../../components/Tooltip'
import AccordionHeader from './AccordionHeader'
import useSortableData from '../../utils/useSortableData'
import Accordion from './Accordion'
// import { data } from '../../utils/mock-data'
import { PositionContext } from '../../context/PositionContext'
import { useSymbolContext } from '../../../Trade/context/SymbolContext'
import scientificToDecimal from '../../../helpers/toDecimal'
import { UserContext } from '../../../contexts/UserContext'

const AccordionContainer = () => {
  const { positions, isLoading } = useContext(PositionContext)
  const { activeExchange } = useContext(UserContext)
  const { symbolDetails, lastMessage, liveUpdate } = useSymbolContext()
  const [data, setData] = useState([])

  useEffect(() => {
    try {
      let positionsData = []
      for (const position of positions) {
        const { amount, dateOpened, entry, orders, symbol } = position
        const quoteAsset = symbol.split('-')?.[1]
        const currentPrice = scientificToDecimal(
          Number(
            lastMessage.find(
              (lastMessage) => lastMessage.symbol === symbol.replace('-', '')
            )?.lastPrice
          )
        )

        const { exchange } = activeExchange
        const selectedSymbol =
          symbolDetails[`${exchange.toUpperCase()}:${symbol.replace('-', '/')}`]

        if (!currentPrice || !selectedSymbol) return
        let ROE = ''
        let PNL = ''

        let twoDecimalArray = ['USDT', 'PAX', 'BUSD', 'USDC']
        if (entry > currentPrice) {
          ROE =
            '-' +
            scientificToDecimal(
              (((entry - currentPrice) * 100) / entry).toFixed(2)
            )
          const PNLValue = (entry - currentPrice) * amount
          if (twoDecimalArray.includes(quoteAsset)) {
            PNL =
              '-' + scientificToDecimal(PNLValue.toFixed(2)) + ` ${quoteAsset}`
          } else {
            PNL =
              '-' +
              scientificToDecimal(PNLValue.toFixed(selectedSymbol?.tickSize)) +
              ` ${quoteAsset}`
          }
        } else {
          ROE =
            '+' +
            scientificToDecimal(
              (((currentPrice - entry) * 100) / entry).toFixed(2)
            )
          const PNLValue = (currentPrice - entry) * amount
          if (twoDecimalArray.includes(quoteAsset)) {
            PNL =
              '+' + scientificToDecimal(PNLValue.toFixed(2)) + ` ${quoteAsset}`
          } else {
            PNL =
              '+' +
              scientificToDecimal(PNLValue.toFixed(selectedSymbol?.tickSize)) +
              ` ${quoteAsset}`
          }
        }

        let modifiedOrders = orders.orders.map((order) => {
          if (twoDecimalArray.includes(quoteAsset)) {
            return {
              ...order,
              averageFillPrice: scientificToDecimal(
                order.averageFillPrice.toFixed(2)
              ),
            }
          } else {
            return {
              ...order,
              averageFillPrice: scientificToDecimal(
                order.averageFillPrice.toFixed(selectedSymbol?.tickSize)
              ),
            }
          }
        })

        let positionValue = currentPrice * amount
        if (quoteAsset !== 'USDT') {
          const quotePrice = Number(
            lastMessage.find(
              (lastMessage) => lastMessage.symbol === `${quoteAsset}USDT`
            )?.lastPrice
          )
          positionValue *= quotePrice
        }

        let entryPrice = null
        if (twoDecimalArray.includes(quoteAsset)) {
          entryPrice = scientificToDecimal(Number(entry.toFixed(2)))
        } else {
          entryPrice = scientificToDecimal(
            Number(entry.toFixed(selectedSymbol?.tickSize))
          )
        }

        const modifiedData = {
          market: symbol,
          ROE,
          PNL,
          entryPrice,
          currentPrice,
          units: amount,
          date: dateOpened,
          orders: modifiedOrders,
          position: positionValue,
        }
        positionsData.push(modifiedData)
      }
      setData(positionsData)
    } catch (error) {
      Sentry.captureException(error)
      console.warn(error)
      // throw new Error('Error occured while processing positions')
    }
  }, [positions, lastMessage, symbolDetails, activeExchange])

  const { items, requestSort } = useSortableData(data)
  return (
    <div
      className="bg-section-secondary"
      style={{ minHeight: 'calc(100vh - 71px)' }}
    >
      <div className="container" style={{ paddingTop: '48px' }}>
        <AccordionHeader requestSort={requestSort} liveUpdate={liveUpdate} />

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
                data-for="ROE-tooltip"
                data-tip="Return on Equity"
              >
                <span className="text-md font-weight-bold">ROE %</span>
              </div>
              <Tooltip id="ROE-tooltip" />
            </div>
            <div className="col-auto px-0 pt-3 pl-0 ml-2 col-lg-2 pl-md-2 ml-md-0 pt-lg-0">
              <div
                className="mb-0 text-center align-items-center"
                data-for="PNL-tooltip"
                data-tip="Profit & Loss"
              >
                <span className="text-md font-weight-bold">PNL</span>
              </div>
              <Tooltip id="PNL-tooltip" />
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
        {/* Disable accordion by removing accordion class, to enable add again */}
        <div id="accordion" className="accordion-spaced">
          {isLoading || (positions.length > 0 && !items.length) ? (
            <div className="pt-5 text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          ) : positions.length > 0 ? (
            items.map((item, idx) => <Accordion key={idx} {...item} />)
          ) : (
            <div className="pt-5 text-center">No positions</div>
          )}
        </div>
        <p className="mt-5">
          Positions will start appearing as you trade on CoinPanel. There are 3
          reasons why some of your positions might be missing.
        </p>
        <ul>
          <li style={{listStyleType: ''}}>
            When you trade with Limit orders on Place Order tab, the order
            history doesn’t update, so you need to trade either with Full Trade,
            or with automation order types(Stop/Take-Profit) to see your
            positions appear.
          </li>
          <li>
            If you trade the same coin with multiple markets (e.g. ETH-BTC &
            ETH-USDT) your positions cannot be calculated
          </li>
          <li>
            If you are holding bags from before (e.g. you have BTC balance that
            you are holding, and you open a new trade with BTC-USDT, your
            position cannot be calculated)
          </li>
        </ul>
      </div>
    </div>
  )
}

export default AccordionContainer
