import React, { useState, useEffect, useCallback } from 'react'
// eslint-disable-next-line css-modules/no-unused-class
import styles from './Table.module.css'

const Table = ({ cols, data, onSort, setSortAscending, sortAscending }) => {
  const [dataTable, setTableData] = useState()

  useEffect(() => {
    setTableData(data)
  }, [data])

  const handleSorting = (e, value) => {
    onSort(e, value)
    setSortAscending(!sortAscending)
  }
  return (
    <table className={styles['table']}>
      <thead>
        <tr>
          {cols.map((item, idx) => {
            return (
              <th
                scope="col"
                key={idx}
                onClick={(e) => handleSorting(e, item.title)}
              >
                {item.title}
              </th>
            )
          })}
        </tr>
      </thead>
      <tbody>
        {dataTable &&
          dataTable.map((item, idx) => (
            <tr key={idx}>
              {cols.map((col, key) => {
                return <td key={key}>{col.render(item)}</td>
              })}
            </tr>
          ))}
      </tbody>
    </table>
  )
}

export default Table
