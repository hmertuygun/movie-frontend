import React, { useState, useEffect, useMemo, useCallback } from 'react'
import PropTypes from 'prop-types'
import Table from 'components/Table/Table'
import { tableConstants } from './tableConstants'
import Pagination from 'components/Table/Pagination/Pagination'
import { ITEMS_PER_PAGE } from 'constants/balanceTable'
import 'react-datepicker/dist/react-datepicker.css'
import { HelpCircle } from 'react-feather'
import dayjs from 'dayjs'
import { tableDataSorting } from 'utils/tableSorting'
import { useDispatch, useSelector } from 'react-redux'
import { refreshAnalyticsData } from 'store/actions'
import { AnalyticsPositionTips } from 'constants/Tooltips'

const AnalyticsTable = ({ startDate, endDate, search }) => {
  const [tableData, setTableData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemNumber, setItemNumber] = useState(0)
  const { pairOperations } = useSelector((state) => state.analytics)
  const { activeExchange } = useSelector((state) => state.exchanges)
  const dispatch = useDispatch()
  const paginate = (pageNumber) => setCurrentPage(pageNumber)
  const [sortAscending, setSortAscending] = useState(false)
  const [, updateState] = useState()
  const forceUpdate = useCallback(() => updateState({}), [])
  const [infoShow, setInfoShow] = useState(false)
  const onSort = async (event, sortKey) => {
    let value = sortKey.split(' ')[0].toLowerCase()
    let key =
      value === 'average'
        ? 'avg. price'
        : value === 'current'
        ? 'current_price'
        : value === 'pair'
        ? 'symbol'
        : value === 'roe%'
        ? 'position'
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
    const endString = endDate && dayjs(endDate).format('YYYY-MM-DD')
    const startString = startDate && dayjs(startDate).format('YYYY-MM-DD')
    dispatch(
      refreshAnalyticsData(activeExchange, {
        startDate: startString,
        endDate: endString,
      })
    )
  }, [startDate, endDate])

  useEffect(() => {
    if (pairOperations) {
      setTableData(pairOperations)
    }
  }, [pairOperations, setTableData, getTableData])

  return (
    <>
      <div className="card card-fluid mobile-card">
        <div className="pb-0 card-header">
          <div className="d-flex justify-content-between align-items-end">
            <div
              className={`tab-info-wrapper ${infoShow ? 'show' : ''}`}
              onMouseEnter={() => setInfoShow(true)}
              onMouseLeave={() => setInfoShow(false)}
            >
              <span className="h6">Positions</span> <HelpCircle size={18} />
              {infoShow && AnalyticsPositionTips}
            </div>
          </div>
        </div>
        <div className="card-body" style={{ overflowY: 'auto' }}>
          {pairOperations && (
            <div style={{ marginBottom: '0.5rem' }}>
              {itemNumber} items found.
            </div>
          )}
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

AnalyticsTable.propTypes = {
  startDate: PropTypes.instanceOf(Date),
  endDate: PropTypes.instanceOf(Date),
  search: PropTypes.string,
}

export default AnalyticsTable
