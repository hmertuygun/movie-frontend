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

            <td>{entry.price}</td>

            <td></td>

            <td>100%</td>

            <td>
              <Button
                onClick={() => onClick({ type: 'entry', index: 0 })}
                plain
              >
                X
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
              {roundNumber(target.profit)}%
            </td>

            <td>{roundNumber((target.quantity / entry.quantity) * 100)}%</td>

            <td>
              <Button onClick={() => onClick({ type: 'target', index })} plain>
                X
              </Button>
            </td>
          </TableTradeRow>
        ))}

        {stoploss.map((stoploss, index) => (
          <TableTradeRow key={index}>
            <td>
              <div className={styles['Table-type-container']}>
                <div className={styles['Table-dot-stoploss']}></div>
                Stoploss
              </div>
            </td>

            <td>{stoploss.price}</td>

            <td className={styles['Table-Row-stoploss-profit']}>
              {stoploss.profit}%
            </td>

            <td>{roundNumber((stoploss.quantity / entry.quantity) * 100)}%</td>

            <td>
              <Button
                onClick={() => onClick({ type: 'stoploss', index })}
                plain
              >
                X
              </Button>
            </td>
          </TableTradeRow>
        ))}
      </tbody>
    </table>
  )
}

const TableTradeRow = ({ children }) => (
  <tr className={styles['Table-row']}>{children}</tr>
)

export default Table