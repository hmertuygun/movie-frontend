import React, { useState, useEffect } from 'react'
import { useSymbolContext } from '../../context/SymbolContext'
import './MarketStatistics.css'

function MarketStatistics() {
  const [message, setMessage] = useState(null)
  const { selectedSymbolDetail, lastMessage } = useSymbolContext()
  const baseAsset = selectedSymbolDetail && selectedSymbolDetail.base_asset
  const quoteAsset = selectedSymbolDetail && selectedSymbolDetail.quote_asset
  const symbolPair = `${baseAsset}${quoteAsset}`
  useEffect(() => {
    const activeMarketData = lastMessage.find((data) => {
      return data.symbol.replace('/', '') === symbolPair
    })
    const quoteWorth =
      quoteAsset === 'USDT'
        ? { lastPrice: 1 }
        : lastMessage.find((data) => {
            return data.symbol.replace('/', '') === `${quoteAsset}USDT`
          })

    if (!activeMarketData) return
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
      worth: lastPrice * quoteWorth?.lastPrice,
      priceChange,
      priceChangePercent,
      highPrice,
      lowPrice,
      volume,
      quoteVolume,
    }

    let twoDecimalArray = ['USDT', 'PAX', 'BUSD', 'USDC']

    let tickSize = twoDecimalArray.includes(quoteAsset)
      ? 2
      : selectedSymbolDetail.tickSize > 8
      ? 8
      : selectedSymbolDetail.tickSize

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
  }, [lastMessage, quoteAsset, symbolPair])

  return (
    <div className="marketDataContainer">
      {message && (
        <div className="d-flex">
          <div className="lastPriceBlock">
            <div className="marketDataLastPrice">{message.lastPrice}</div>
            {!isNaN(message.worth) ? (
              <div className="marketDataWorth">${message.worth}</div>
            ) : null}
          </div>
          <div className="marketData">
            {!isNaN(message.priceChange) ? (
              <div className="marketDataBlock">
                <div className="marketDataBlockTitle">24h Change</div>
                <div className="marketDataBlockValue">
                  {`${message.priceChange} ${message.priceChangePercent}%`}
                </div>
              </div>
            ) : null}

            {!isNaN(message.highPrice) ? (
              <div className="marketDataBlock">
                <div className="marketDataBlockTitle">24h High</div>
                <div className="marketDataBlockValue">{message.highPrice}</div>
              </div>
            ) : null}
            {!isNaN(message.lowPrice) ? (
              <div className="marketDataBlock">
                <div className="marketDataBlockTitle">24h Low</div>
                <div className="marketDataBlockValue">{message.lowPrice}</div>
              </div>
            ) : null}
            {!isNaN(message.volume) ? (
              <div className="marketDataBlock">
                <div className="marketDataBlockTitle">
                  24h Volume({baseAsset})
                </div>
                <div className="marketDataBlockValue">{message.volume}</div>
              </div>
            ) : null}
            {!isNaN(message.quoteVolume) ? (
              <div className="marketDataBlock">
                <div className="marketDataBlockTitle">
                  24h Volume({quoteAsset})
                </div>
                <div className="marketDataBlockValue">
                  {message.quoteVolume}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}

export default MarketStatistics
