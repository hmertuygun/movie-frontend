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
import { tableDataSorting } from '../../helpers/tableSorting'

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
                    during the chosen period. Even if it has been traded on
                    multiple different pairs.
                  </p>
                  At the present moment it has four columns: <br />
                  <a href="#" rel="noopener noreferrer">
                    ASSET{' '}
                  </a>
                  names the symbol, that has been traded <br />
                  <a href="#" rel="noopener noreferrer">
                    CHANGE{' '}
                  </a>
                  shows the deposit change as a final result of all trades where
                  this asset has been involved.
                  <br />
                  <a href="#" rel="noopener noreferrer">
                    BTC VALUE{' '}
                  </a>
                  shows the deposit change in terms of BTC <br />
                  <a href="#" rel="noopener noreferrer">
                    USD VALUE{' '}
                  </a>
                  shows the deposit change in terms of USD <br />
                  <p className="my-2">
                    A positive change (in green color) means the trader has
                    increased the deposit by this value.
                  </p>
                  <p className="my-2">
                    A negative change (in red color) means the deposit has
                    decreased by the amount shown.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div
          className="card-body"
          style={{ overflowY: 'auto', padding: '0.75rem' }}
        >
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

export default AssetPerformance
