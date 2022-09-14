import React, { useState, useEffect, useMemo, useCallback } from 'react'
import PropTypes from 'prop-types'
import Table from 'components/Table/Table'
import { assetPerformanceTable } from './tableConstants'
import Pagination from 'components/Table/Pagination/Pagination'
import { ITEMS_PER_PAGE } from 'constants/balanceTable'
import 'react-datepicker/dist/react-datepicker.css'
import { HelpCircle } from 'react-feather'
import './AssetPerformance.css'
import { tableDataSorting } from 'utils/tableSorting'
import { useSelector } from 'react-redux'
import { AnalyticsPerformanceTips } from 'constants/Tooltips'

const AssetPerformance = ({ search }) => {
  const [tableData, setTableData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemNumber, setItemNumber] = useState(0)
  const { assetPerformance } = useSelector((state) => state.analytics)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)
  const [sortAscending, setSortAscending] = useState(false)
  const [infoShow, setInfoShow] = useState(false)
  const [, updateState] = useState()
  const forceUpdate = useCallback(() => updateState({}), [])

  const onSort = async (event, sortKey) => {
    let value = sortKey.split(' ')[0].toLowerCase()
    let key =
      value === 'change'
        ? 'value'
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
          items.asset.toLowerCase().includes(search.toLowerCase())
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
    if (assetPerformance) {
      setTableData(assetPerformance)
    }
  }, [assetPerformance, setTableData, getTableData])

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
              <span className="h6">Asset Performance</span>{' '}
              <HelpCircle size={18} />
              {infoShow && AnalyticsPerformanceTips}
            </div>
          </div>
        </div>
        <div className="card-body" style={{ overflowY: 'auto' }}>
          {assetPerformance && (
            <div style={{ marginBottom: '0.5rem', marginLeft: '1rem' }}>
              {itemNumber} items found.
            </div>
          )}
          <Table
            cols={assetPerformanceTable()}
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

AssetPerformance.propTypes = {
  search: PropTypes.string,
}

export default AssetPerformance
