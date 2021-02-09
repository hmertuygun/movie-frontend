import React, { useContext } from 'react'
import { Button } from '../../../components'
import roundNumber from '../../../helpers/roundNumbers'
import { TradeContext } from '../../context/SimpleTradeContext'
import styles from './Table.module.css'

const Table = ({ labels = [], entry = {}, targets = [], stoploss = [] }) => {
  const { removeEntry, removeStoploss, removeTarget } = useContext(TradeContext)

  const onClick = ({ type, index }) => {
    if (type === 'entry') {
      removeEntry(index)
    }

    if (type === 'target') {
      removeTarget(index)
    }

    if (type === 'stoploss') {
      removeStoploss(index)
    }

    return false
  }

  return (
    <table className={styles['Table']}>
      <thead>
        <tr className={styles['Table-headings']}>
          {labels.map((label, index) => (
            <th
              key={index}
              className={styles['Table-headings-container']}
              onClick={() => label.onClick}
            >
              <span className={styles['Table-headings-text']}>
                {label.text}
              </span>
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {entry && (
          <TableTradeRow>
            <td>
              <div className={styles['Table-type-container']}>
                <div className={styles['Table-dot-buy']}></div>
                Buy
              </div>
            </td>

            <td>{entry.type === 'market' ? 'Market' : entry.price}</td>

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

            <td>{target.price}</td>

            <td className={styles['Table-Row-target-profit']}>
              {target.profit}%
            </td>

            <td>
              {Number((target.quantity / entry.quantity) * 100).toFixed(2)}%
            </td>

            <td>
              <Button onClick={() => onClick({ type: 'target', index })} remove>
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

              <td className={styles['Table-Row-stoploss-profit']}>{profit}%</td>

              <td>{roundNumber((quantity / entry.quantity) * 100)}%</td>

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
  )
}

const TableTradeRow = ({ children }) => (
  <tr className={styles['Table-row']}>{children}</tr>
)

export default Table
