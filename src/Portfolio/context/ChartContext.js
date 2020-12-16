import React, { Component, createContext } from 'react'

export const ChartContext = createContext()

class ChartDataCtxProvider extends Component {
  state = {
    coins: [],
    digCoin: [],
    sou: [],
    passSocket: undefined,
  }

  componentDidMount() {
    this.socketCall()
  }

  componentDidUpdate() {}

  socketCall = () => {
    const ws = new WebSocket(
      'wss://stream.binance.com:9443/ws/bnbusdt@depth@trade1000ms'
    )
    const msg = {
      method: 'SUBSCRIBE',
      params: ['bnbusdt@trade'],
      id: 1,
    }

    ws.onopen = () => {
      ws.send(JSON.stringify(msg))
    }

    ws.onmessage = (e) => {
      const value = e.data
      this.setState({
        coins: value,
      })
    }

    this.setState({
      passSocket: ws,
    })
  }

  socketClose = () => {
    var wss = this.state.passSocket
    wss.close()
  }

  render() {
    return (
      <ChartContext.Provider
        value={{
          ...this.state,
          socketCall: this.socketCall,
          socketClose: this.socketClose,
        }}
      >
        {this.props.children}
      </ChartContext.Provider>
    )
  }
}

export default ChartDataCtxProvider
