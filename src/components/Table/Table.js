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
    <table>
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
            index={index}
          />
        ))}

        {stoploss.map((stoploss, index) => {
          console.log(stoploss)

          return (
            <TableStoplossRow
              data={{
                ...stoploss,
                amount: roundNumber((stoploss.amount / entry.amount) * 100),
              }}
              index={index}
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
      <div>blue</div>
      Buy
    </td>

    <td>{data.price}</td>

    <td></td>

    <td>
      <div>B</div>
      100%
    </td>

    <Button plain>X</Button>
  </TableTradeRow>
)

const TableTargetRow = ({ data, index }) => {
  console.log({ target: data })
  return (
    <TableTradeRow>
      <td>
        <div>Green</div>
        Target {index}
      </td>

      <td>{data.price}</td>

      <td>{roundNumber(data.profit)}%</td>

      <td>{data.amount}%</td>

      <Button plain>X</Button>
    </TableTradeRow>
  )
}

const TableStoplossRow = ({ data, index }) => {
  console.log({ los: data })
  return (
    <TableTradeRow>
      <td>
        <div>Red</div>
        Stoploss {index}
      </td>

      <td>{data.price}</td>

      <td>{data.profit}%</td>

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
