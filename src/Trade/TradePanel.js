import React, { Fragment, useState, useContext } from 'react'
import { placeOrder } from '../api/api'
import SimpleTradeContext, { TradeContext } from './context/SimpleTradeContext'
import {
  TabNavigator,
  ButtonNavigator,
  Typography,
  Button,
  Modal,
} from '../components'

import TradeTableContainer from './components/TradeTableContainer'
import TradeModal from './components/TradeModal/TradeModal'

import LimitForm from './forms/LimitForm'
import ExitStoploss from './forms/ExitStoploss'
import ExitTarget from './forms/ExitTarget'

const TradePanel = () => (
  <SimpleTradeContext>
    <Trade />
  </SimpleTradeContext>
)

const Trade = () => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const { state, clear } = useContext(TradeContext)
  const hasEntry = state.entry?.price > 0 ? true : false

  function checkAllTypes() {
    const targets = state && state.targets && state.targets[0].quantity > 0
    const stoploss = state && state.stoploss && state.stoploss[0].quantity > 0

    return targets && stoploss && hasEntry
  }

  const ableToPostFulltrade = checkAllTypes()

  const doPlaceOrder = async () => {
    try {
      await placeOrder({ ...state })
      setIsModalVisible(false)
      clear()
    } catch (error) {
      console.error({ error, message: 'Order was not sent' })
      setIsModalVisible(false)
      clear()
    }
  }

  return (
    <Fragment>
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

            {ableToPostFulltrade && (
              <Button
                variant="confirm"
                onClick={() => {
                  setIsModalVisible(true)
                }}
              >
                Place Fulltrade
              </Button>
            )}

            <TradeTableContainer />
          </div>
        </TabNavigator>
      </section>

      {isModalVisible && (
        <Modal onClose={() => setIsModalVisible(false)}>
          <TradeModal
            onClose={() => setIsModalVisible(false)}
            placeOrder={doPlaceOrder}
          />
        </Modal>
      )}
    </Fragment>
  )
}

export default TradePanel
