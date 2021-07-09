import React, { useState, useEffect, useCallback } from 'react'
// eslint-disable-next-line css-modules/no-unused-class
import styles from './Table.module.css'

const Table = ({ cols, data }) => {
  const [dataTable, setTableData] = useState()

  const [, updateState] = useState()
  const forceUpdate = useCallback(() => updateState({}), [])

  const onSort = (event, sortKey) => {
    data.sort(function (a, b) {
      if (parseFloat(a[sortKey]) - parseFloat(b[sortKey])) {
        return -1
      }
      return 1
    })
    forceUpdate()
  }

  useEffect(() => {
    setTableData(data)
  }, [data])

  return (
    <table className={styles['table']}>
      <thead>
        <tr>
          {cols.map((item, idx) => {
            return (
              <th scope="col" key={idx} onClick={(e) => onSort(e, 'TOTAL')}>
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
