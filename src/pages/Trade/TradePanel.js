import React, {
  Fragment,
  useState,
  useContext,
  useEffect,
  useMemo,
  useCallback,
} from 'react'
import { X } from 'react-feather'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useNotifications } from 'reapop'

import { placeOrder } from 'services/api'
import SimpleTradeContext, { TradeContext } from 'contexts/SimpleTradeContext'
import { TabContext } from 'contexts/TabContext'
import { SymbolContext } from 'contexts/SymbolContext'
import { UserContext } from 'contexts/UserContext'
import { TabNavigator, ButtonNavigator, Typography, Modal } from 'components'
import SymbolSelect from './components/SymbolSelect/SymbolSelect'

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

import SellFullLimitForm from './forms/SellFullLimitForm/SellFullLimitForm'
import SellFullMarketForm from './forms/SellFullMarketForm/SellFullMarketForm'
import SellFullExitStoplossStopLimit from './forms/SellFullExitStoplossStopLimit/SellFullExitStoplossStopLimit'
import SellFullExitStoplossStopMarket from './forms/SellFullExitStoplossStopMarket/SellFullExitStoplossStopMarket'
import SellFullExitTarget from './forms/SellFullExitTarget/SellFullExitTarget'
import SellFullExitTargetStopMarket from './forms/SellFullExitTargetStopMarket/SellFullExitTargetStopMarket'
import SellFullEntryStopLimitForm from './forms/SellFullEntryStopLimitForm/SellFullEntryStopLimitForm'
import SellFullEntryStopMarketForm from './forms/SellFullEntryStopMarketForm/SellFullEntryStopMarketForm'

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

import { analytics } from 'services/firebase'
import { trackEvent } from 'services/tracking'

const TradePanel = () => (
  <SimpleTradeContext>
    <Trade />
  </SimpleTradeContext>
)

