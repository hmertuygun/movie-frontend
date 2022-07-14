import { getSocketEndpoint, tickerSocketSubscribe } from 'services/exchanges'
import { consoleLogger } from 'utils/logger'

const watchPanelSocket = async ({ exchange, symbolList }) => {
  const url = await getSocketEndpoint(exchange)
  const ws = new WebSocket(url)

  ws.onopen = (e) => {
    symbolList[exchange].forEach((element) => {
      let subData = tickerSocketSubscribe(exchange, element)
      ws.send(subData)
    })
  }

  ws.close = (e) => {
    consoleLogger(`${exchange}  WS Closed`, e)
  }

  ws.onerror = (err) => {
    consoleLogger(`${exchange}  Error`, err)
  }

  const id = setInterval(() => {
    ws.send(JSON.stringify({ ping: 1535975085052 }))
  }, 10000)

  return { ws: ws, id: id }
}

export default watchPanelSocket
