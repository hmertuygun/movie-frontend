import React, { useState, useEffect, useRef } from 'react'
import ReconnectingWebSocket from 'reconnecting-websocket'
import { useSymbolContext } from '../../context/SymbolContext'
import './MarketStatistics.css'

function MarketStatistics() {
  const [message, setMessage] = useState(null)
  const { selectedSymbolDetail, lastMessage } = useSymbolContext()
  const baseAsset = selectedSymbolDetail.base_asset
  const quoteAsset = selectedSymbolDetail.quote_asset
  const symbolPair = `${baseAsset}${quoteAsset}`

  useEffect(() => {
    const activeMarketData = lastMessage.find((data) => {
      return data.symbol === symbolPair
    })

    const quoteWorth =
      quoteAsset === 'USDT'
        ? { lastPrice: 1 }
        : lastMessage.find((data) => {
            return data.symbol === `${quoteAsset}USDT`
          })

    if (activeMarketData && quoteWorth) {
      const {
        lastPrice,
        priceChange,
        priceChangePercent,
        highPrice,
        lowPrice,
        volume,
        quoteVolume,
      } = activeMarketData

      const newMessage = {
        lastPrice,
        worth: lastPrice * quoteWorth.lastPrice,
        priceChange,
        priceChangePercent,
        highPrice,
        lowPrice,
        volume,
        quoteVolume,
      }

      const tickSize = selectedSymbolDetail.tickSize > 8 ? 8: selectedSymbolDetail.tickSize

      newMessage.lastPrice = Number(newMessage.lastPrice).toFixed(tickSize)
      newMessage.worth = Number(newMessage.worth).toFixed(2)
      newMessage.priceChange = Number(newMessage.priceChange).toFixed(tickSize)
      newMessage.priceChangePercent = Number(
        newMessage.priceChangePercent
      ).toFixed(2)
      newMessage.highPrice = Number(newMessage.highPrice).toFixed(tickSize)
      newMessage.lowPrice = Number(newMessage.lowPrice).toFixed(tickSize)
      newMessage.volume = Number(newMessage.volume).toFixed(2)
      newMessage.quoteVolume = Number(newMessage.quoteVolume).toFixed(2)

      setMessage(newMessage)
    }
  }, [lastMessage, quoteAsset, symbolPair])

  return (
    <div className="marketDataContainer">
      {message && (
        <div className="d-flex">
          <div className="lastPriceBlock">
            <div className="marketDataLastPrice">{message.lastPrice}</div>
            <div className="marketDataWorth">${message.worth}</div>
          </div>
          <div className="marketData">
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
              <div className="marketDataBlockValue">{message.volume}</div>
            </div>
            <div className="marketDataBlock">
              <div className="marketDataBlockTitle">
                24h Volume({quoteAsset})
              </div>
              <div className="marketDataBlockValue">{message.quoteVolume}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MarketStatistics
