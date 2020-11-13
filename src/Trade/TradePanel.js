import React from 'react'
import { Route } from 'react-router-dom'
import { Typography } from '../components'
import LimitForm from './forms/LimitForm'
import ExitStoploss from './forms/ExitStoploss'
import ExitTarget from './forms/ExitTarget'

const TradePanel = () => {

  return (
    <section>
      <Typography as="h2">
        TradePanel
       </Typography>

       <Route exact path="/trade" component={LimitForm} />
       <Route path="/trade/target" component={ExitTarget} />
       <Route path="/trade/stoploss" component={ExitStoploss} />
    </section>
  )
}

export default TradePanel