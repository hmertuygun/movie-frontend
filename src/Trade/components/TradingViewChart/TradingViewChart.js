import React, { useState, useEffect, useContext, Component } from 'react'
import binanceAPI from '../../../api/binanceAPI'
import { widget } from '../../charting_library/charting_library.esm'
import { UserContext } from '../../../contexts/UserContext'
export default class TradingViewChart extends Component {
  constructor({ chartOptions }) {
    super()
    this.state = {
      isChartReady: false
    }
    this.bfAPI = new binanceAPI({ debug: false })
    this.widgetOptions = {
      container_id: "chart_container",
      datafeed: this.bfAPI,
      library_path: "../../charting_library",
      locale: "en",
      debug: false,
      fullscreen: false,
      autosize: true,
      interval: '1D', // '1', '3', '5', '15', '30', '60', '120', '240', '360', '480', '720', '1D', '3D', '1W', '1M'
      theme: 'light',
      allow_symbol_change: true,
      hide_side_toolbar: false,
      ...chartOptions
    }
    this.tradingViewWidget = null
    this.chartObject = null
  }

  chartReady = () => {
    this.tradingViewWidget.onChartReady(() => {
      this.setState({
        isChartReady: true
      })
    })
  }

  componentDidMount() {
    this.tradingViewWidget = new widget(this.widgetOptions)
    this.chartReady()
  }

  componentDidUpdate() {
    // Use events and methods here. All events and methods available here
    // Can use global context for changing/setting values 
    this.chartObject = this.tradingViewWidget.chart()
    this.tradingViewWidget.save((obj) => { })
  }

  render() {
    return (
      <div id='chart_container'></div>
    )
  }
}

// const bAPI = new binanceAPI({ debug: false })
// const getLocalLanguage = () => {
//   return navigator.language.split('-')[0] || 'en'
// }
// const defaultChartOptions = {
//   locale: getLocalLanguage(),
//   debug: false,
//   fullscreen: false,
//   autosize: true,
//   interval: '1D', // '1', '3', '5', '15', '30', '60', '120', '240', '360', '480', '720', '1D', '3D', '1W', '1M'
//   theme: 'light',
//   allow_symbol_change: true,
//   hide_side_toolbar: false
// }

// const TradingViewChart = ({ chartOptions }) => {
//   const [isChartReady, setIsChartReady] = useState(false)
//   const widgetOptions = {
//     container_id: "chart_container",
//     datafeed: bAPI,
//     library_path: "../../../scripts/charting_library/",
//     ...defaultChartOptions,
//     ...chartOptions
//   }

//   const chartReady = () => {
//     const tradingViewWidget = new widget(widgetOptions)
//     tradingViewWidget.onChartReady(() => {
//       setIsChartReady(true)
//     })
//   }

//   useEffect(() => {
//     chartReady()
//   }, [])

//   return (
//     <div>
//       <p>Rendering</p>
//       <div id='chart_container'></div>
//     </div>
//   )
// }
// export default TradingViewChart