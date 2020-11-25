import React, { Fragment, useState, useContext } from 'react'
import SimpleTradeContext, { TradeContext } from './context/SimpleTradeContext'
import { TabNavigator, ButtonNavigator, Typography } from '../components'

import LimitForm from './forms/LimitForm'
import ExitStoploss from './forms/ExitStoploss'
import ExitTarget from './forms/ExitTarget'

const TradePanel = () => (
  <SimpleTradeContext>
    <Trade />
  </SimpleTradeContext>
)

const Trade = () => {
  const { state } = useContext(TradeContext)
  const hasEntry = state.entry.price > 0 ? true : false

  return (
    <section>
      <TabNavigator labelArray={['Place Order', 'Full Trade']} index={1}>
        <div style={{ marginTop: '2rem' }}>
          <Typography as="h3">Not available</Typography>
        </div>

        <div style={{ marginTop: '4rem' }}>
          {!hasEntry && (
            <TabNavigator labelArray={['Limit', 'Market', 'Stop Limit']}>
              <LimitForm />
              <div style={{ marginTop: '4rem' }}>
                <Typography as="h3">Not available</Typography>
              </div>
              <div style={{ marginTop: '4rem' }}>
                <Typography as="h3">Not available</Typography>
              </div>
            </TabNavigator>
          )}

          {hasEntry && (
            <Fragment>
              <Typography as="h3">2. Exits</Typography>
              <ButtonNavigator labelArray={['Target', 'Stop-loss']} index={1}>
                <ExitTarget />
                <ExitStoploss />
              </ButtonNavigator>
            </Fragment>
          )}
        </div>
      </TabNavigator>
    </section>
  )
}

export default TradePanel
