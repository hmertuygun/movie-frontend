import React, { useState, useContext, useEffect, useMemo } from 'react'
import Search from '../../components/Table/Search/Search'
import Table from '../../components/Table/Table'
import { tableConstants } from './Table/tableConstant'
import { PortfolioContext } from '../context/PortfolioContext'
import Pagination from '../../components/Table/Pagination/Pagination'
import { useSymbolContext } from '../../Trade/context/SymbolContext'
import { useCallback } from 'react'
import { ITEMS_PER_PAGE } from '../../constants/balanceTable'

const BalanceTable = () => {
  const { balance, lastMessage } = useContext(PortfolioContext)
  const [tableData, setTableData] = useState([])
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const paginate = (pageNumber) => setCurrentPage(pageNumber)
  const [sortAscending, setSortAscending] = useState(false)
  const [, updateState] = useState()
  const forceUpdate = useCallback(() => updateState({}), [])

  const onSort = (event, sortKey) => {
    let value = sortKey.split(' ')[0]
    let key = value === 'AVAILABLE' ? 'BALANCE' : value
    let data = tableData.sort(function (a, b) {
      if (typeof a[key] === 'string') {
        if (sortAscending) {
          if (a[key] > b[key]) {
            return 1
          }
          if (a[key] < b[key]) {
            return -1
          }
        } else {
          if (a[key] > b[key]) {
            return -1
          }
          if (a[key] < b[key]) {
            return 1
          }
        }
        return 0
      } else {
        if (sortAscending) {
          return a[key] - b[key]
        } else {
          return b[key] - a[key]
        }
      }
    })
    setTableData(data)
    forceUpdate()
  }

  const getTableData = () => {
    if (tableData) {
      let data = tableData

      if (search) {
        data = data.filter((items) =>
          items.SYMBOL.toLowerCase().includes(search.toLowerCase())
        )
      }

      return data.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        (currentPage - 1) * ITEMS_PER_PAGE + ITEMS_PER_PAGE
      )
    } else {
      return []
    }
  }

  useEffect(() => {
    if (balance) {
      setTableData(balance)
    }
  }, [balance, setTableData])

  const fetchLatestPrice = useCallback(() => {
    const tempBalance = balance
    tempBalance.forEach((item, index, arr) => {
      const fData = lastMessage[`${item.SYMBOL}/BTC`]
      const fData1 = lastMessage[`${item.SYMBOL}/USDT`]
      if (fData) arr[index].BTC = (fData.last * item.TOTAL).toFixed(8)
      if (fData1) arr[index].USD = (fData1.last * item.TOTAL).toFixed(2)
    })
    setTableData(tempBalance)
  }, [balance, lastMessage])

  useEffect(() => {
    if (!balance?.length || !lastMessage?.length) return
    fetchLatestPrice()
  }, [balance, lastMessage, fetchLatestPrice])

  return (
    <>
      <div className="card card-fluid">
        <div className="pb-0 card-header">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <span className="h6">Balances</span>
            </div>
            <Search
              onSearch={(value) => {
                setSearch(value)
                setCurrentPage(1)
              }}
            />
          </div>
        </div>
        <div className="card-body">
          <Table
            cols={tableConstants()}
            data={getTableData}
            onSort={onSort}
            setSortAscending={setSortAscending}
            sortAscending={sortAscending}
          />
          {
            <Pagination
              postsPerPage={ITEMS_PER_PAGE}
              totalPosts={tableData.length}
              paginate={paginate}
            />
          }
        </div>
      </div>
    </>
  )
}

export default BalanceTable
