import React, { useState, useEffect, useContext } from 'react'
import { useSymbolContext } from '../../context/SymbolContext'
import { UserContext } from '../../../contexts/UserContext'
import ccxtpro from 'ccxt.pro'
import ccxt from 'ccxt'
import { getExchangeProp } from '../../../helpers/getExchangeProp'
import './MarketStatistics.css'

function MarketStatistics() {
  const [message, setMessage] = useState(null)

  const { selectedSymbolDetail, marketData } = useSymbolContext()
  const { activeExchange } = useContext(UserContext)
  const baseAsset = selectedSymbolDetail && selectedSymbolDetail.base_asset
  const quoteAsset = selectedSymbolDetail && selectedSymbolDetail.quote_asset
  const symbolPair = `${baseAsset}/${quoteAsset}`
  const [lastData, setLastData] = useState()
  const [socketData, setSocketData] = useState()
  const [intervalId, setIntervalId] = useState()

  const FETCH_INTERVAL =
    activeExchange && activeExchange.exchange == 'bybit' ? 10000 : 700

  const [binance, binanceus, kucoin] = [
    new ccxtpro.binance({
      enableRateLimit: true,
    }),
    new ccxtpro.binanceus({
      enableRateLimit: true,
    }),
    new ccxtpro.kucoin({
      proxy: localStorage.getItem('proxyServer'),
      enableRateLimit: true,
    }),
    new ccxt.bybit({
      enableRateLimit: true,
    }),
  ]

  useEffect(() => {
    if (!selectedSymbolDetail || !marketData) return
    setNewMessage(marketData)
  }, [lastData, marketData])

  const setNewMessage = ({
    last,
    change,
    percentage,
    high,
    low,
    baseVolume,
    quoteVolume,
    symbol,
  }) => {
    const newMessage = {
      lastPrice: last,
      worth: last * 1,
      priceChange: change,
      priceChangePercent: percentage,
      highPrice: high,
      lowPrice: low,
      volume: baseVolume,
      quoteVolume,
    }

    let twoDecimalArray = ['USDT', 'PAX', 'BUSD', 'USDC']

    let tickSize = twoDecimalArray.includes(quoteAsset)
      ? 2
      : selectedSymbolDetail.tickSize > 8
      ? 8
      : selectedSymbolDetail.tickSize ?? 3

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

  useEffect(() => {
    const id = setInterval(async () => await getData(), FETCH_INTERVAL)

    return () => {
      clearInterval(id)
    }
  }, [marketData, selectedSymbolDetail, FETCH_INTERVAL])

  const getData = async () => {
    let activeMarketData = {}
    if (!selectedSymbolDetail?.value) return
    let key = selectedSymbolDetail.value.split(':')[0].toLowerCase()
    try {
      if (key == 'binance') {
        activeMarketData = await binance.watchTicker(symbolPair)
      } else if (key == 'binanceus') {
        activeMarketData = await binanceus.watchTicker(symbolPair)
      } else if (key == 'kucoin') {
        activeMarketData = await kucoin.watchTicker(symbolPair)
      } else if (key == 'bybit') {
        activeMarketData = await kucoin.fetchTicker(symbolPair)
      }
      setNewMessage(activeMarketData)
    } catch (e) {
      console.log(e)
      // do nothing and retry on next loop iteration
      // throw e // uncomment to break all loops in case of an error in any one of them
      // break // you can also break just this one loop if it fails
    }
  }

  return (
    <div className="marketDataContainer">
      {message && (
        <div className="d-flex">
          <div className="lastPriceBlock">
            {!isNaN(message.worth) ? (
              <div className="marketDataLastPrice">{message.lastPrice}</div>
            ) : null}
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
            ) : (
              <div
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  display: 'flex',
                }}
              >
                <span className="spinner-border spinner-border-sm text-primary" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default MarketStatistics
