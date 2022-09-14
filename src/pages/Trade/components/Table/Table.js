import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { Button } from 'components'
import { addPrecisionToNumber } from 'utils/tradeForm'
import styles from './Table.module.css'
import { useDispatch, useSelector } from 'react-redux'
import { resetStoploss, resetTarget, resetTradeState } from 'store/actions'

const Table = ({
  labels = [],
  entry = {},
  targets = [],
  stoploss = [],
  sell,
}) => {
  const { selectedSymbolDetail } = useSelector((state) => state.symbols)
  const { activeExchange } = useSelector((state) => state.exchanges)
  const dispatch = useDispatch()
  const totalPrecision = useMemo(() => {
    return selectedSymbolDetail['symbolpair'] === 'ETHUSDT'
      ? 7
      : selectedSymbolDetail['quote_asset_precision']
  }, [selectedSymbolDetail])
  const entryPrice = useMemo(() => entry.price || entry.trigger, [entry])
  const total = useMemo(
    () => addPrecisionToNumber(entryPrice * entry.quantity, totalPrecision),
    [entry, entryPrice, totalPrecision]
  )

  const onClick = ({ type, index }) => {
    if (type === 'entry') {
      dispatch(resetTradeState(index))
    }

    if (type === 'target') {
      dispatch(resetTarget(index))
    }

    if (type === 'stoploss') {
      dispatch(resetStoploss(index))
    }

    return false
  }

  const entryOrderType = (entry) => {
    switch (entry.type) {
      case 'limit':
        return entry.price
      case 'market':
        return 'Market'
      case 'stop-limit':
        return entry.price
      case 'stop-market':
        return entry.trigger
      default:
        break
    }
  }

  return (
    <>
      <div className={styles['trade-overview']}>
        <h1>Trade Overview</h1>
        <div className={styles['overview-wrapper']}>
          <div className={styles['overview-container']}>
            <div className="d-flex align-items-center">
              <span className="mr-1">Market :</span>
              <span>{`${selectedSymbolDetail['base_asset']}-${selectedSymbolDetail['quote_asset']}`}</span>
            </div>
            <div>
              <span>Total :</span>
              <span>
                {total} {selectedSymbolDetail['quote_asset']}
              </span>
            </div>
          </div>
          <div className={styles['top-right']}>{activeExchange.label}</div>
        </div>
      </div>
      <table className={styles['Table']}>
        <thead>
          <tr className={styles['Table-headings']}>
            {labels.map((label, index) => (
              <th key={index} onClick={() => label.onClick}>
                <span>{label.text}</span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {entry && (
            <TableTradeRow>
              <td>
                <div className={styles['Table-type-container']}>
                  <div
                    className={
                      styles[sell ? 'Table-dot-stoploss' : 'Table-dot-buy']
                    }
                  ></div>
                  {sell ? 'Sell' : 'Buy'}
                </div>
              </td>

              <td>{entryOrderType(entry)}</td>

              <td></td>

              <td>{entry.quantity}</td>

              <td>
                <Button
                  onClick={() => onClick({ type: 'entry', index: 0 })}
                  remove
                >
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
              </td>
            </TableTradeRow>
          )}

          {targets.map((target, index) => (
            <TableTradeRow key={index}>
              <td>
                <div className={styles['Table-type-container']}>
                  <div className={styles['Table-dot-target']}></div>
                  Target {index + 1}
                </div>
              </td>

              {target.type === 'stop-market' ? (
                <td>{target.triggerPrice}</td>
              ) : (
                <td>{target.price}</td>
              )}

              <td className={styles['Table-Row-target-profit']}>
                {target.profit}%
              </td>

              <td>
                {parseFloat(
                  addPrecisionToNumber(
                    (target.quantity / entry.quantity) * 100,
                    2
                  )
                )}
                %
              </td>

              <td>
                <Button
                  onClick={() => onClick({ type: 'target', index })}
                  remove
                >
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
              </td>
            </TableTradeRow>
          ))}

          {stoploss.map((stoploss, index) => {
            const { type, price, triggerPrice, profit, quantity } = stoploss
            return (
              <TableTradeRow key={index}>
                <td>
                  <div className={styles['Table-type-container']}>
                    <div className={styles['Table-dot-stoploss']}></div>
                    Stoploss
                  </div>
                </td>
                {type === 'stop-limit' ? (
                  <td>{price}</td>
                ) : (
                  <td>{triggerPrice}</td>
                )}

                <td className={styles['Table-Row-stoploss-profit']}>
                  {profit}%
                </td>

                <td>
                  {parseFloat(
                    addPrecisionToNumber((quantity / entry.quantity) * 100, 2)
                  )}
                  %
                </td>

                <td>
                  <Button
                    onClick={() => onClick({ type: 'stoploss', index })}
                    remove
                  >
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
                </td>
              </TableTradeRow>
            )
          })}
        </tbody>
      </table>
    </>
  )
}

const TableTradeRow = ({ children }) => (
  <tr className={styles['Table-row']}>{children}</tr>
)

Table.propTypes = {
  labels: PropTypes.array,
  entry: PropTypes.object,
  targets: PropTypes.array,
  stoploss: PropTypes.array,
  sell: PropTypes.bool,
}

export default Table
