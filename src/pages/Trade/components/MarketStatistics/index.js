import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useContext,
} from 'react'
import { useSymbolContext } from 'contexts/SymbolContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowAltCircleUp,
  faArrowCircleDown,
  faStopCircle,
} from '@fortawesome/free-solid-svg-icons'
import { ccxtClass } from 'constants/ccxtConfigs'
import './MarketStatistics.css'
import { UserContext } from 'contexts/UserContext'
import { decryptData } from 'utils/secureData'
import { useNotifications } from 'reapop'
import { setChartDrawings as setDrawings } from 'services/api'
import { useMediaQuery } from 'react-responsive'
import { useLocation } from 'react-router-dom'
import DrawingsMigrationModal from '../DrawingsMigrationModal'
import { storage } from 'services/storages'
import {
  fetchTicker,
  getIncomingSocket,
  getSocketEndpoint,
  getTickerData,
  resolveGzip,
  tickerSocketSubscribe,
} from 'services/exchanges'
import { consoleLogger } from 'utils/logger'

function MarketStatistics({ market }) {
  const [message, setMessage] = useState(null)
  const [finalData, setFinalData] = useState(null)
  const { selectedSymbolDetail, marketData, setLastMarketPrice } =
    useSymbolContext()
  const { chartDrawings, setChartDrawings, userData, isSettingChartDrawings } =
    useContext(UserContext)
  const [showDrawingsModal, setShowDrawingsModal] = useState(false)
  const [fileName, setFileName] = useState('')
  const [uploadedDrawings, setUploadedDrawings] = useState()
  const { notify } = useNotifications()
  const isMobile = useMediaQuery({ query: `(max-width: 1207.98px)` })
  const location = useLocation()
  const isOnMarket = useMemo(() => {
    return location.pathname === '/market'
  }, [location])
  const { baseAsset, quoteAsset, symbolPair } = useMemo(() => {
    if (!selectedSymbolDetail) return {}
    return {
      baseAsset: selectedSymbolDetail && selectedSymbolDetail.base_asset,
      quoteAsset: selectedSymbolDetail && selectedSymbolDetail.quote_asset,
      symbolPair: `${selectedSymbolDetail.base_asset}/${selectedSymbolDetail.quote_asset}`,
    }
  }, [selectedSymbolDetail])

  const setInitMarketData = async (symbol) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    let activeExchange = storage.get('selectedExchange')
    if (activeExchange) {
      try {
        let activeMarketData = await fetchTicker(activeExchange, symbol)
        setNewMessage(activeMarketData)
      } catch (error) {
        consoleLogger(error)
      }
    }
  }

  useEffect(() => {
    if (!selectedSymbolDetail) return
    setInitMarketData(symbolPair)
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
      open,
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
        open,
        quoteVolume,
      }
      let tickSize = 5

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
      newMessage.open = Number(newMessage.open).toFixed(8)

      setMessage(newMessage)
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
      consoleLogger(e)
    }
  }, [selectedSymbolDetail, setNewMessage, symbolPair])

  useEffect(() => {
    if (
      selectedSymbolDetail?.value?.split(':')[0].toLowerCase() !== 'bybit' &&
      selectedSymbolDetail?.value?.split(':')[0].toLowerCase() !== 'huobipro'
    ) {
      const id = setInterval(async () => await getData(), 500)
      return () => {
        clearInterval(id)
      }
    } else {
      const exchangeValue = selectedSymbolDetail?.value
        ?.split(':')[0]
        .toLowerCase()
      let socket = null,
        id = null
      getSocketEndpoint(exchangeValue).then((url) => {
        socket = new WebSocket(url)
        socket.onopen = function (event) {
          let subData = tickerSocketSubscribe(
            exchangeValue,
            selectedSymbolDetail.symbolpair
          )
          socket.send(subData)
        }
        socket.onmessage = async function (event) {
          let data = {}
          if (event.data instanceof Blob) {
            data = await resolveGzip(event.data)
            data = getIncomingSocket(exchangeValue, data)
          } else {
            data = getIncomingSocket(exchangeValue, JSON.parse(event.data))
          }

          if (data) {
            const edittedData = getTickerData(exchangeValue, data)
            setNewMessage(edittedData)
          }
        }

        socket.onerror = function (error) {
          consoleLogger(error)
        }

        id = setInterval(() => {
          socket.send(JSON.stringify({ ping: 1535975085052 }))
        }, 10000)
      })
      return () => {
        if (socket) {
          socket.close()
          clearInterval(id)
        }
      }
    }
  }, [marketData, selectedSymbolDetail])

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

  const lastPriceClass = useMemo(() => {
    if (!finalData) return ''
    return finalData.open < finalData.lastPrice
      ? 'text-success'
      : finalData.open > finalData.lastPrice
      ? 'text-danger'
      : ''
  }, [finalData])

  const arrowirection = useMemo(() => {
    if (!finalData) return ''
    return finalData.open > finalData.lastPrice ? (
      <FontAwesomeIcon icon={faArrowCircleDown} />
    ) : finalData.open < finalData.lastPrice ? (
      <FontAwesomeIcon icon={faArrowAltCircleUp} />
    ) : (
      <FontAwesomeIcon icon={faStopCircle} />
    )
  }, [finalData])

  useInterval(async () => {
    if (!isNaN(message && message.lastPrice)) {
      setFinalData(message)
      setLastMarketPrice(message?.lastPrice)
    }
  }, 2000)

  const handleFileUpload = (e) => {
    const fileReader = new FileReader()
    let file = e.target.files[0]
    if (file.type === 'application/json') {
      fileReader.readAsText(file, 'UTF-8')
      fileReader.onload = (e) => {
        if (e.target.result) {
          let value = JSON.parse(e.target.result)
          let dataLength = Object.keys(value).length
          if (dataLength === 1 && value.data) {
            decryptData(value.data, 'key').then((data) => {
              setFileName(file.name)
              setUploadedDrawings(data)
              isSettingChartDrawings(true)
            })
          } else {
            notify({
              status: 'error',
              title: 'Error',
              message: 'Please upload a valid drawings file',
            })
            setFileName('')
            setUploadedDrawings()
            isSettingChartDrawings(false)
          }
        }
      }
    } else {
      notify({
        status: 'error',
        title: 'Error',
        message: 'Please upload a valid drawings file with .json format',
      })
      setFileName('')
      setUploadedDrawings()
      isSettingChartDrawings(false)
    }
  }

  const dragOver = (e) => {
    e.preventDefault()
  }

  const dragEnter = (e) => {
    e.preventDefault()
  }

  const dragLeave = (e) => {
    e.preventDefault()
  }

  const fileDrop = (e) => {
    e.preventDefault()
    const fileReader = new FileReader()
    let file = e.dataTransfer.files[0]
    if (file.type === 'application/json') {
      fileReader.readAsText(e.dataTransfer.files[0], 'UTF-8')
      fileReader.onload = (e) => {
        if (e.target.result) {
          let value = JSON.parse(e.target.result)
          let dataLength = Object.keys(value).length
          if (dataLength === 1 && value.data) {
            decryptData(value.data, 'key').then((data) => {
              setFileName(file.name)
              setUploadedDrawings(data)
              isSettingChartDrawings(true)
            })
          } else {
            notify({
              status: 'error',
              title: 'Error',
              message: 'Please drag and drop a valid drawings file',
            })
            setFileName('')
            setUploadedDrawings()
            isSettingChartDrawings(false)
          }
        }
      }
    } else {
      notify({
        status: 'error',
        title: 'Error',
        message: 'Please drag and drop a valid drawings file with .json format',
      })
      setFileName('Failed to upload chart drawings. Please try again.')
      setUploadedDrawings()
      isSettingChartDrawings(false)
    }
  }

  const handleProceedDrawings = async () => {
    try {
      setChartDrawings(uploadedDrawings)
      const drawings = {
        [userData.email]: uploadedDrawings,
      }
      setShowDrawingsModal(false)
      await setDrawings(userData.email, drawings)
      setFileName('')
      setUploadedDrawings()
      isSettingChartDrawings(false)
    } catch (err) {
      notify({
        status: 'error',
        title: 'Error',
        message: '',
      })
    }
  }

  const handleModalClose = () => {
    setShowDrawingsModal(false)
    setFileName('')
    setUploadedDrawings()
  }

  return (
    <div className={`marketDataContainer ${!market ? 'marketBorder' : ''}`}>
      {finalData && (
        <>
          <div className="lastPriceBlockMobile">
            {!isNaN(finalData.lastPrice) ? (
              <div className={`marketDataLastPrice ${lastPriceClass}`}>
                {finalData.lastPrice} {arrowirection}
              </div>
            ) : null}
          </div>
          <div className="d-flex lastPriceMarketDataBlock">
            <div className="lastPriceBlock">
              {!isNaN(finalData.lastPrice) ? (
                <div className={`marketDataLastPrice ${lastPriceClass}`}>
                  {finalData.lastPrice} {arrowirection}
                </div>
              ) : null}
            </div>
            <div className="marketData">
              {!isNaN(finalData.priceChange) &&
              finalData.priceChangePercent !== '0.00' ? (
                <div className="marketDataBlock">
                  <div className="marketDataBlockTitle">24h Change</div>
                  <div className="marketDataBlockValue">
                    {`${finalData.priceChange} ${finalData.priceChangePercent}%`}
                  </div>
                </div>
              ) : null}

              {!isNaN(finalData.highPrice) ? (
                <div className="marketDataBlock">
                  <div className="marketDataBlockTitle">24h High</div>
                  <div className="marketDataBlockValue">
                    {finalData.highPrice}
                  </div>
                </div>
              ) : null}
              {!isNaN(finalData.lowPrice) ? (
                <div className="marketDataBlock">
                  <div className="marketDataBlockTitle">24h Low</div>
                  <div className="marketDataBlockValue">
                    {finalData.lowPrice}
                  </div>
                </div>
              ) : null}
              {!isNaN(finalData.volume) ? (
                <div className="marketDataBlock">
                  <div className="marketDataBlockTitle">
                    24h Volume ({baseAsset})
                  </div>
                  <div className="marketDataBlockValue">{finalData.volume}</div>
                </div>
              ) : null}
              {!isNaN(finalData.quoteVolume) ? (
                <div className="marketDataBlock">
                  <div className="marketDataBlockTitle">
                    24h Volume ({quoteAsset})
                  </div>
                  <div className="marketDataBlockValue">
                    {finalData.quoteVolume}
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
        </>
      )}
      {!isMobile && isOnMarket && (
        <button
          onClick={() => setShowDrawingsModal(true)}
          type="button"
          className="btn btn-outline-primary btn-icon-label ml-auto btn-sm mr-4"
        >
          <span className="btn-inner--text">Import / Export Drawings</span>
        </button>
      )}
      {showDrawingsModal && (
        <DrawingsMigrationModal
          chartDrawings={chartDrawings}
          handleFileUpload={handleFileUpload}
          fileDrop={fileDrop}
          fileName={fileName}
          handleModalClose={handleModalClose}
          uploadedDrawings={uploadedDrawings}
          handleProceedDrawings={handleProceedDrawings}
          dragOver={dragOver}
          dragEnter={dragEnter}
          dragLeave={dragLeave}
        />
      )}
    </div>
  )
}

export default MarketStatistics
