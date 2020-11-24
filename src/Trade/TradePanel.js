import React, { Fragment, useState } from 'react'
import SimpleTradeContext from './context/SimpleTradeContext'
import { TabNavigator, ButtonNavigator, Typography } from '../components'

import LimitForm from './forms/LimitForm'
import ExitStoploss from './forms/ExitStoploss'
import ExitTarget from './forms/ExitTarget'

const TradePanel = () => {
  const entry = true

  return (
    <SimpleTradeContext>
      <section>
        <TabNavigator labelArray={['Place Order', 'Full Trade']} index={1}>
          <div style={{ marginTop: '2rem' }}>
            <Typography as="h3">Not available</Typography>
          </div>

          <div style={{ marginTop: '4rem' }}>
            {!entry && (
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

            {entry && (
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
    </SimpleTradeContext>
  )
}

export default TradePanel
