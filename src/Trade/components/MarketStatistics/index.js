import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useSymbolContext } from '../../context/SymbolContext'
import { TWO_DECIMAL_ARRAY } from '../../../constants/Trade'
import { ccxtClass } from '../../../constants/ccxtConfigs'
import './MarketStatistics.css'

function MarketStatistics() {
  const [message, setMessage] = useState(null)
  const { selectedSymbolDetail, marketData } = useSymbolContext()

  const { baseAsset, quoteAsset, symbolPair } = useMemo(() => {
    if (!selectedSymbolDetail) return {}
    return {
      baseAsset: selectedSymbolDetail && selectedSymbolDetail.base_asset,
      quoteAsset: selectedSymbolDetail && selectedSymbolDetail.quote_asset,
      symbolPair: `${selectedSymbolDetail.base_asset}/${selectedSymbolDetail.quote_asset}`,
    }
  }, [selectedSymbolDetail])

  useEffect(() => {
    if (!selectedSymbolDetail || !marketData) return
    setNewMessage(marketData)
  }, [marketData, selectedSymbolDetail])

  const fetchInterval = useMemo(() => {
    if (selectedSymbolDetail?.value) {
      let key = selectedSymbolDetail.value.split(':')[0].toLowerCase()
      return key == 'bybit' ? 10000 : 700
    }
    return undefined
  }, [selectedSymbolDetail])

  const setNewMessage = useCallback(
    ({
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
      let tickSize = TWO_DECIMAL_ARRAY.includes(quoteAsset)
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

      setMessage((prevMessage) => {
        return newMessage
      })
    },
    [quoteAsset, selectedSymbolDetail]
  )
  const getData = useCallback(async () => {
    let activeMarketData = {}
    if (!selectedSymbolDetail?.value) return
    let key = selectedSymbolDetail.value.split(':')[0].toLowerCase()
    try {
      const exchange = ccxtClass[key]
      activeMarketData = await exchange.watchTicker(symbolPair)

      setNewMessage(activeMarketData)
    } catch (e) {
      console.log(e)
    }
  }, [selectedSymbolDetail, setNewMessage, symbolPair])

  useEffect(() => {
    if (selectedSymbolDetail?.value?.split(':')[0].toLowerCase() !== 'bybit') {
      const id = setInterval(async () => await getData(), fetchInterval)
      return () => {
        clearInterval(id)
      }
    } else {
      var socket = new WebSocket('wss://stream.bybit.com/spot/quote/ws/v2')
      socket.onopen = function (event) {
        socket.send(
          JSON.stringify({
            topic: 'realtimes',
            event: 'sub',
            params: {
              symbol: selectedSymbolDetail.symbolpair.replace('/', ''),
              binary: false,
            },
          })
        )
      }
      socket.onmessage = function (event) {
        const { data } = JSON.parse(event.data)
        if (data) {
          setNewMessage({
            last: data.c,
            change: null,
            percentage: data.m,
            high: data.h,
            low: data.l,
            baseVolume: data.v,
            quoteVolume: data.qv,
            symbol: data.s,
          })
        }
      }

      socket.onerror = function (error) {
        console.log(error)
      }

      const id = setInterval(() => {
        socket.send(JSON.stringify({ ping: 1535975085052 }))
      }, 25000)

      return () => {
        socket.close()
        clearInterval(id)
      }
    }
  }, [marketData, selectedSymbolDetail])

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
