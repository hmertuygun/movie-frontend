import React, { useState, useMemo, useEffect } from 'react'
import EstimateValue from '../Portfolio/components/EstimateValue'
import PortfolioDistribution from '../Portfolio/components/PortfolioDistribution'
import Table from '../components/Table/Table'
import ChartContext from '../Portfolio/context/ChartContext'
import { EstimatedProvider } from '../Portfolio/context/EstimatedContext'

import { mockBalances } from '../Portfolio/components/Table/table-mock'
import { tableConstants } from '../Portfolio/components/Table/tableConstant'

import Search from '../components/Table/Search/Search'
import Pagination from '../components/Table/Pagination/Pagination'

const PortfolioView = () => {
  const [balances, setBalances] = useState(mockBalances)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const ITEMS_PER_PAGE = 5
  const tableData = useMemo(() => {
    let data = balances

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
  }, [currentPage, search, balances])

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  return (
    <>
      <section className="slice py-5 bg-section-secondary">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="row align-items-center mb-4">
                <div className="col">
                  <h1 className="h4 mb-0">Portfolio</h1>
                </div>
                <div className="col-auto">
                  <button
                    type="button"
                    className="btn btn-sm btn-neutral btn-icon"
                  >
                    <span className="btn-inner--text">Refresh</span>
                    <span className="btn-inner--icon">
                      <i data-feather="refresh-ccw"></i>
                    </span>
                  </button>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-6">
                  <EstimatedProvider>
                    <EstimateValue />
                  </EstimatedProvider>
                </div>
                <div className="col-lg-6">
                  {/*                   <ChartContext>
                    <PortfolioDistribution />
                  </ChartContext> */}
                  <PortfolioDistribution />
                </div>
              </div>
              <div className="row">
                <div className="col-lg-12">
                  <div className="card card-fluid">
                    <div className="card-header pb-0">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <span className="h6">Balances</span>
                        </div>
                        <div className="col-md-6 d-flex flex-row-reverse">
                          <Search
                            onSearch={(value) => {
                              setSearch(value)
                              setCurrentPage(1)
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="card-body">
                      <Table cols={tableConstants()} data={tableData} />

                      <div>
                        <Pagination
                          postsPerPage={ITEMS_PER_PAGE}
                          totalPosts={balances.length}
                          paginate={paginate}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default PortfolioView
