import React, { useContext } from 'react'
import { useTable, useExpanded, useSortBy } from 'react-table'
import styles from './Table.module.css'
import { ThemeContext } from 'contexts/ThemeContext'

export default function Table({ columns: userColumns, data }) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state: { expanded },
  } = useTable(
    {
      columns: userColumns,
      data,
    },
    useSortBy,
    useExpanded
  )
  const { theme } = useContext(ThemeContext)

  return (
    <table {...getTableProps()} className={styles['table']}>
      <thead>
        {headerGroups[1] && (
          <tr {...headerGroups[1].getHeaderGroupProps()}>
            {headerGroups[1].headers.map((column) => (
              <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                {column.render('Header')}
                <span>
                  {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
                </span>
              </th>
            ))}
          </tr>
        )}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row)
          return (
            <tr
              {...row.getRowProps()}
              style={{
                background: !row.canExpand
                  ? theme !== 'DARK'
                    ? '#f7f7f7'
                    : '#2c4056'
                  : 'transparent',
              }}
            >
              {row.cells.map((cell) => {
                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
