import React from 'react'
import { Route } from 'react-router-dom'
import TradeContextContainer, { useTrade } from './context/TradeContext'

import { TabNavigator, Typography } from '../components'

import LimitForm from './forms/LimitForm'
import ExitStoploss from './forms/ExitStoploss'
import ExitTarget from './forms/ExitTarget'

const TradePanel = () => {
  return (
    <TradeContextContainer>
      <section>
        <TabNavigator labelArray={['Place Order', 'Full Trade']} index={1}>
          <div>
            <Typography as="h2">Not available</Typography>
          </div>
          <div>
            <LimitForm />
          </div>
        </TabNavigator>

        <Route path="/trade/target" component={ExitTarget} />
        <Route path="/trade/stoploss" component={ExitStoploss} />
      </section>
    </TradeContextContainer>
  )
}

export default TradePanel
