import React, { Component } from 'react'
import _ from 'lodash'
import dataFeed from './dataFeed'
import { saveChartDrawing } from '../../../api/api'
import { errorNotification } from '../../../components/Notifications'

const getLocalLanguage = () => {
  return navigator.language.split('-')[0] || 'en'
}
export default class TradingViewChart extends Component {
  constructor({
    symbol,
    theme,
    email,
    timeZone,
    intervals,
    drawings,
    openOrders,
    delOrderId,
    exchange,
    marketSymbols,
    chartReady,
    sniperBtnClicked,
    drawingRendered,
  }) {
    super()
    this.dF = new dataFeed({ debug: false, exchange, marketSymbols })
    this.widgetOptions = {
      container_id: 'chart_container',
      datafeed: this.dF,
      library_path: '/scripts/charting/charting_library/',
      debug: false,
      fullscreen: false,
      language: getLocalLanguage(),
      autosize: true,
      auto_save_delay: 5,
      timezone: timeZone,
      favorites: {
        intervals: intervals,
      },
      disabled_features: [
        'header_symbol_search',
        'timeframes_toolbar',
        'header_undo_redo',
      ],
      symbol,
      theme,
    }
    this.tradingViewWidget = null
    this.chartObject = null
    this.orderLinesDrawn = []
    this.orderLineCount = 0
    this.state = {
      isChartReady: false,
      saveCount: 0,
      symbol,
      theme,
      email,
      openOrderLines: [],
    }
  }

  chartReady = () => {
    if (!this.tradingViewWidget) return
    try {
      this.tradingViewWidget.onChartReady(() => {
        this.chartObject = this.tradingViewWidget.activeChart()
        this.initChart()
        // this.chartEvent("drawing_event")
        this.addSniperModeButton()
      })
    } catch (e) {
      console.log(e)
    }
  }

  onIntervalSelect = () => {
    if (!this.chartObject) return
    try {
      this.chartObject
        .onIntervalChanged()
        .subscribe(null, (interval, timeframeObj) => {
          if (this.props.exchange === 'binance') {
            localStorage.setItem('selectedIntervalBinance', interval)
          } else if (this.props.exchange === 'ftx') {
            localStorage.setItem('selectedIntervalFtx', interval)
          } else if (this.props.exchange === 'binanceus') {
            localStorage.setItem('selectedIntervalBinanceus', interval)
          }
        })
    } catch (e) {
      console.log(e)
    }
  }

  setLastSelectedInterval = () => {
    if (!this.chartObject) return
    if (this.props.exchange === 'binance') {
      this.chartObject.setResolution(
        localStorage.getItem('selectedIntervalBinance') || '1D'
      )
    } else if (this.props.exchange === 'ftx') {
      this.chartObject.setResolution(
        localStorage.getItem('selectedIntervalFtx') || '1D'
      )
    } else if (this.props.exchange === 'binanceus') {
      this.chartObject.setResolution(
        localStorage.getItem('selectedIntervalBinanceus') || '1D'
      )
    }
  }

  chartEvent = (event) => {
    if (!this.tradingViewWidget) return
    try {
      this.tradingViewWidget.subscribe(event, (obj) => {
        this.saveChartDrawingToServer(event)
      })
    } catch (e) {
      console.log(`Error while subscribing to chart events!`)
    }
  }

  saveChartDrawingToServer = (event) => {
    this.tradingViewWidget.save(async (obj) => {
      try {
        const str = JSON.stringify(obj.charts[0].panes)
        await saveChartDrawing(this.state.email, str)
      } catch (e) {
        errorNotification.open({
          description: e.message,
        })
      }
    })
  }

  changeSymbol = (newSymbol) => {
    if (!newSymbol || !this.tradingViewWidget || !this.chartObject) return
    try {
      const symbObj = this.tradingViewWidget.symbolInterval()
      if (!symbObj) return
      this.tradingViewWidget.setSymbol(newSymbol, symbObj.interval, () => {})
      // this.chartObject.setSymbol(newSymbol)
    } catch (e) {
      console.log(e)
    }
  }

