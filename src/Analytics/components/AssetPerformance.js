import React, {
  useState,
  useContext,
  useEffect,
  useMemo,
  useCallback,
} from 'react'
import Table from '../../components/Table/Table'
import { assetPerformanceTable } from './tableConstants'
import { AnalyticsContext } from '../context/AnalyticsContext'
import Pagination from '../../components/Table/Pagination/Pagination'
import { ITEMS_PER_PAGE } from '../../constants/balanceTable'
import 'react-datepicker/dist/react-datepicker.css'
import { HelpCircle } from 'react-feather'
import './AssetPerformance.css'

const AssetPerformance = ({ search }) => {
  const { assetPerformance } = useContext(AnalyticsContext)
  const [tableData, setTableData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemNumber, setItemNumber] = useState(0)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)
  const [sortAscending, setSortAscending] = useState(false)
  const [infoShow, setInfoShow] = useState(false)
  const [, updateState] = useState()
  const forceUpdate = useCallback(() => updateState({}), [])

  const onSort = (event, sortKey) => {
    let value = sortKey.split(' ')[0].toLowerCase()
    let key = value === 'delta' ? 'value' : value
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
        if (parseFloat(a[key]) - parseFloat(b[key])) {
          return -1
        }
        return 1
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
      <div className="card card-fluid">
        <div className="pb-0 card-header">
          <div className="d-flex justify-content-between align-items-start">
            <div
              className={`tab-info-wrapper ${infoShow ? 'show' : ''}`}
              onMouseEnter={() => setInfoShow(true)}
              onMouseLeave={() => setInfoShow(false)}
            >
              <span className="h6">Asset Performance</span>{' '}
              <HelpCircle size={18} />
              {infoShow && (
                <div className="tab-info">
                  <p className="mb-2">
                    Shows the performance per each asset that has been traded
                    during the chosen time period. Even if it has been traded on
                    multiple different pairs.
                  </p>
                  At the present moment it has two columns: <br />
                  <a href="#" rel="noopener noreferrer">
                    ASSET{' '}
                  </a>
                  names the symbol, that has been traded <br />
                  <a href="#" rel="noopener noreferrer">
                    DELTA{' '}
                  </a>
                  shows the deposit change as a final result of all trades where
                  this asset has been involved.
                  <p className="my-2">
                    Positive green green color) means the user has increased the
                    deposit by this value. A negative delta (in red color) means
                    the deposit has decreased by the amount shown.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="card-body">
          {assetPerformance && (
            <div style={{ marginBottom: '0.5rem' }}>
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

export default AssetPerformance
