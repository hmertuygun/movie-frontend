import React, { useState, useEffect, useContext, Component } from 'react'
import binanceAPI from '../../../api/binanceAPI'
import { UserContext } from '../../../contexts/UserContext'

const TradingViewChart = ({ chartOptions }) => {
  const [isChartReady, setIsChartReady] = useState(false)
  const bAPI = new binanceAPI({ debug: false })
  const getLocalLanguage = () => {
    return navigator.language.split('-')[0] || 'en'
  }
  const defaultChartOptions = {
    locale: getLocalLanguage(),
    debug: false,
    fullscreen: false,
    autosize: true,
    interval: '1D', // '1', '3', '5', '15', '30', '60', '120', '240', '360', '480', '720', '1D', '3D', '1W', '1M'
    theme: 'light',
    allow_symbol_change: false,
    hide_side_toolbar: false
  }
  const widgetOptions = {
    container_id: "chart_container",
    datafeed: bAPI,
    library_path: "/scripts/charting_library/",
    ...defaultChartOptions,
    ...chartOptions
  }
  const chartReady = () => {
    const tradingViewWidget = (window.tvWidget = new window.TradingView.widget(widgetOptions))
    tradingViewWidget.onChartReady(() => {
      setIsChartReady(true)
    })
  }

  useEffect(() => {
    chartReady()
  }, [])

  return (
    <div id='chart_container' style={{ width: "100%", height: "100%" }}></div>
  )
}
export default TradingViewChart