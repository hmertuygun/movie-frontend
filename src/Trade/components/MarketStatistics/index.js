import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useContext,
} from 'react'
import { useSymbolContext } from '../../context/SymbolContext'
import { TWO_DECIMAL_ARRAY } from '../../../constants/Trade'
import { ccxtClass } from '../../../constants/ccxtConfigs'
import './MarketStatistics.css'
import {
  execExchangeFunc,
  getExchangeProp,
} from '../../../helpers/getExchangeProp'
import { UserContext } from '../../../contexts/UserContext'
import { decryptData } from '../../../helpers/secureData'
import { useNotifications } from 'reapop'
import { setChartDrawings as setDrawings } from '../../../api/firestoreCall'
import { useMediaQuery } from 'react-responsive'
import DrawingsMigrationModal from '../DrawingsMigrationModal'

function MarketStatistics({ market }) {
  const [message, setMessage] = useState(null)
  const [finalData, setFinalData] = useState(null)
  const { selectedSymbolDetail, marketData } = useSymbolContext()
  const {
    chartDrawings,
    setChartDrawings,
    userData,
    isSettingChartDrawings,
    settingChartDrawings,
  } = useContext(UserContext)
  const [showDrawingsModal, setShowDrawingsModal] = useState(false)
  const [fileName, setFileName] = useState('')
  const [uploadedDrawings, setUploadedDrawings] = useState()
  const { notify } = useNotifications()
  const isMobile = useMediaQuery({ query: `(max-width: 991.98px)` })
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
      console.log(e)
    }
  }, [selectedSymbolDetail, setNewMessage, symbolPair])

  useEffect(() => {
    if (
      selectedSymbolDetail?.value?.split(':')[0].toLowerCase() !== 'bybit' &&
      selectedSymbolDetail?.value?.split(':')[0].toLowerCase() !== 'huobipro'
    ) {
      const id = setInterval(async () => await getData(), fetchInterval)
      return () => {
        clearInterval(id)
      }
    } else {
      const exchangeValue = selectedSymbolDetail?.value
        ?.split(':')[0]
        .toLowerCase()
      var socket = new WebSocket(
        getExchangeProp(exchangeValue, 'socketEndpoint')
      )
      socket.onopen = function (event) {
        let subData = execExchangeFunc(
          exchangeValue,
          'ticketSocketSubscribe',
          selectedSymbolDetail.symbolpair
        )
        socket.send(subData)
      }
      socket.onmessage = async function (event) {
        let data = {}
        if (event.data instanceof Blob) {
          data = await execExchangeFunc(
            exchangeValue,
            'resolveGzip',
            event.data
          )
          data = execExchangeFunc(exchangeValue, 'getIncomingSocket', {
            sData: data,
          })
        } else {
          data = execExchangeFunc(exchangeValue, 'getIncomingSocket', {
            sData: JSON.parse(event.data),
          })
        }

        if (data) {
          const edittedData = execExchangeFunc(
            exchangeValue,
            'getTickerData',
            data
          )
          setNewMessage(edittedData)
        }
      }

      socket.onerror = function (error) {
        //console.log(error)
      }

      const id = setInterval(() => {
        socket.send(JSON.stringify({ ping: 1535975085052 }))
      }, 10000)

      return () => {
        socket.close()
        clearInterval(id)
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

  useInterval(async () => {
    if (!isNaN(message && message.lastPrice)) setFinalData(message)
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
        <div className="d-flex">
          <div className="lastPriceBlock">
            {!isNaN(finalData.worth) ? (
              <div className="marketDataLastPrice">{finalData.lastPrice}</div>
            ) : null}
            {!isNaN(finalData.worth) ? (
              <div className="marketDataWorth">${finalData.worth}</div>
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
                <div className="marketDataBlockValue">{finalData.lowPrice}</div>
              </div>
            ) : null}
            {!isNaN(finalData.volume) ? (
              <div className="marketDataBlock">
                <div className="marketDataBlockTitle">
                  24h Volume({baseAsset})
                </div>
                <div className="marketDataBlockValue">{finalData.volume}</div>
              </div>
            ) : null}
            {!isNaN(finalData.quoteVolume) ? (
              <div className="marketDataBlock">
                <div className="marketDataBlockTitle">
                  24h Volume({quoteAsset})
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
      )}
      {!isMobile && (
        <button
          onClick={() => setShowDrawingsModal(true)}
          type="button"
          class="btn btn-outline-primary btn-icon-label ml-auto btn-sm mr-4"
        >
          <span class="btn-inner--text">Import / Export Drawings</span>
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
