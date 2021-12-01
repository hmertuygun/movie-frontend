import React, { useState, useContext, useEffect, useMemo } from 'react'
import Search from '../../components/Table/Search/Search'
import Table from '../../components/Table/Table'
import { pairPerformanceTable } from './tableConstants'
import { AnalyticsContext } from '../context/AnalyticsContext'
import Pagination from '../../components/Table/Pagination/Pagination'
import { ITEMS_PER_PAGE } from '../../constants/balanceTable'
import 'react-datepicker/dist/react-datepicker.css'

const PairPerformance = () => {
  const { pairPerformance } = useContext(AnalyticsContext)
  const [tableData, setTableData] = useState([])
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemNumber, setItemNumber] = useState(0)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  const getTableData = useMemo(() => {
    if (tableData) {
      let data = tableData

      if (search) {
        data = data.filter((items) =>
          items.symbol.toLowerCase().includes(search.toLowerCase())
        )
      }
      setItemNumber(data.length)

      return data.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        (currentPage - 1) * ITEMS_PER_PAGE + ITEMS_PER_PAGE
      )
    } else {
      return []
    }
  }, [currentPage, search, tableData])

  useEffect(() => {
    if (pairPerformance) {
      console.log(pairPerformance)
      setTableData(pairPerformance)
    }
  }, [pairPerformance, setTableData, getTableData])

  return (
    <>
      <div className="card card-fluid">
        <div className="pb-0 card-header">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <span className="h6">Pair Performance</span>
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
          {pairPerformance && (
            <div style={{ marginBottom: '0.5rem' }}>
              {itemNumber} items found.
            </div>
          )}
          <Table cols={pairPerformanceTable()} data={getTableData} />
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

export default PairPerformance
