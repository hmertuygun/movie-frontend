import React, {
  Fragment,
  useState,
  useContext,
  useEffect,
  useMemo,
  useCallback,
} from 'react'
import dayjs from 'dayjs'
import { X } from 'react-feather'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { notify } from 'reapop'

import { placeOrder, sendOrderInfo } from 'services/api'
import { generateFullTradePayloadStructure } from 'utils/generateFullTradePayloadStructure'
import { TabContext } from 'contexts/TabContext'
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
import { useDispatch, useSelector } from 'react-redux'
import { resetTradeState, updateIsOrderPlaced } from 'store/actions'
import { useSymbolContext } from 'contexts/SymbolContext'
import { consoleLogger } from 'utils/logger'
import MESSAGES from 'constants/Messages'
import Auth2FAModal from 'pages/Auth/Auth2FAModal'
import { useInterval } from 'hooks'

const TradePanel = () => <Trade />

const Trade = () => {
  const { refreshBalance } = useSymbolContext()
  const [isBtnDisabled, setBtnVisibility] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [show2FAModal, setShow2FAModal] = useState(false)
  const { activeExchange } = useSelector((state) => state.exchanges)
  const { tradeState } = useSelector((state) => state.simpleTrade)
  const { tokenExpiry } = useSelector((state) => state.apiKeys)
  const { setIsTradePanelOpen } = useContext(TabContext)
  const [remainingMinutes, setRemainingMinutes] = useState()

  const { selectedSymbol } = useSelector((state) => state.symbols)

  const dispatch = useDispatch()

  const hasEntry = useMemo(
    () => (tradeState.entry?.quantity > 0 ? true : false),
    [tradeState.entry?.quantity]
  )

  const ableToPostFulltrade = useMemo(() => {
    const targets =
      tradeState &&
      tradeState.targets &&
      tradeState.targets.length > 0 &&
      tradeState.targets[0].quantity > 0
    const stoploss =
      tradeState &&
      tradeState.stoploss &&
      tradeState.stoploss.length > 0 &&
      tradeState.stoploss[0].quantity > 0

    return targets && stoploss && hasEntry
  }, [tradeState, hasEntry])

  const doPlaceOrder = useCallback(async () => {
    try {
      if (isBtnDisabled) return
      setBtnVisibility(true)
      dispatch(updateIsOrderPlaced(false))
      const res = await placeOrder({ ...tradeState, ...activeExchange })
      if (res?.status === 'error' || res.status !== 200) {
        dispatch(
          notify(res.data?.detail || MESSAGES['order-create-failed'], 'error')
        )
      } else {
        let orderData = generateFullTradePayloadStructure({
          ...tradeState,
          ...activeExchange,
        })
        let data = {
          orders: orderData,
          status_code: res.status,
        }
        sendOrderInfo(data)
        dispatch(notify(MESSAGES['order-created'], 'success'))
        const { entry } = tradeState
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
      dispatch(resetTradeState())
    } catch (error) {
      consoleLogger({ error, message: 'Order was not sent' })
      setIsModalVisible(false)
      dispatch(notify(MESSAGES['order-create-failed'], 'error'))
      dispatch(resetTradeState())
    } finally {
      dispatch(updateIsOrderPlaced(true))
      setBtnVisibility(false)
    }
  }, [
    activeExchange,
    isBtnDisabled,
    refreshBalance,
    setIsTradePanelOpen,
    tradeState,
  ])

  useEffect(() => {
    updateRemainingMinutes()
  }, [show2FAModal])

  useEffect(() => {
    dispatch(resetTradeState())
  }, [resetTradeState, selectedSymbol])

  useInterval(() => {
    updateRemainingMinutes()
  }, 20000)

  const updateRemainingMinutes = () => {
    let minutes = Math.ceil(
      dayjs(new Date(tokenExpiry)).diff(dayjs(), 'minute')
    )
    if (minutes >= 0) {
      setShow2FAModal(false)
    }
    setRemainingMinutes(minutes)
  }

  let isStepTwo = useMemo(
    () => Object.keys(tradeState).includes('entry'),
    [tradeState]
  )

  let isValid = useMemo(() => remainingMinutes >= 0, [remainingMinutes])
  return (
    <Fragment>
      {show2FAModal && <Auth2FAModal />}
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
          <div style={{ marginTop: '1rem' }}>
            {isValid ? (
              <p className="mb-1 text-sm text-success">You have a valid 2FA</p>
            ) : (
              <div className="d-flex align-items-center justify-content-between mb-1">
                <p className="mb-1 text-sm text-danger">Your 2FA got expired</p>
                <button
                  className="btn btn-primary btn-xs"
                  onClick={() => setShow2FAModal(true)}
                >
                  Add 2FA
                </button>
              </div>
            )}
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
          <div style={{ marginTop: '1rem' }}>
            {isValid ? (
              <p className="mb-1 text-sm text-success">You have a valid 2FA</p>
            ) : (
              <div className="d-flex align-items-center justify-content-between mb-1">
                <p className="mb-1 text-sm text-danger">Your 2FA got expired</p>
                <button
                  className="btn btn-primary btn-xs"
                  onClick={() => setShow2FAModal(true)}
                >
                  Add 2FA
                </button>
              </div>
            )}
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
                        onClick={() => dispatch(resetTradeState(0))}
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
                        onClick={() => dispatch(resetTradeState(0))}
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
