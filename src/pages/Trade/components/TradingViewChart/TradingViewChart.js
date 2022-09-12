import React, { Component } from 'react'
import _ from 'lodash'
import { notify } from 'reapop'
import store from 'store'
import { dataFeed } from 'services/websocket'
import { UserContext } from 'contexts/UserContext'
import { storage } from 'services/storages'
import lzutf8 from 'lzutf8'
import { consoleLogger } from 'utils/logger'
import exportAsImage from 'utils/downloadImage'
import dayjs from 'dayjs'
import MESSAGES from 'constants/Messages'
import {
  backupChartDrawing,
  saveAnalystDrawing,
  saveChartDrawings,
} from 'store/actions'

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
    sniperBtnClicked,
    drawingsBtnClicked,
    onError,
    drawingRendered,
    templateDrawings,
    onMarketPage,
    templateDrawingsOpen,
    tradersBtnClicked,
    activeTrader,
    addedDrawing,
    createBackup,
    selectEmojiPopoverOpen,
    setActiveDrawing,
    setActiveDrawingId,
    isMobile,
    setAddedDrawing,
    setIsChartReady,
    isAnalyst,
  }) {
    super()
    this.dF = new dataFeed({ debug: false, exchange, marketSymbols })
    this.chartId = `chart_${Math.round(Math.random() * 1000)}`
    this.widgetOptions = {
      container_id: this.chartId,
      datafeed: this.dF,
      library_path: '/scripts/charting/charting_library/',
      debug: false,
      fullscreen: false,
      language: getLocalLanguage(),
      autosize: true,
      auto_save_delay: 2,
      timezone: timeZone,
      favorites: {
        intervals: intervals,
      },
      disabled_features: [
        'header_symbol_search',
        'timeframes_toolbar',
        'header_undo_redo',
        'header_screenshot',
        'header_fullscreen_button',
        'compare_symbol',
        'header_compare',
      ],
      symbol,
      theme,
    }
    this.tradingViewWidget = null
    this.chartObject = null
    this.orderLinesDrawn = []
    this.orderLineCount = 0
    this.onMarketPage = onMarketPage
    this.TEMPLATE_LOAD_INTERVAL = 60000
    this.state = {
      isChartReady: false,
      saveCount: 0,
      symbol,
      theme,
      email,
      onMarketPage,
      addedDrawing,
      openOrderLines: [],
      templateDrawings,
      templateDrawingsOpen,
      loadingButton: {},
      screenShotButton: {},
      isSaved: true,
      setError: false,
      intervalId: '',
      activeTrader,
      watchListOpen: false,
    }
  }

  static contextType = UserContext

  chartReady = () => {
    if (!this.tradingViewWidget) return
    try {
      this.tradingViewWidget.onChartReady(() => {
        this.chartObject = this.tradingViewWidget.activeChart()
        this.initChart()
        this.addLoadDrawingsButton()

        this.addHeaderButtons()
        this.props.setIsChartReady(true)
        this.setState({ isChartReady: true })
        consoleLogger('Chart loaded')
        const theme = storage.get('theme')
        this.tradingViewWidget.changeTheme(theme)
      })
    } catch (e) {
      consoleLogger(e)
    }
  }

  onIntervalSelect = () => {
    if (!this.chartObject) return
    try {
      this.chartObject
        .onIntervalChanged()
        .subscribe(null, (interval, timeframeObj) => {
          const capitilizedExchange =
            this.props.exchange.charAt(0).toUpperCase() +
            this.props.exchange.slice(1)
          const itemName = `selectedInterval${capitilizedExchange}`
          storage.set(itemName, interval)
        })
    } catch (e) {
      consoleLogger(e)
    }
  }

  setLastSelectedInterval = () => {
    if (!this.chartObject) return
    const capitilizedExchange =
      this.props.exchange.charAt(0).toUpperCase() + this.props.exchange.slice(1)
    const itemName = `selectedInterval${capitilizedExchange}`
    this.chartObject.setResolution(storage.get(itemName) || '1D')
  }

  chartEvent = (event) => {
    if (!this.tradingViewWidget) return
    try {
      this.tradingViewWidget.subscribe(event, (obj) => {
        this.setClickedDrawing(obj)

        if (event === 'onAutoSaveNeeded' && !this.props.templateDrawingsOpen) {
          this.saveChartDrawingToServer(false)
        }
      })
    } catch (e) {
      consoleLogger(`Error while subscribing to chart events!`)
    }
  }

  setClickedDrawing = async (event) => {
    if (!this.tradingViewWidget) return null
    if (event)
      this.tradingViewWidget.save(async (obj) => {
        const drawing = await obj.charts[0].panes[0].sources.find(
          (el) => el.id === event
        )
        const foundItem = this.tradingViewWidget
          .activeChart()
          .getAllShapes()
          .find((el) => el.id === event)
        if (drawing && foundItem) {
          const points = drawing.points.map((el) => {
            return { time: el.time_t }
          })
          this.props.setActiveDrawing({
            drawing,
            name: foundItem.name,
            points,
            id: event,
          })
        }
      })
  }

  addTemplate = async (template) => {
    if (template && template.drawing) {
      const { points, name, drawing } = template
      try {
        this.tradingViewWidget.activeChart().createMultipointShape(points, {
          shape: name,
          ...drawing.state,
        })
      } catch (error) {
        //consoleLogger(error)
      }
    }
  }

  saveChartDrawingToServer = async (event = true) => {
    if (!this.tradingViewWidget || !this.chartObject) return
    this.setState({ isSaved: false })
    this.tradingViewWidget.save(async (obj) => {
      const str = JSON.stringify(obj.charts[0].panes)
      let compressed = lzutf8.compress(str, {
        outputEncoding: 'Base64',
      })
      try {
        if (!this.props.templateDrawingsOpen) {
          const drawings = {
            drawings: {
              [this.state.email]: compressed,
            },
          }
          if (event) await store.dispatch(backupChartDrawing(drawings))

          await store.dispatch(saveChartDrawings(drawings))
        }

        if (this.props.isAnalyst) {
          let value = {
            drawings: compressed,
            ...(this.props.templateDrawings &&
              this.props.templateDrawings.emojis && {
                flags: this.props.templateDrawings.emojis,
              }),
            ...(this.props.templateDrawings &&
              this.props.templateDrawings.lastUpdate && {
                lastUpdate: new Date().getTime(),
              }),
          }
          await store.dispatch(saveAnalystDrawing(this.state.email, value))
        }
      } catch (e) {
        consoleLogger(e)
        store.dispatch(notify(e.message, 'error'))
      } finally {
        this.setState({ isSaved: true })
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
    } catch (e) {}
  }

  drawOpenOrdersChartLines = async (openOrders) => {
    if (!this.chartObject || !this.state.isChartReady || !openOrders) return
    this.state.processingOrder = true

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
      this.state.processingOrder = false
    } catch (e) {
      consoleLogger(e)
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

    const value = this.state.watchListOpen
      ? 'Go Back to Trading'
      : 'Watchlist Mode'
    await this.tradingViewWidget.headerReady()
    let button = this.tradingViewWidget.createButton()
    button.setAttribute('title', value)
    button.addEventListener('click', (event) => {
      event.target.innerText =
        event.target.innerText === 'Watchlist Mode'
          ? 'Go Back to Trading'
          : 'Watchlist Mode'
      this.props.sniperBtnClicked()
    })
    let img = document.createElement('div')
    img.setAttribute(
      'style',
      'background-color: currentColor;height: 20px;width: 20px;margin-right: 6px;-webkit-mask: url(/img/icons/sniper.svg) no-repeat center / contain;'
    )
    let text = document.createElement('div')
    text.innerText = value
    text.setAttribute('class', 'button-2ioYhFEY')
    text.setAttribute('style', 'display:flex;align-items:center;')
    text.prepend(img)
    button.append(text)

    if (!this.props.isAnalyst) {
      const traderValue = 'View Pro Traders Charts'
      await this.tradingViewWidget.headerReady()
      let traderButton = this.tradingViewWidget.createButton()
      traderButton.setAttribute('title', traderValue)
      traderButton.setAttribute('data-toggle', 'modal')
      traderButton.setAttribute('data-target', '#exampleModal')
      traderButton.addEventListener('click', this.props.tradersBtnClicked)
      let traderImg = document.createElement('div')
      img.setAttribute(
        'style',
        'background-color: currentColor;height: 20px;width: 20px;margin-right: 6px;-webkit-mask: url(/img/icons/sniper.svg) no-repeat center / contain;'
      )
      let traderText = document.createElement('div')
      traderText.innerText = traderValue
      traderText.setAttribute('class', 'button-2ioYhFEY')
      traderText.setAttribute('style', 'display:flex;align-items:center;')
      traderText.prepend(traderImg)
      traderButton.append(traderText)
    }
  }

  headerButtonOnClick = async (event) => {
    if (event === 'screenshot') {
      const canvas = await this.tradingViewWidget.takeClientScreenshot()
      exportAsImage(
        canvas,
        `CoinPanel_${this.props.symbol}_${dayjs().format(
          'YYYY-MM-DD_HH-mm-ss'
        )}`
      )
    } else if (event === 'fullscreen') {
      this.tradingViewWidget.startFullscreen()
    }
  }

  addHeaderButtons = async () => {
    if (!this.tradingViewWidget) return
    await this.tradingViewWidget.headerReady()
    let button = this.tradingViewWidget.createButton({ align: 'right' })
    button.setAttribute('title', `Take a snapshot`)
    button.addEventListener('click', () => {
      this.headerButtonOnClick('screenshot')
    })
    this.state.screenShotButton = button
    this.state.screenShotButton.style = {}
    let text = document.createElement('div')
    text.innerText = 'Take a snapshot'
    text.setAttribute('class', 'button-2ioYhFEY')
    text.setAttribute(
      'style',
      'background-color: currentColor;height: 28px;width: 28px;-webkit-mask: url(/img/icons/camera.svg) no-repeat center / contain;'
    )
    button.append(text)

    let button3 = this.tradingViewWidget.createButton({ align: 'right' })
    button3.setAttribute('title', `Fullscreen mode`)
    button3.addEventListener('click', () => {
      this.headerButtonOnClick('fullscreen')
    })
    let text3 = document.createElement('div')
    text3.innerText = 'Fullscreen'
    text3.setAttribute('class', 'button-2ioYhFEY')
    text3.setAttribute(
      'style',
      'background-color: currentColor;height: 28px;width: 28px;-webkit-mask: url(/img/icons/fullscreen.svg) no-repeat center / contain;'
    )
    button3.append(text3)
  }

  addLoadDrawingsButton = async () => {
    if (!this.tradingViewWidget) return
    await this.tradingViewWidget.headerReady()
    let loadingButton = this.tradingViewWidget.createButton({ align: 'right' })
    loadingButton.setAttribute('class', 'button-2ioYhFEY')
    this.state.loadingButton.style = {}
    this.state.loadingButton.innerText = 'Click to Save'
    loadingButton.addEventListener('click', () => {
      this.saveChartDrawingToServer()
    })
    loadingButton.setAttribute('style', 'align-items:center;')
    this.state.loadingButton = loadingButton
  }

  initChart = () => {
    try {
      if (!this.tradingViewWidget) return
      if (this.props.drawings && !this.props.templateDrawingsOpen) {
        //loading drawings sends extra kLines API and gives 'subscribeBars of undefined' error
        try {
          const pData = JSON.parse(this.props.drawings)
          this.tradingViewWidget.save((obj) => {
            const prep = { ...obj.charts[0], panes: pData }
            if (prep) {
              this.tradingViewWidget.load(prep)
            }
          })
        } catch (error) {
          consoleLogger('Init Drawings')
        }
      } else if (this.props.templateDrawingsOpen) {
        let pData = JSON.parse(this.props.activeTrader.drawings)

        this.tradingViewWidget.save((obj) => {
          const prep = { ...obj.charts[0], panes: pData }
          this.tradingViewWidget.load(prep)
          this.setState({
            templateDrawings: this.props.activeTrader,
            templateDrawingsOpen: true,
          })
        })
      }
    } catch (e) {
      consoleLogger(e)
    } finally {
      this.setLastSelectedInterval()
      this.onIntervalSelect()
      setTimeout(() => {
        this.chartEvent('onAutoSaveNeeded')
        this.chartEvent('drawing_event')
      }, 5000)
      consoleLogger('Drawings and Intervals loaded')
    }
  }

  chartShortCutSave = () => {
    this.tradingViewWidget.onShortcut('ctrl+s', () => {
      consoleLogger('shortcut saved')
    })
  }

  changeIframeCSS = () => {
    const getIFrame = document.querySelector("iframe[id*='tradingview']")
    consoleLogger(getIFrame)
    var cssLink = document.createElement('link')
    cssLink.href = 'chart.css'
    cssLink.rel = 'stylesheet'
    cssLink.type = 'text/css'
    getIFrame?.contentDocument.head.appendChild(cssLink)
  }

  setTemplateDrawings() {
    if (this.props.templateDrawingsOpen && this.state.isChartReady) {
      if (
        this.props.activeTrader.drawings !==
          this.state.templateDrawings.drawings ||
        !this.state.templateDrawingsOpen
      ) {
        try {
          let pData = ''
          if (this.props.activeTrader) {
            pData = JSON.parse(this.props.activeTrader.drawings)
          }
          this.tradingViewWidget.save((obj) => {
            const prep = { ...obj.charts[0], panes: pData }
            this.tradingViewWidget.load(prep)
            this.setState({
              templateDrawings: this.props.activeTrader,
              templateDrawingsOpen: true,
            })
            this.drawOpenOrdersChartLines(this.state.openOrderLines)
          })
        } catch (e) {
          consoleLogger(e)
        }
      }
    }
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
      watchListOpen: newProps.watchListOpen,
    }
  }

  componentDidMount() {
    consoleLogger('Chart starting to load')
    this.tradingViewWidget = window.tvWidget = new window.TradingView.widget(
      this.widgetOptions
    )
    this.chartReady()
  }

  componentDidUpdate(prevProps, props) {
    if (!this.tradingViewWidget) return

    try {
      if (this.props.settingChartDrawings) {
        if (prevProps.drawings !== this.props.drawings) {
          if (this.props.drawings && !this.props.templateDrawingsOpen) {
            const pData = JSON.parse(this.props.drawings)
            this.tradingViewWidget.save((obj) => {
              const prep = { ...obj.charts[0], panes: pData }
              this.tradingViewWidget.load(prep)
            })
          }
        }
      }
    } catch (err) {}
    if (props.theme !== this.state.theme)
      this.tradingViewWidget.changeTheme(this.state.theme)
    this.changeSymbol(this.state.symbol)

    if (prevProps.exchange !== this.props.exchange && this.props.exchange) {
      storage.set('selectedExchange', this.props.exchange)
      const newWidget = this.widgetOptions
      const newFeed = new dataFeed({
        debug: false,
        exchange: this.props.exchange,
        marketSymbols: this.props.marketSymbols,
      })
      this.tradingViewWidget = window.tvWidget = new window.TradingView.widget({
        ...newWidget,
        datafeed: newFeed,
      })
      this.chartReady()
    }

    if (!this.isArrayEqual(this.state.openOrderLines, props.openOrderLines)) {
      this.drawOpenOrdersChartLines(this.state.openOrderLines)
    }
    if (!_.isEqual(this.state.openOrderLines, props.openOrderLines)) {
      this.drawOpenOrdersChartLines(this.state.openOrderLines)
    }

    if (this.props.templateDrawingsOpen && !this.state.intervalId) {
      this.setTemplateDrawings()
      this.state.intervalId = setInterval(
        this.setTemplateDrawings.bind(this),
        this.TEMPLATE_LOAD_INTERVAL
      )
    }
    if (!this.props.templateDrawingsOpen && this.state.templateDrawingsOpen) {
      try {
        if (!this.tradingViewWidget) return
        if (this.props.drawings) {
          const pData = JSON.parse(this.props.drawings)
          this.tradingViewWidget.save((obj) => {
            const prep = { ...obj.charts[0], panes: pData }
            this.tradingViewWidget.load(prep)
          })
        }
      } catch (e) {
        consoleLogger(e)
      } finally {
        this.setState({
          templateDrawingsOpen: false,
          isSaved: true,
          intervalId: null,
        })
        this.drawOpenOrdersChartLines(this.state.openOrderLines)
      }
    }

    if (typeof this.props.addedDrawing === 'object') {
      this.addTemplate(this.props.addedDrawing)
      this.props.setAddedDrawing(null)
    }

    if (this.state.isSaved && this.state.loadingButton.style) {
      this.state.loadingButton.setAttribute('style', 'margin: 7px;')
      this.state.loadingButton.innerText = 'Click to Save'
    }

    if (!this.state.isSaved && this.state.loadingButton) {
      this.state.loadingButton.setAttribute('style', 'margin: 7px;')
      this.state.loadingButton.innerText = 'Saving...'
    }

    if (
      !this.props.templateDrawingsOpen &&
      this.state.loadingButton.style &&
      this.state.loadingButton.parentNode.parentNode &&
      this.props.activeTrader?.name
    ) {
      this.state.loadingButton.parentNode.parentNode.style.display = 'block'
    }

    if (
      this.props.templateDrawingsOpen &&
      this.state.loadingButton.style &&
      this.state.loadingButton.parentNode.parentNode
    ) {
      this.state.loadingButton.parentNode.parentNode.style.display = 'none'
    }

    if (
      this.onMarketPage &&
      this.props.templateDrawingsOpen &&
      this.state.screenShotButton.style &&
      this.state.screenShotButton.parentNode.parentNode
    ) {
      this.state.screenShotButton.parentNode.parentNode.style.display = 'none'
    }

    if (
      this.onMarketPage &&
      !this.props.templateDrawingsOpen &&
      this.state.screenShotButton.style &&
      this.state.screenShotButton.parentNode.parentNode
    ) {
      this.state.screenShotButton.parentNode.parentNode.style.display = 'block'
    }

    if (
      this.props.isMobile &&
      !this.props.templateDrawingsOpen &&
      this.state.screenShotButton.style &&
      this.state.screenShotButton.parentNode.parentNode
    ) {
      this.state.screenShotButton.parentNode.parentNode.style.display = 'none'
    }

    if (this.props.onError && !this.state.setError) {
      this.setState({ setError: true })
      const newWidget = this.widgetOptions
      newWidget.disabled_features.push('left_toolbar')
      this.tradingViewWidget = window.tvWidget = new window.TradingView.widget(
        newWidget
      )
      this.chartReady()

      setTimeout(() => {
        store.dispatch(notify(MESSAGES['drawing-load-failed'], 'error'))
      }, 2000)
    }

    if (this.state.activeTrader?.id !== this.props.activeTrader?.id) {
      this.setTemplateDrawings()
      this.setState({ activeTrader: this.props.activeTrader })
    }
  }

  componentWillUnmount() {
    consoleLogger(`Chart component unmounted`)
    if (this.state.intervalId) {
      clearInterval(this.state.intervalId)
    }
  }

  componentDidCatch() {
    consoleLogger(`Error while rendering chart`)
    consoleLogger(this.tradingViewWidget)
    consoleLogger(this.chartObject)
    consoleLogger(this.state.isChartReady)
  }

  render() {
    return (
      <>
        <div
          id={this.chartId}
          style={{
            height: '100%',
            width: this.state.isChartReady ? '100%' : '0',
          }}
        ></div>
        {!this.state.isChartReady && !this.state.loadingButton?.style ? (
          <span className="spinner-border spinner-border-sm text-primary" />
        ) : null}
      </>
    )
  }
}
