import React, { Fragment, useState, useContext, useEffect } from 'react'
import { X } from 'react-feather'
import { isMobile } from 'react-device-detect'
import { placeOrder } from '../api/api'
import SimpleTradeContext, { TradeContext } from './context/SimpleTradeContext'
import { TabContext } from '../contexts/TabContext'
import {
  errorNotification,
  successNotification,
} from '../components/Notifications'
import { SymbolContext } from './context/SymbolContext'
import { UserContext } from '../contexts/UserContext'
import {
  TabNavigator,
  ButtonNavigator,
  Typography,
  Button,
  Modal,
} from '../components'

import TradeTableContainer from './components/TradeTableContainer'
import TradeModal from './components/TradeModal/TradeModal'

import LimitForm from './forms/LimitForm/LimitForm'
import MarketForm from './forms/MarketForm/MarketForm'
import ExitStoplossStopLimit from './forms/ExitStoplossStopLimit/ExitStoplossStopLimit'
import ExitStoplossStopMarket from './forms/ExitStoplossStopMarket/ExitStoplossStopMarket'
import ExitTarget from './forms/ExitTarget/ExitTarget'
import ExitTargetStopMarket from './forms/ExitTargetStopMarket/ExitTargetStopMarket'
import EntryStopLimitForm from './forms/EntryStopLimitForm/EntryStopLimitForm'
import EntryStopMarketForm from './forms/EntryStopMarketForm/EntryStopMarketForm'

import BuyLimitForm from './forms/BuyLimitForm/BuyLimitForm'
import BuyMarketForm from './forms/BuyMarketForm/BuyMarketForm'
import BuyStopLimitForm from './forms/BuyStopLimitForm/BuyStopLimitForm'
import BuyStopMarketForm from './forms/BuyStopMarketForm/BuyStopMarketForm'

import SellLimitForm from './forms/SellLimitForm/SellLimitForm'
import SellMarketForm from './forms/SellMarketForm/SellMarketForm'
import SellStopLimitForm from './forms/SellStopLimitForm/SellStopLimitForm'
import SellStopMarketForm from './forms/SellStopMarketForm/SellStopMarketForm'

import TakeProfitLimitForm from './forms/TakeProfitLimitForm/TakeProfitLimitForm'
import TakeProfitMarketForm from './forms/TakeProfitMarketForm/TakeProfitMarketForm'

const TradePanel = () => (
  <SimpleTradeContext>
    <Trade />
  </SimpleTradeContext>
)

const Trade = () => {
  const [isBtnDisabled, setBtnVisibility] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const { state, clear } = useContext(TradeContext)
  const { selectedSymbol, setIsOrderPlaced } = useContext(SymbolContext)
  const { activeExchange } = useContext(UserContext)
  const { setIsTradePanelOpen } = useContext(TabContext)

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
      if (isBtnDisabled) return
      setBtnVisibility(true)
      setIsOrderPlaced(false)
      const { data, status } = await placeOrder({ ...state, ...activeExchange })
      if (data?.status === "error") {
        errorNotification.open({ description: data?.error || `Order couldn't be created. Please try again later!` })
      }
      else {
        successNotification.open({ description: `Order Created!` })
      }
      setIsModalVisible(false)
      setIsTradePanelOpen(false)
      clear()
    } catch (error) {
      console.error({ error, message: 'Order was not sent' })
      setIsModalVisible(false)
      errorNotification.open({
        description: `Order couldn't be created. Please try again later!`,
      })
      clear()
    } finally {
      setIsOrderPlaced(true)
      setBtnVisibility(false)
    }
  }

  useEffect(() => {
    clear()
  }, [selectedSymbol])

  return (
    <Fragment>
      <section>
        <div
          style={{ position: 'absolute', top: '25px', right: '25px' }}
          onClick={() => setIsTradePanelOpen(false)}
        >
          {isMobile && <X />}
        </div>
        <TabNavigator labelArray={['Place Order', 'Full Trade']} index={0}>
          <div style={{ marginTop: '2rem' }}>
            <ButtonNavigator labelArray={['Buy', 'Sell']} index={0}>
              <TabNavigator key="buy-tab-nav" labelArray={['Limit', 'Market', 'custom-tab']}>
                <BuyLimitForm />
                <BuyMarketForm />
                <BuyStopLimitForm />
                <BuyStopMarketForm />
              </TabNavigator>
              <TabNavigator key="sell-tab-nav" labelArray={['Limit', 'Market', 'custom-tab-sell']}>
                <SellLimitForm />
                <SellMarketForm />
                <SellStopLimitForm />
                <SellStopMarketForm />
                <TakeProfitLimitForm />
                <TakeProfitMarketForm />
              </TabNavigator>
            </ButtonNavigator>
          </div>
          <div style={{ marginTop: '2.4rem' }}>
            {!hasEntry && (
              <div style={{ marginTop: '2rem' }}>
                <Typography as="h3">1. Entry Order</Typography>
              </div>
            )}

            {!hasEntry && (
              <TabNavigator labelArray={['Limit', 'Market', 'custom-tab']}>
                <LimitForm />
                <MarketForm />
                <EntryStopLimitForm />
                <EntryStopMarketForm />
              </TabNavigator>
            )}

            {hasEntry && (
              <Fragment>
                <Typography as="h3">2. Exits</Typography>
                <ButtonNavigator labelArray={['Target', 'Stop-loss']} index={1}>
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
              <button
                type="button"
                className="btn btn-primary btn-sm w-100"
                onClick={() => {
                  setIsModalVisible(true)
                }}
              >
                Place Fulltrade
              </button>
            )}

            <TradeTableContainer />
          </div>
        </TabNavigator>
      </section>

      {isModalVisible && (
        <Modal onClose={() => setIsModalVisible(false)}>
          <TradeModal
            onClose={() => setIsModalVisible(false)}
            btnDisabled={isBtnDisabled}
            placeOrder={doPlaceOrder}
          />
        </Modal>
      )}
    </Fragment>
  )
}

export default TradePanel