  drawOpenOrdersChartLines = async (openOrders) => {
    if (!this.chartObject || !this.state.isChartReady || !openOrders) return

    const PlacedOrderTooltip = 'Order is on the exchange order book.'
    const PendingOrderTooltip =
      'Order is waiting to be placed in the order book.'
    const entryNotFilledToolTip =
      'Order will be activated after entry is completed.'

    const green = '#3cb690'
    const red = 'rgba(242, 87, 103, 1)'
    const redOpaque = 'rgba(242, 87, 103, 0.6)'

    try {
      for (let i = 0; i < this.orderLinesDrawn.length; i++) {
        const { line_id } = this.orderLinesDrawn[i]
        this.chartObject.setEntityVisibility(line_id, false)
      }
      this.orderLinesDrawn = []
      for (let i = 0; i < openOrders.length; i++) {
        const { trade_id, orders, type } = openOrders[i]
        const isFullTrade = type.includes('Full')
        for (let j = 0; j < orders.length; j++) {
          const {
            type,
            total,
            side,
            quote_asset,
            status,
            price,
            trigger,
            symbol,
          } = orders[j]
          // if order status is filled , don't draw it
          if (
            status.toLowerCase() === 'filled' &&
            symbol.toLowerCase() !== 'entry'
          )
            continue
          let entryStatus
          if (isFullTrade) {
            entryStatus = orders[0]?.status?.toLowerCase()
          }
          let orderColor
          if (side === 'Sell') {
            const condition = entryStatus && entryStatus !== 'filled'
            orderColor = condition ? redOpaque : red
          } else if (side === 'Buy') {
            orderColor = green
          } else {
            orderColor = '#000'
          }
          let orderText
          if (
            symbol.toLowerCase() === 'entry' &&
            status.toLowerCase() === 'filled'
          ) {
            orderText = 'Entry'
          } else {
            orderText = type.includes('STOP')
              ? `${type.replace('-', ' ')} Trigger ${trigger}`
              : type
          }
          let toolTipText
          let orderPrice
          let orderLineId
          if (isFullTrade) {
            if (symbol.toLowerCase() === 'entry') {
              if (status.toLowerCase() === 'placed') {
                toolTipText = PlacedOrderTooltip
              } else if (status.toLowerCase() === 'filled') {
                toolTipText = 'Entry is filled'
              } else {
                let toolTip = ''
                for (let k = 1; k < orders.length; k++) {
                  // Stop-loss, Target 1, Stop-market in symbol
                  let symbolKey = orders[k].symbol
                  symbolKey = symbolKey.replace('-', ' ')
                  let splKey = symbolKey.split(' ')
                  toolTip =
                    toolTip +
                    splKey[0].charAt(0).toUpperCase() +
                    splKey[1].charAt(0).toUpperCase() +
                    ' ' +
                    orders[k].trigger +
                    ', '
                }
                toolTipText = toolTip
              }
            } else {
              if (orderColor === redOpaque) {
                toolTipText = entryNotFilledToolTip
              } else if (status.toLowerCase() === 'pending') {
                toolTipText = PendingOrderTooltip
              } else if (status.toLowerCase() !== 'pending') {
                toolTipText = PlacedOrderTooltip
              }
            }
            if (trigger && trigger.length) {
              // price can be "Market"
              if (
                symbol.toLowerCase() === 'entry' &&
                status.toLowerCase() !== 'filled'
              ) {
                orderPrice = trigger
              } else if (
                symbol.toLowerCase() === 'entry' &&
                status.toLowerCase() === 'filled'
              ) {
                orderPrice = price
              } else {
                if (trigger.includes('>=')) {
                  let split = trigger.split('>= ')
                  orderPrice = split[1]
                } else if (trigger.includes('<=')) {
                  let split = trigger.split('<= ')
                  orderPrice = split[1]
                }
              }
            } else {
              orderPrice = price
            }
            orderLineId =
              trade_id + '-' + symbol.toLowerCase().replace(' ', '-')
          } else {
            orderPrice = price === 'Market' ? trigger : price
            toolTipText =
              status.toLowerCase() === 'pending'
                ? PendingOrderTooltip
                : PlacedOrderTooltip
            orderLineId = trade_id
          }
          let entity = this.chartObject
            .createOrderLine()
            .setTooltip(toolTipText)
            .setLineLength(60)
            .setExtendLeft(false)
            .setLineColor(orderColor)
            .setBodyBorderColor(orderColor)
            .setBodyTextColor(orderColor)
            .setQuantityBackgroundColor(orderColor)
            .setQuantityBorderColor(orderColor)
            .setQuantityTextColor('rgb(255,255,255)')
            .setText(orderText)
            .setQuantity(`${total} ${quote_asset}`)
            .setPrice(orderPrice)
          this.orderLinesDrawn.push({
            line_id: entity?._line?._id,
            id: orderLineId,
            status: status.toLowerCase(),
            trade_id,
            entity,
          })
        }
      }
    } catch (e) {
      console.log(e)
    }
  }

  deleteOpenOrderLine = (trade_id) => {
    if (!this.chartObject || !this.state.isChartReady || !trade_id) return
    let fData = this.orderLinesDrawn.find((item) => item.trade_id === trade_id)
    if (fData && fData.line_id)
      this.chartObject.setEntityVisibility(fData.line_id, false)
  }

  removeAllDrawingsCB = () => {
    if (!this.chartObject) return
    this.chartObject.removeAllShapes()
    localStorage.removeItem('savedDrawing')
  }

