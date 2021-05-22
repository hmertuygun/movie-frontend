import React, { useState, useContext, useEffect, useMemo } from 'react'
import Search from '../../components/Table/Search/Search'
import Table from '../../components/Table/Table'
import { tableConstants } from './Table/tableConstant'

import { PortfolioContext } from '../context/PortfolioContext'
import Pagination from '../../components/Table/Pagination/Pagination'
import { useSymbolContext } from '../../Trade/context/SymbolContext'

const BalanceTable = () => {
  const { balance } = useContext(PortfolioContext)
  const { lastMessage } = useSymbolContext()
  const [tableData, setTableData] = useState([])
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  const ITEMS_PER_PAGE = 8

  const getTableData = useMemo(() => {
    if (tableData) {
      let data = tableData

      if (search) {
        data = data.filter(
          (items) => items.SYMBOL.toLowerCase().includes(search.toLowerCase())
          /*           ||
                items.SYMBOL.toLowerCase().includes(search.toLowerCase()) */
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

  const fetchLatestPrice = async () => {
    if (!activeExchange?.exchange) return
    try {
      const { exchange } = activeExchange
      const tempBalance = balance
      // const lastMessage = await getSymbolPriceTicker()
      const proxy = window.location.hostname === "localhost" ? 'http://localhost:8080/' : 'https://nodejs-cors.herokuapp.com/'
      const exchangeInit = exchange === "binance" ? new ccxt.binance() : new ccxt.ftx({ proxy: proxy })
      const lastMessage = await exchangeInit.fetchTickers()
      console.log(lastMessage)
      const arrayData = Object.values(lastMessage)
      tempBalance.forEach((item, index, arr) => {
        const fData = arrayData.find((item1) => item1.symbol === `${item.SYMBOL}/BTC`)
        const fData1 = arrayData.find((item1) => item1.symbol === `${item.SYMBOL}/USDT`)
        // console.log(`${item.SYMBOL}/BTC`, fData)
        // console.log(`${item.SYMBOL}/USDT`, fData1)
        if (fData) arr[index].BTC = (fData.price * item.TOTAL).toFixed(8)
        if (fData1) arr[index].USD = (fData1.price * item.TOTAL).toFixed(8)
      })
      setTableData(tempBalance)
    }
    catch (e) {
      console.log(e)
    }
  }

  // useEffect(() => {
  //   if (!balance?.length || !lastMessage?.length) return
  //   fetchLatestPrice()
  // }, [lastMessage])

  const latestPricePolling = () => {
    clearInterval(pricePolling)
    pricePolling = null
    pricePolling = setInterval(fetchLatestPrice, 3000)
  }

  useEffect(() => {
    if (!balance?.length || !lastMessage?.length) return
    fetchLatestPrice()
  }, [lastMessage])

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
