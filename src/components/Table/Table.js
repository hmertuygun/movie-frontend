import React, { useState } from 'react'
import Button from '../Button/Button'
import roundNumber from '../../helpers/roundNumbers'
import styles from './Table.module.css'

const Table = ({
  labels = [],
  entry = {},
  targets = [],
  stoploss = [],
  ...props
}) => {
  return (
    <table className={styles['Table']}>
      <thead>
        <tr className={styles['Table-headings']}>
          {labels.map((label) => (
            <th
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
        {entry && <TableEntryRow data={entry} />}

        {targets.map((target, index) => (
          <TableTargetRow
            key={index}
            data={{
              ...target,
              amount: roundNumber((target.amount / entry.amount) * 100),
            }}
            index={index + 1}
          />
        ))}

        {stoploss.map((stoploss, index) => {
          return (
            <TableStoplossRow
              data={{
                ...stoploss,
                amount: roundNumber((stoploss.amount / entry.amount) * 100),
              }}
              index={index + 1}
              key={index}
            />
          )
        })}
      </tbody>
    </table>
  )
}

const TableEntryRow = ({ data }) => (
  <TableTradeRow>
    <td>
      <div className={styles['Table-type-container']}>
        <div className={styles['Table-dot-buy']}></div>
        Buy
      </div>
    </td>

    <td>{data.price}</td>

    <td></td>

    <td>100%</td>

    <td>
      <Button plain>X</Button>
    </td>
  </TableTradeRow>
)

const TableTargetRow = ({ data, index }) => {
  return (
    <TableTradeRow>
      <td>
        <div className={styles['Table-type-container']}>
          <div className={styles['Table-dot-target']}></div>
          Target {index}
        </div>
      </td>

      <td>{data.price}</td>

      <td className={styles['Table-Row-target-profit']}>
        {roundNumber(data.profit)}%
      </td>

      <td>{data.amount}%</td>

      <td>
        <Button plain>X</Button>
      </td>
    </TableTradeRow>
  )
}

const TableStoplossRow = ({ data, index }) => {
  return (
    <TableTradeRow>
      <td>
        <div className={styles['Table-type-container']}>
          <div className={styles['Table-dot-stoploss']}></div>
          Stoploss {index}
        </div>
      </td>

      <td>{data.price}</td>

      <td className={styles['Table-Row-stoploss-profit']}>{data.profit}%</td>

      <td>{data.amount}%</td>

      <td>
        <Button plain>X</Button>
      </td>
    </TableTradeRow>
  )
}

const TableTradeRow = ({ children }) => (
  <tr className={styles['Table-row']}>{children}</tr>
)

export default Table
