import React, {
  useState,
  useContext,
  useEffect,
  useMemo,
  useCallback,
} from 'react'
import Table from '../../components/Table/Table'
import { tableConstants } from './tableConstants'
import { AnalyticsContext } from '../context/AnalyticsContext'
import Pagination from '../../components/Table/Pagination/Pagination'
import { ITEMS_PER_PAGE } from '../../constants/balanceTable'
import 'react-datepicker/dist/react-datepicker.css'
import { HelpCircle } from 'react-feather'
import dayjs from 'dayjs'

const AnalyticsTable = ({ startDate, endDate, search }) => {
  const { pairOperations, refreshData } = useContext(AnalyticsContext)
  const [tableData, setTableData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemNumber, setItemNumber] = useState(0)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)
  const [sortAscending, setSortAscending] = useState(false)
  const [, updateState] = useState()
  const forceUpdate = useCallback(() => updateState({}), [])
  const [infoShow, setInfoShow] = useState(false)
  const onSort = (event, sortKey) => {
    let value = sortKey.split(' ')[0].toLowerCase()
    let key =
      value === 'average'
        ? 'avg. price'
        : value === 'current'
        ? 'current_price'
        : value
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
    refreshData({
      startDate: startString,
      endDate: endString,
    })
  }, [startDate, endDate])

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
            <div
              className={`tab-info-wrapper ${infoShow ? 'show' : ''}`}
              onMouseEnter={() => setInfoShow(true)}
              onMouseLeave={() => setInfoShow(false)}
            >
              <span className="h6">Positions</span> <HelpCircle size={18} />
              {infoShow && (
                <div className="tab-info">
                  <p className="mb-2">
                    This table shows all positions for each trading pair for the
                    chosen period of time. It fully replaces the previous
                    positions section in a more flexible and robust way.
                  </p>
                  At the present moment it has eight columns: <br />
                  <a href="#" rel="noopener noreferrer">
                    SYMBOL{' '}
                  </a>
                  trading pair that the user has traded <br />
                  <a href="#" rel="noopener noreferrer">
                    SIDE{' '}
                  </a>
                  direction of the trade (buy or sell) <br />
                  <a href="#" rel="noopener noreferrer">
                    AVERAGE PRICE{' '}
                  </a>
                  SUM (total amount of quote asset) divided by QUANTITY (total
                  amount of base asset). If the average buying price (Side =
                  Buy) is below the current market price, selling those assets
                  will result in profit. Meaning that the user bought the asset
                  cheaper than it cost now. And if the average selling price
                  (Side = Sell) is above the current market price, it means the
                  user has sold an asset at a higher price than it cost now.{' '}
                  <br />
                  <a href="#" rel="noopener noreferrer">
                    QUANTITY{' '}
                  </a>
                  the total amount of the Base asset (1st in the pair) that has
                  been bought/sold <br />
                  <a href="#" rel="noopener noreferrer">
                    SUM{' '}
                  </a>
                  the total amount of Quote asset (2nd in the pair) that has
                  been bought/sold (in return for the Base asset)
                  <br />
                  <a href="#" rel="noopener noreferrer">
                    OPERATIONS{' '}
                  </a>
                  total count of trading operations executed in that direction
                  during the chosen time period. <br />
                  <a href="#" rel="noopener noreferrer">
                    CURRENT PRICE{' '}
                  </a>
                  current market price for one unit of the Base asset in units
                  of Quote asset. <br />
                  <a href="#" rel="noopener noreferrer">
                    POSITION{' '}
                  </a>
                  compares the average price against the current market price
                  and shows the percent difference between the two. If the
                  position is green (positive) it means that the user will make
                  a profit by closing it now. Note that the position is green
                  for the Buy direction if the current price is higher than the
                  average buying price. But the position is green for the Sell
                  direction if the current price is lower than the average
                  selling price. <br />
                </div>
              )}
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

export default AnalyticsTable
