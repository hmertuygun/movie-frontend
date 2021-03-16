import React, { useState, useEffect } from 'react'
import useWebSocket from 'react-use-websocket'

import { useSymbolContext } from '../../context/SymbolContext'
import './MarketStatistics.css'

function MarketStatistics() {
  const [message, setMessage] = useState(null)
  const { selectedSymbolDetail } = useSymbolContext()
  const symbolPair = selectedSymbolDetail.symbolpair
  const baseAsset = selectedSymbolDetail.base_asset
  const quoteAsset = selectedSymbolDetail.quote_asset

  const { sendMessage, lastMessage } = useWebSocket(
    'wss://stream.binance.com:9443/stream'
  )

  useEffect(() => {
    if (lastMessage && 'data' in JSON.parse(lastMessage.data)) {
      const marketData = JSON.parse(lastMessage.data).data
      const activeMarketData = marketData.find((data) => {
        return data.s === symbolPair
      })

      const quoteWorth =
        quoteAsset === 'USDT'
          ? { c: 1 }
          : marketData.find((data) => {
              return data.s === `${quoteAsset}USDT`
            })

      if (activeMarketData && quoteWorth) {
        const {
          c: lastPrice,
          p: priceChange,
          P: priceChangePercent,
          h: highPrice,
          l: lowPrice,
          v: totalTradedBaseAssetVolume,
          q: totalTradedQuoteAssetVolume,
        } = activeMarketData

        const newMessage = {
          lastPrice,
          worth: lastPrice * quoteWorth.c,
          priceChange,
          priceChangePercent,
          highPrice,
          lowPrice,
          totalTradedBaseAssetVolume,
          totalTradedQuoteAssetVolume,
        }

        const splittedValue = Number(priceChange).toString().split('.')
        if (priceChange >= 1) {
          for (const [key, value] of Object.entries(newMessage)) {
            newMessage[key] = Number(value).toFixed(2)
          }
        } else {
          let precision = 0
          if (splittedValue[1]?.length <= 2) {
            precision = 2
          } else if (splittedValue[1]?.length <= 4) {
            precision = 4
          } else if (splittedValue[1]?.length <= 6) {
            precision = 6
          } else {
            precision = 8
          }
          newMessage.lastPrice = Number(newMessage.lastPrice).toFixed(precision)
          newMessage.worth = Number(newMessage.worth).toFixed(2)
          newMessage.priceChange = Number(newMessage.priceChange).toFixed(
            precision
          )
          newMessage.priceChangePercent = Number(
            newMessage.priceChangePercent
          ).toFixed(2)
          newMessage.highPrice = Number(newMessage.highPrice).toFixed(precision)
          newMessage.lowPrice = Number(newMessage.lowPrice).toFixed(precision)
          newMessage.totalTradedBaseAssetVolume = Number(
            newMessage.totalTradedBaseAssetVolume
          ).toFixed(2)
          newMessage.totalTradedQuoteAssetVolume = Number(
            newMessage.totalTradedQuoteAssetVolume
          ).toFixed(2)
        }

        setMessage(newMessage)
      }
    }
  }, [lastMessage, quoteAsset, symbolPair])

  useEffect(() => {
    if (symbolPair) {
      sendMessage(
        JSON.stringify({
          id: 1,
          method: 'SUBSCRIBE',
          params: ['!ticker@arr'],
        })
      )
    }
  }, [symbolPair])

  return (
    <div className="marketDataContainer">
      <div className="marketData">
        {message && (
          <>
            <div className="lastPriceBlock">
              <div className="marketDataLastPrice">{message.lastPrice}</div>
              <div className="marketDataWorth">${message.worth}</div>
            </div>
            <div className="marketDataBlock">
              <div className="marketDataBlockTitle">24h Change</div>
              <div className="marketDataBlockValue">
                {`${message.priceChange} ${message.priceChangePercent}%`}
              </div>
            </div>
            <div className="marketDataBlock">
              <div className="marketDataBlockTitle">24h High</div>
              <div className="marketDataBlockValue">{message.highPrice}</div>
            </div>
            <div className="marketDataBlock">
              <div className="marketDataBlockTitle">24h Low</div>
              <div className="marketDataBlockValue">{message.lowPrice}</div>
            </div>
            <div className="marketDataBlock">
              <div className="marketDataBlockTitle">
                24h Volume({baseAsset})
              </div>
              <div className="marketDataBlockValue">
                {message.totalTradedBaseAssetVolume}
              </div>
            </div>
            <div className="marketDataBlock">
              <div className="marketDataBlockTitle">
                24h Volume({quoteAsset})
              </div>
              <div className="marketDataBlockValue">
                {message.totalTradedQuoteAssetVolume}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default MarketStatistics
