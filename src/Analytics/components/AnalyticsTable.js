import React, { useState, useContext, useEffect, useMemo } from 'react'
import Search from '../../components/Table/Search/Search'
import Table from '../../components/Table/Table'
import { tableConstants } from './tableConstants'
import { AnalyticsContext } from '../context/AnalyticsContext'
import Pagination from '../../components/Table/Pagination/Pagination'
import { ITEMS_PER_PAGE } from '../../constants/balanceTable'
import DatePicker from 'react-datepicker'
import dayjs from 'dayjs'
import 'react-datepicker/dist/react-datepicker.css'

const AnalyticsTable = ({ startDate, endDate, setStartDate, setEndDate }) => {
  const { pairOperations, refreshData } = useContext(AnalyticsContext)
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
    const endString = endDate && dayjs(endDate).format('YYYY-MM-DD')
    const startString = startDate && dayjs(startDate).format('YYYY-MM-DD')
    refreshData({
      startDate: startString,
      endDate: endString,
    })
  }, [startDate, endDate, refreshData])

  useEffect(() => {
    if (pairOperations) {
      setTableData(pairOperations)
    }
  }, [pairOperations, setTableData, getTableData])

  return (
    <>
      <div className="card card-fluid">
        <div className="pb-0 card-header">
          <div className="d-flex justify-content-between align-items-end">
            <div className="row">
              <div className="col-5-lg m-1">
                <label className="form-control-label">Symbol</label>
                <Search
                  onSearch={(value) => {
                    setSearch(value)
                    setCurrentPage(1)
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="card-body">
          {pairOperations && (
            <div style={{ marginBottom: '0.5rem' }}>
              {itemNumber} items found.
            </div>
          )}
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

export default AnalyticsTable
