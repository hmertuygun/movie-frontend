import React, { Fragment, useState, useContext } from 'react'
import TradingViewWidget, { Themes } from 'react-tradingview-widget';
import {
  TabNavigator,
  ButtonNavigator,
  Typography,
  Button,
  Modal,
} from '../components'

const TradeChart = () => (
    <TradingViewWidget 
     symbol="BINANCE:BTCUSDT"
     theme={Themes.DARK}
     hide_side_toolbar={false}
     />
  )


export default TradeChart