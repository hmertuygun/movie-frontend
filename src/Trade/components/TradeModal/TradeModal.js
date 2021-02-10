import React, { Fragment, useContext } from 'react'
import { Typography, Button } from '../../../components'
import { TradeContext } from '../../context/SimpleTradeContext'
import { useSymbolContext } from '../../context/SymbolContext'
import roundNumbers from '../../../helpers/roundNumbers'
import styles from './TradeModal.module.css'

const TradeModal = ({ onClose, placeOrder }) => {
  const { state } = useContext(TradeContext)
  const orderType = {
    limit: 'Limit',
    'stop-limit': 'Stop-Limit',
    'stop-market': 'Stop-Market',
  }

  const { selectedSymbolDetail } = useSymbolContext()

  return (
    <article className={styles['TradeModal-Container']}>
      <div className={styles['TradeModal-close']}>
        <Button onClick={onClose} remove>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="feather feather-x"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </Button>
      </div>
      <header className={styles['TradeModal-header']}>
        <Typography as="h4">{state.entry.symbol} Full Trade</Typography>
        <Typography className={styles['TradeModal-header__description']}>
          {state.entry.type} Buy
        </Typography>
      </header>

      <main className={styles['TradeModal-Main']}>
        <div className={styles['TradeModal-Main__entry']}>
          <Typography>Price</Typography>
          {state.entry.type === 'market' ? (
            <Typography>Market Price</Typography>
          ) : (
            <Typography>
              {state.entry.price} {selectedSymbolDetail['quote_asset']}
            </Typography>
          )}
        </div>
        <div className={styles['TradeModal-Main__entry']}>
          <Typography>Order Qty</Typography>
          {state.entry.quantity && (
            <Typography>
              {state.entry.quantity} {selectedSymbolDetail['base_asset']}
            </Typography>
          )}
        </div>
        <div className={styles['TradeModal-Main-Table']}>
          <table>
            <tbody>
              {state.targets.map((target, index) => (
                <tr key={index}>
                  <td>
                    Target {index + 1} ({orderType[target.type]})
                  </td>
                  <td>
                    (
                    {roundNumbers(target.quantity / state.entry.quantity) * 100}
                    %) {target.quantity} {selectedSymbolDetail['base_asset']}
                  </td>
                  <td>
                    {target.price} {selectedSymbolDetail['quote_asset']}
                  </td>
                </tr>
              ))}
              {state.stoploss.map((stoploss, index) => (
                <tr key={index}>
                  <td>Stop Loss ({orderType[stoploss.type]})</td>
                  <td>
                    (
                    {roundNumbers(stoploss.quantity / state.entry.quantity) *
                      100}
                    %) {stoploss.quantity} {selectedSymbolDetail['base_asset']}
                  </td>
                  <td>
                    {stoploss.type === 'stop-market'
                      ? stoploss.triggerPrice
                      : stoploss.price}{' '}
                    {selectedSymbolDetail['quote_asset']}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <footer className={styles['TradeModal-Footer']}>
        <button onClick={onClose} className="btn btn-danger">
          Cancel
        </button>
        <button onClick={placeOrder} className="btn btn-success">
          Confirm Order
        </button>
      </footer>
    </article>
  )
}

export default TradeModal
