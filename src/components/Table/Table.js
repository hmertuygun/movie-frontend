import React, { useState } from 'react'
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
          <TableTargetRow key={index} data={target} index={index} />
        ))}

        {stoploss.map((stoploss, index) => (
          <TableStoplossRow data={stoploss} inedx={index} key={index} />
        ))}
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

    <td>X</td>
  </TableTradeRow>
)

const TableTargetRow = ({ data, index }) => (
  <TableTradeRow>
    <td>
      <div>Green</div>
      Target {index}
    </td>

    <td>{data.price}</td>

    <td>{data.profit}</td>

    <td>{data.amount}</td>

    <td>X</td>
  </TableTradeRow>
)

const TableStoplossRow = ({ data, index }) => (
  <TableTradeRow>
    <td>
      <div>Red</div>
      Stoploss {index}
    </td>

    <td>{data.price}</td>

    <td>{data.profit}</td>

    <td>{data.amount}</td>

    <td>X</td>
  </TableTradeRow>
)

const TableTradeRow = ({ children }) => (
  <tr className={styles['Table-row']}>{children}</tr>
)

export default Table