  addRemoveDrawingsButton = async () => {
    if (!this.tradingViewWidget) return
    await this.tradingViewWidget.headerReady()
    var button = this.tradingViewWidget.createButton()
    button.setAttribute('title', 'Clear all Drawings')
    button.setAttribute('class', 'btn btn-primary')
    button.addEventListener('click', this.removeAllDrawingsCB)
    button.textContent = 'Clear Drawings'
  }

  addSniperModeButton = async () => {
    if (!this.tradingViewWidget) return
    await this.tradingViewWidget.headerReady()
    let button = this.tradingViewWidget.createButton()
    button.setAttribute('title', 'Sniper Mode')
    button.addEventListener('click', this.props.sniperBtnClicked)
    let img = document.createElement('div')
    img.setAttribute(
      'style',
      'background-color: currentColor;height: 20px;width: 20px;margin-right: 6px;-webkit-mask: url(/img/icons/sniper.svg) no-repeat center / contain;'
    )
    let text = document.createElement('div')
    text.innerText = 'Sniper Mode'
    text.setAttribute('class', 'button-2ioYhFEY')
    text.setAttribute('style', 'display:flex;align-items:center;')
    text.prepend(img)
    button.append(text)
  }

  initChart = () => {
    try {
      if (!this.tradingViewWidget) return
      if (this.props.drawings) {
        //loading drawings sends extra kLines API and gives 'subscribeBars of undefined' error
        const pData = JSON.parse(this.props.drawings)
        this.tradingViewWidget.save((obj) => {
          const prep = { ...obj.charts[0], panes: pData }
          this.tradingViewWidget.load(prep)
        })
      }
    } catch (e) {
      console.error(e)
    } finally {
      this.setLastSelectedInterval()
      this.onIntervalSelect()
      this.setState({
        isChartReady: true,
      })
      this.chartEvent('onAutoSaveNeeded')
      // this.chartShortCutSave()
      // this.chartEvent("study_event")
      setTimeout(() => {
        this.props.chartReady(true)
      }, 2500)
    }
  }

  chartShortCutSave = () => {
    this.tradingViewWidget.onShortcut('ctrl+s', () => {
      console.log('shortcut saved')
    })
  }

  changeIframeCSS = () => {
    const getIFrame = document.querySelector("iframe[id*='tradingview']")
    console.log(getIFrame)
    var cssLink = document.createElement('link')
    cssLink.href = 'chart.css'
    cssLink.rel = 'stylesheet'
    cssLink.type = 'text/css'
    getIFrame?.contentDocument.head.appendChild(cssLink)
  }

  isArrayEqual(newOrders, oldOrders) {
    if (!newOrders) return true
    let newArray = []
    for (let i = 0; i < newOrders.length; i++) {
      const { trade_id, orders, type } = newOrders[i]
      const isFullTrade = type.includes('Full')
      for (let j = 0; j < orders.length; j++) {
        const { symbol, status } = orders[j]
        const id = isFullTrade
          ? trade_id + '-' + symbol.toLowerCase().replace(' ', '-')
          : trade_id
        if (
          status.toLowerCase() === 'filled' &&
          symbol.toLowerCase() !== 'entry'
        )
          continue
        newArray.push({ id, status: status.toLowerCase() })
      }
    }
    const mappedDrawnLines = this.orderLinesDrawn.map((item) => ({
      id: item.id,
      status: item.status,
    }))
    return JSON.stringify(newArray) === JSON.stringify(mappedDrawnLines)
  }

  static getDerivedStateFromProps(newProps, prevState) {
    return {
      ...prevState,
      theme: newProps.theme,
      symbol: newProps.symbol,
      openOrderLines: newProps.openOrders,
    }
  }

  componentDidMount() {
    this.tradingViewWidget = window.tvWidget = new window.TradingView.widget(
      this.widgetOptions
    )
    this.chartReady()
  }

  componentDidUpdate(prevProps, props) {
    if (!this.tradingViewWidget) return
    if (props.theme !== this.state.theme)
      this.tradingViewWidget.changeTheme(this.state.theme)
    this.changeSymbol(this.state.symbol)

    if (!this.isArrayEqual(this.state.openOrderLines, props.openOrderLines)) {
      this.drawOpenOrdersChartLines(this.state.openOrderLines)
    }
    if (!_.isEqual(this.state.openOrderLines, props.openOrderLines)) {
      this.drawOpenOrdersChartLines(this.state.openOrderLines)
    }
  }

  componentWillUnmount() {
    console.info(`Chart component unmounted`)
  }

  componentDidCatch() {
    console.info(`Error while rendering chart`)
    console.log(this.tradingViewWidget)
    console.log(this.chartObject)
    console.log(this.state.isChartReady)
  }

  render() {
    return (
      <div
        id="chart_container"
        style={{
          width: '100%',
          height: '100%',
          display: this.state.isChartReady ? 'block' : 'none',
        }}
      ></div>
    )
  }
}
