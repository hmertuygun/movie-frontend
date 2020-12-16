import React, { useState, useEffect } from 'react'
import { balances } from './table-mock'

const Table = (props) => {
  const [tableData, setTableData] = useState([])

  useEffect(() => {
    getData()
  }, [])

  const getData = async () => {
    setTableData(balances)
  }

  const renderHeader = () => {
    let headerElement = props.columns

    return headerElement.map((key, index) => {
      return (
        <th scope="col" key={index}>
          {key.toUpperCase()}
        </th>
      )
    })
  }

  const renderBody = () => {
    return (
      tableData &&
      tableData.map(({ SYMBOL, BALANCE, RESERVED, TOTAL, BTC, USD }, idx) => {
        return (
          <tr key={idx}>
            <th scope="row">{SYMBOL}</th>
            <td>{BALANCE}</td>
            <td>{RESERVED}</td>
            <td>{TOTAL}</td>
            <td>{BTC}</td>
            <td>{USD}</td>
          </tr>
        )
      })
    )
  }

  return (
    <>
      <table className="table">
        <thead>
          <tr>{renderHeader()}</tr>
        </thead>
        <tbody>{renderBody()}</tbody>
      </table>
    </>
  )
}

export default Table
