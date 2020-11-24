import React, { useState } from 'react'
import styles from './Table.module.css'

const labels = [
  { text: 'Type' },
  { text: 'Price' },
  { text: 'Profit' },
  { text: 'Amount' },
  { text: '' },
]

const data = [
  {
    type: 'entry',
    price: '9999,111',
    profit: '',
    amount: '0.004',
  },
  {
    type: 'target',
    price: '10345,2323',
    profit: '10%',
    amount: '0.004',
  },
  {
    type: 'target',
    price: '11445,1212',
    profit: '20%',
    amount: '0.002',
  },
  {
    type: 'target',
    price: '15345,2323',
    profit: '30%',
    amount: '0.003',
  },
  {
    type: 'stoploss',
    price: '9000.22',
    profit: '-10%',
    amount: '0.0440',
  },
]

const Table = ({ labels = [], data = [], ...props }) => {
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
        {data
          .filter((entry) => entry.type === 'entry')
          .map((entry) => (
            <TableEntryRow data={entry} />
          ))}

        {data
          .filter((entry) => entry.type === 'target')
          .map((target, index) => (
            <TableTargetRow key={index} data={target} index={index} />
          ))}

        {data
          .filter((entry) => entry.type === 'stoploss')
          .map((stoploss, index) => (
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

const TableStoplossRow = ({ data, index }) => {
  ;<TableTradeRow>
    <td>
      <div>Red</div>
      Stoploss {index}
    </td>

    <td>{data.price}</td>

    <td>{data.profit}</td>

    <td>{data.amount}</td>

    <td>X</td>
  </TableTradeRow>
}

const TableTradeRow = ({ children }) => (
  <tr className={styles['Table-row']}>{children}</tr>
)

export default Table
