import React from 'react'
import styles from './Table.module.css'

const Table = ({ cols, data }) => {
  return (
    <table className={styles['table']}>
      <thead>
        <tr>
          {cols.map((item, idx) => (
            <th scope="col" key={idx}>
              {item.title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item, idx) => (
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
