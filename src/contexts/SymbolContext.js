/* eslint-disable react-hooks/exhaustive-deps */
import React, { createContext, useEffect, useContext, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  saveLastSelectedMarketSymbol,
  getFirestoreDocumentData,
} from 'services/api'
import { firebase } from 'services/firebase'
import { storage } from 'services/storages'
import {
  updateSelectedSymbol,
  updateSelectedSymbolDetail,
  updateSymbolType,
  updateEmojis,
  loadLastPrice,
  loadBalance,
  initMarketData,
  updateOpenOrdersUC,
  updateChartDataOnInit,
  updateIsLoadingBalance,
} from 'store/actions'
import { fetchTicker } from 'services/exchanges'
import { consoleLogger } from 'utils/logger'

import {
  DEFAULT_SYMBOL_LOAD_DASH,
  DEFAULT_SYMBOL_LOAD_SLASH,
} from 'constants/Default'

export const SymbolContext = createContext()
const db = firebase.firestore()

const SymbolContextProvider = ({ children }) => {
  const {
    symbolDetails,
    selectedSymbol,
    selectedSymbolDetail,
    isLoadingLastPrice,
    symbolType,
  } = useSelector((state) => state.symbols)

  const { userData, isAnalyst } = useSelector((state) => state.users)

  const {
    isExchangeLoading,
    exchangeType,
    activeDD,
    exchangeUpdated,
    activeExchange,
  } = useSelector((state) => state.exchanges)
  const templates = useSelector((state) => state.templates)
  const { templateDrawingsOpen } = templates
  const { activeTrader } = useSelector((state) => state.trades)
  const { watchListOpen } = useSelector((state) => state.market)
  const { isOnboardingSkipped } = useSelector((state) => state.appFlow)

  const dispatch = useDispatch()
  useEffect(() => {
    let { exchange } = activeExchange
    if (
      !exchange ||
      !selectedSymbol?.label ||
      !Object.keys(symbolDetails).length
    )
      return
    storage.set('selectedExchange', exchange)
    exchange = exchange.toUpperCase()
    dispatch(updateOpenOrdersUC(null))
    const key = `${exchange}:${selectedSymbol?.label.replace('-', '/')}`
    let details = symbolDetails[key]
    let symbolData = { label: selectedSymbol?.label, value: key }
    if (!details) {
      const val = `${exchange}:${DEFAULT_SYMBOL_LOAD_SLASH}`
      symbolData = { label: DEFAULT_SYMBOL_LOAD_DASH, value: val }
      details = symbolDetails[val]
    }
    setSymbol(symbolData)
    dispatch(updateSelectedSymbolDetail(details))
  }, [activeExchange])

  useEffect(() => {
    if (!selectedSymbol || !Object.keys(symbolDetails).length) return
    if (userData && firebase.auth().currentUser !== null)
      dispatch(loadLastPrice(selectedSymbol.label.replace('-', '/')))
  }, [selectedSymbol])

  // On mounted, make sure userData has been filled to avoid any FB token errors
  useEffect(() => {
    if (!userData && firebase.auth().currentUser === null) return
    dispatch(
      updateChartDataOnInit(
        userData,
        watchListOpen,
        activeExchange,
        templateDrawingsOpen,
        exchangeUpdated,
        isOnboardingSkipped
      )
    )
  }, [watchListOpen, activeExchange, templateDrawingsOpen])

  useEffect(() => {
    let userEmail = isAnalyst ? userData.email : activeTrader.id
    if (userEmail) {
      getFirestoreDocumentData('chart_shared', userEmail)
        .then((emoji) => {
          if (emoji.data()) {
            if (emoji.data()?.flags) {
              storage.set('flags', JSON.stringify(emoji.data()?.flags))
              dispatch(updateEmojis(emoji.data()?.flags))
            }
          }
        })
        .catch((err) => console.log(err))
    }
  }, [db, watchListOpen, activeTrader, userData.email, isAnalyst])

  const setSymbol = useCallback(
    async (symbol) => {
      if (
        !symbol ||
        symbol?.value === selectedSymbol?.value ||
        !symbolDetails[symbol.value]
      )
        return
      dispatch(updateSelectedSymbol(symbol))
      dispatch(updateSelectedSymbolDetail(symbolDetails[symbol.value]))
      const symbolT = symbol.label.replace('-', '/')
      storage.set('selectedSymbol', symbolT)
      dispatch(updateSymbolType(symbolT))
      dispatch(initMarketData(symbolT, activeExchange))
      if (!watchListOpen) {
        dispatch(
          loadBalance(
            symbol.quote_asset,
            symbol.base_asset,
            activeExchange,
            isOnboardingSkipped
          )
        )
        try {
          await saveLastSelectedMarketSymbol(symbol.value)
        } catch (e) {
          consoleLogger(e)
        }
      }
    },
    [selectedSymbol?.value, symbolDetails, watchListOpen]
  )

  useEffect(() => {
    if (
      activeDD.length === 0 ||
      !exchangeType ||
      !symbolType ||
      watchListOpen
    ) {
      return
    }

    const selectedSymbol = activeDD.find(
      (symbol) => symbol.symbolpair === symbolType
    )
    if (!selectedSymbol) {
      const val = `${exchangeType}:${DEFAULT_SYMBOL_LOAD_SLASH}`
      setSymbol({ label: DEFAULT_SYMBOL_LOAD_DASH, value: val })
    }
  }, [exchangeType, symbolType, activeDD, setSymbol, watchListOpen])

  useEffect(() => {
    if (!selectedSymbol || !selectedSymbolDetail) return

    const [baseAsset, quoteAsset] = selectedSymbol?.label.split('-')
    if (
      !(
        selectedSymbol.value.includes(baseAsset) &&
        selectedSymbol.value.includes(quoteAsset)
      )
    )
      return

    if (watchListOpen) return

    if (selectedSymbol.value !== selectedSymbolDetail.value) {
      dispatch(updateSelectedSymbolDetail(symbolDetails[selectedSymbol.value]))
    }
  }, [
    isExchangeLoading,
    isLoadingLastPrice,
    selectedSymbol,
    selectedSymbolDetail,
    symbolDetails,
    watchListOpen,
  ])

  const refreshBalance = async () => {
    try {
      dispatch(updateIsLoadingBalance(true))
      if (selectedSymbolDetail?.quote_asset) {
        dispatch(
          loadBalance(
            selectedSymbolDetail.quote_asset,
            selectedSymbolDetail.base_asset,
            activeExchange,
            isOnboardingSkipped,
            true
          )
        )
      }
    } catch (error) {
      consoleLogger(error)
    }
  }

  return (
    <SymbolContext.Provider
      value={{
        isLoading: !selectedSymbolDetail || isExchangeLoading,
        setSymbol,
        refreshBalance,
      }}
    >
      {children}
    </SymbolContext.Provider>
  )
}

export const useSymbolContext = () => {
  return useContext(SymbolContext)
}
export default SymbolContextProvider