const Trade = () => {
  const { removeEntry } = useContext(TradeContext)
  const { notify } = useNotifications()

  const [isBtnDisabled, setBtnVisibility] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const { state, clear } = useContext(TradeContext)
  const { selectedSymbol, setIsOrderPlaced, refreshBalance } =
    useContext(SymbolContext)
  const { activeExchange } = useContext(UserContext)
  const { setIsTradePanelOpen } = useContext(TabContext)

  const hasEntry = useMemo(
    () => (state.entry?.quantity > 0 ? true : false),
    [state.entry?.quantity]
  )

  const ableToPostFulltrade = useMemo(() => {
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
  }, [state, hasEntry])

  const doPlaceOrder = useCallback(async () => {
    try {
      if (isBtnDisabled) return
      setBtnVisibility(true)
      setIsOrderPlaced(false)
      const { data } = await placeOrder({ ...state, ...activeExchange })
      if (data?.status === 'error') {
        notify({
          status: 'error',
          title: 'Error',
          message:
            data?.error || "Order couldn't be created. Please try again later!",
        })
      } else {
        notify({
          status: 'success',
          title: 'Success',
          message: 'Order Created!',
        })
        const { entry } = state
        analytics.logEvent(`placed_full_trade_${entry.type}_order`)
        trackEvent(
          'user',
          `placed_full_trade_${entry.type}_order`,
          `placed_full_trade_${entry.type}_order`
        )
        if (entry.type !== 'stop-limit' && entry.type !== 'stop-market') {
          refreshBalance()
        }
      }
      setIsModalVisible(false)
      setIsTradePanelOpen(false)
      clear()
    } catch (error) {
      console.error({ error, message: 'Order was not sent' })
      setIsModalVisible(false)
      notify({
        status: 'error',
        title: 'Error',
        message: "Order couldn't be created. Please try again later!",
      })
      clear()
    } finally {
      setIsOrderPlaced(true)
      setBtnVisibility(false)
    }
  }, [
    activeExchange,
    clear,
    isBtnDisabled,
    refreshBalance,
    setIsOrderPlaced,
    setIsTradePanelOpen,
    state,
  ])

  useEffect(() => {
    clear()
  }, [clear, selectedSymbol])

  let isStepTwo = useMemo(() => Object.keys(state).includes('entry'), [state])

  return (
    <Fragment>
      <>
        <SymbolSelect showOnlyMarketSelection={true} />
        <div
          className="TradeView-Panel-Mobile-Close"
          onClick={() => setIsTradePanelOpen(false)}
        >
          <X />
        </div>
        <TabNavigator
          labelArray={['Place Order', 'Full Trade']}
          hadDropDown={false}
          className="mobile-tab-2"
        >
          <div style={{ marginTop: '2rem' }}>
            <ButtonNavigator labelArray={['BUY', 'SELL']}>
              <TabNavigator
                key="buy-tab-nav"
                labelArray={['Limit', 'Market', 'Stop-limit', 'Stop-market']}
              >
                <BuyLimitForm />
                <BuyMarketForm />
                <BuyStopLimitForm />
                <BuyStopMarketForm />
              </TabNavigator>
              <TabNavigator
                key="sell-tab-nav"
                labelArray={[
                  'Limit',
                  'Market',
                  'Stop-limit',
                  'Stop-market',
                  'Take-Profit-Limit',
                  'Take-Profit-Market',
                ]}
              >
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
            <ButtonNavigator
              labelArray={['BUY', 'SELL']}
              style={{ pointerEvents: 'none' }}
              isDisabled={isStepTwo}
            >
              <div>
                {!hasEntry && (
                  <div style={{ marginTop: '2rem' }}>
                    <Typography as="h3">1. Entry Buy Order</Typography>
                  </div>
                )}

                {!hasEntry && (
                  <TabNavigator
                    labelArray={[
                      'Limit',
                      'Market',
                      'Stop-limit',
                      'Stop-market',
                    ]}
                    key="entry-order-buy"
                  >
                    <LimitForm />
                    <MarketForm />
                    <EntryStopLimitForm />
                    <EntryStopMarketForm />
                  </TabNavigator>
                )}

                {hasEntry && (
                  <Fragment>
                    <div className="d-flex justify-content-between align-items-start">
                      <Typography as="h3">2. Exits</Typography>
                      <button
                        type="button"
                        className="px-0 py-0 btn btn-link"
                        onClick={() => removeEntry(0)}
                      >
                        <FontAwesomeIcon icon={faChevronLeft} /> Back
                      </button>
                    </div>
                    <ButtonNavigator
                      labelArray={['Target', 'Stop-loss']}
                      index={0}
                      tabButtonOutline={true}
                    >
                      <TabNavigator
                        labelArray={['Stop-market']}
                        key="exit-target-order"
                        hadDropDown={false}
                      >
                        <ExitTargetStopMarket />
                        <ExitTarget />
                      </TabNavigator>
                      <TabNavigator
                        labelArray={['Stop-market', 'Stop-limit']}
                        key="exit-stop-loss-order"
                        hadDropDown={false}
                      >
                        <ExitStoplossStopMarket />
                        <ExitStoplossStopLimit />
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
                    Place Buy Full Trade
                  </button>
                )}

                <TradeTableContainer />
              </div>
              <div>
                {!hasEntry && (
                  <div style={{ marginTop: '2rem' }}>
                    <Typography as="h3">1. Entry Sell Order</Typography>
                  </div>
                )}

                {!hasEntry && (
                  <TabNavigator
                    labelArray={[
                      'Limit',
                      'Market',
                      'Stop-limit',
                      'Stop-market',
                    ]}
                    key="entry-order-sell"
                  >
                    <SellFullLimitForm />
                    <SellFullMarketForm />
                    <SellFullEntryStopLimitForm />
                    <SellFullEntryStopMarketForm />
                  </TabNavigator>
                )}

                {hasEntry && (
                  <Fragment>
                    <div className="d-flex justify-content-between align-items-start">
                      <Typography as="h3">2. Exits</Typography>
                      <button
                        type="button"
                        className="px-0 py-0 btn btn-link"
                        onClick={() => removeEntry(0)}
                      >
                        <FontAwesomeIcon icon={faChevronLeft} /> Back
                      </button>
                    </div>
                    <ButtonNavigator
                      labelArray={['Target', 'Stop-loss']}
                      index={0}
                      tabButtonOutline={true}
                    >
                      <TabNavigator
                        labelArray={['Stop-market']}
                        key="exit-target-order"
                        hadDropDown={false}
                      >
                        <SellFullExitTargetStopMarket />
                        <SellFullExitTarget />
                      </TabNavigator>
                      <TabNavigator
                        labelArray={['Stop-market', 'Stop-limit']}
                        key="exit-stop-loss-order"
                        hadDropDown={false}
                      >
                        <SellFullExitStoplossStopMarket />
                        <SellFullExitStoplossStopLimit />
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
                    Place Sell Full Trade
                  </button>
                )}

                <TradeTableContainer sell={true} />
              </div>
            </ButtonNavigator>
          </div>
        </TabNavigator>
      </>

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