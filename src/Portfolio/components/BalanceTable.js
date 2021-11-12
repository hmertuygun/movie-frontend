import React, { useState, useContext, useEffect, useMemo } from 'react'
import Search from '../../components/Table/Search/Search'
import Table from '../../components/Table/Table'
import { tableConstants } from './Table/tableConstant'
import { PortfolioContext } from '../context/PortfolioContext'
import Pagination from '../../components/Table/Pagination/Pagination'
import { useCallback } from 'react'
import { ITEMS_PER_PAGE } from '../../constants/balanceTable'

const BalanceTable = () => {
  const { balance, lastMessage } = useContext(PortfolioContext)
  const [tableData, setTableData] = useState([])
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  const getTableData = useMemo(() => {
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
  }, [currentPage, search, tableData])

  useEffect(() => {
    if (balance) {
      setTableData(balance)
    }
  }, [balance, setTableData, getTableData])

  const fetchLatestPrice = useCallback(() => {
    if (!lastMessage) return

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
    if (!balance?.length) return
    fetchLatestPrice()
  }, [balance, fetchLatestPrice])

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
          <Table cols={tableConstants()} data={getTableData} />
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
