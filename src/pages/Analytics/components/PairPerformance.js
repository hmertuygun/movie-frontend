import React, { useState, useEffect, useMemo, useCallback } from 'react'
import Table from 'components/Table/Table'
import { pairPerformanceTable } from './tableConstants'
import Pagination from 'components/Table/Pagination/Pagination'
import { ITEMS_PER_PAGE } from 'constants/balanceTable'
import 'react-datepicker/dist/react-datepicker.css'
import { HelpCircle } from 'react-feather'
import { tableDataSorting } from 'utils/tableSorting'
import { useSelector } from 'react-redux'

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
              {infoShow && (
                <div className="tab-info">
                  <p className="mb-2">
                    Shows the final gain or loss for base and quote assets as a
                    result of all trades performed during the chosen period.
                  </p>
                  At the present moment it has five columns: <br />
                  <a href="#" rel="noopener noreferrer">
                    PAIR{' '}
                  </a>
                  names the symbol, that has been traded <br />
                  <a href="#" rel="noopener noreferrer">
                    BASE{' '}
                  </a>
                  shows the deposit change as a final result of all trades where
                  this asset has been involved. <br />
                  <a href="#" rel="noopener noreferrer">
                    QUOTE{' '}
                  </a>
                  the second symbol of the pair, shows how much of the quote
                  asset has been gained or lost as a result of all trades during
                  the chosen period.
                  <br />
                  <a href="#" rel="noopener noreferrer">
                    BTC VALUE{' '}
                  </a>
                  shows the deposit change in terms of BTC.
                  <br />
                  <a href="#" rel="noopener noreferrer">
                    USD VALUE{' '}
                  </a>
                  shows the deposit change in terms of USD
                  <br />
                  <p className="my-2">
                    A positive number (in green color) means the trader has
                    gained this amount.
                  </p>
                  <p>
                    A negative number (in red color) means the trader has lost
                    this amount.
                  </p>
                </div>
              )}
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

export default PairPerformance
