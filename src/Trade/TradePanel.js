import React, { Fragment, useState, useContext, useEffect } from 'react'
import { placeOrder } from '../api/api'
import SimpleTradeContext, { TradeContext } from './context/SimpleTradeContext'
import { SymbolContext } from './context/SymbolContext'
import {
  TabNavigator,
  ButtonNavigator,
  Typography,
  Button,
  Modal,
} from '../components'

import TradeTableContainer from './components/TradeTableContainer'
import TradeModal from './components/TradeModal/TradeModal'
import TradeOverview from './components/TradeOverview/TradeOverview'

import LimitForm from './forms/LimitForm'
import MarketForm from './forms/MarketForm'
import ExitStoplossStopLimit from './forms/ExitStoplossStopLimit'
import ExitStoplossStopMarket from './forms/ExitStoplossStopMarket'
import ExitTarget from './forms/ExitTarget'
import ExitTargetStopMarket from './forms/ExitTargetStopMarket'
import { addPrecisionToNumber } from '../helpers/precisionRound'

const TradePanel = () => (
  <SimpleTradeContext>
    <Trade />
  </SimpleTradeContext>
)

const Trade = () => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const { state, clear } = useContext(TradeContext)
  const { selectedSymbol } = useContext(SymbolContext)
  const hasEntry = state.entry?.quantity > 0 ? true : false

  function checkAllTypes() {
    const targets =
      state &&
      state.targets &&
      state.targets.length > 0 &&
      state.targets[0].quantity > 0
    const stoploss =
      state &&
      state.stoploss &&
      state.stoploss.length > 0 &&
      state.stoploss[0].quantity > 0

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

  useEffect(() => {
    clear()
  }, [selectedSymbol])

  return (
    <Fragment>
      <section>
        <TabNavigator labelArray={['Full Trade']} index={0}>
          <div style={{ marginTop: '4rem' }}>
            {!hasEntry && (
              <div style={{ marginTop: '2rem' }}>
                <Typography as="h3">1. Entry Order</Typography>
              </div>
            )}

            {!hasEntry && (
              <TabNavigator labelArray={['Limit', 'Market']}>
                <LimitForm />
                <MarketForm />
              </TabNavigator>
            )}

            {hasEntry && (
              <Fragment>
                <Typography as="h3">2. Exits</Typography>
                <ButtonNavigator
                  labelArray={['Target', 'Stop-loss']}
                  index={1}
                >
                  <TabNavigator labelArray={['Limit', 'Stop-market']}>
                    <ExitTarget />
                    <ExitTargetStopMarket />
                  </TabNavigator>
                  <TabNavigator
                    labelArray={['Stop-limit', 'Stop-market']}
                    index={0}
                  >
                    <ExitStoplossStopLimit />
                    <ExitStoplossStopMarket />
                  </TabNavigator>
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

          <div style={{ marginTop: '2rem' }}>
            <Typography as="h3">Not!! available</Typography>
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
