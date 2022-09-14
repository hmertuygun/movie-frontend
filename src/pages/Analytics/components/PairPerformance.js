import React, { useState, useEffect, useMemo, useCallback } from 'react'
import PropTypes from 'prop-types'
import Table from 'components/Table/Table'
import { pairPerformanceTable } from './tableConstants'
import Pagination from 'components/Table/Pagination/Pagination'
import { ITEMS_PER_PAGE } from 'constants/balanceTable'
import 'react-datepicker/dist/react-datepicker.css'
import { HelpCircle } from 'react-feather'
import { tableDataSorting } from 'utils/tableSorting'
import { useSelector } from 'react-redux'
import { AnalyticsPairPerformanceTips } from 'constants/Tooltips'

const PairPerformance = ({ search }) => {
  const [tableData, setTableData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemNumber, setItemNumber] = useState(0)
  const { pairPerformance } = useSelector((state) => state.analytics)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  const [sortAscending, setSortAscending] = useState(false)
  const [, updateState] = useState()
  const forceUpdate = useCallback(() => updateState({}), [])
  const [infoShow, setInfoShow] = useState(false)

  const onSort = async (event, sortKey) => {
    let value = sortKey.split(' ')[0].toLowerCase()
    let key =
      value === 'pair'
        ? 'symbol'
        : value === 'btc'
        ? value.toUpperCase()
        : value === 'usd'
        ? 'USDT'
        : value
    let data = await tableDataSorting(tableData, key, sortAscending)
    setTableData(data)
    forceUpdate()
  }

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
  }, [currentPage, search, tableData, sortAscending])

  useEffect(() => {
    if (pairPerformance) {
      setTableData(pairPerformance)
    }
  }, [pairPerformance, setTableData, getTableData])

  return (
    <>
      <div className="card card-fluid mobile-card">
        <div className="pb-0 card-header">
          <div className="d-flex justify-content-between align-items-start">
            <div
              className={`tab-info-wrapper ${infoShow ? 'show' : ''}`}
              onMouseEnter={() => setInfoShow(true)}
              onMouseLeave={() => setInfoShow(false)}
            >
              <span className="h6">Pair Performance</span>{' '}
              <HelpCircle size={18} />
              {infoShow && AnalyticsPairPerformanceTips}
            </div>
          </div>
        </div>
        <div className="card-body" style={{ overflowY: 'auto' }}>
          {pairPerformance && (
            <div style={{ marginBottom: '0.5rem', marginLeft: 15 }}>
              {itemNumber} items found.
            </div>
          )}
          <Table
            cols={pairPerformanceTable()}
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

PairPerformance.propTypes = {
  search: PropTypes.string,
}

export default PairPerformance
