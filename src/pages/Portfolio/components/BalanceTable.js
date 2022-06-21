import React, { useContext, useMemo, useState } from 'react'
import Table from 'components/TableNew/TableNew'
import { PortfolioContext } from 'contexts/PortfolioContext'
import { Icon } from 'components'
import getLogo from 'utils/getExchangeLogo'
import { tableConstants } from './tableConstant'
import Search from 'components/Table/Search/Search'

const BalanceTable = () => {
  const { balance } = useContext(PortfolioContext)
  const [search, setSearch] = useState('')

  const data = useMemo(() => {
    return balance
      .map((element) => {
        return {
          ...element,
          subRows: element.exchanges,
        }
      })
      .filter(function (element) {
        return search.length
          ? element.SYMBOL.toLowerCase().includes(search.toLowerCase())
          : true
      })
  }, [balance, search])

  const columns = useMemo(
    () => [
      {
        id: 'expander',
        Header: ({ getToggleAllRowsExpandedProps, isAllRowsExpanded }) => (
          <span {...getToggleAllRowsExpandedProps()}></span>
        ),
        Cell: ({ row }) => {
          if (row.canExpand) {
            return (
              <span
                {...row.getToggleRowExpandedProps({
                  style: {
                    paddingLeft: `${row.depth}rem`,
                  },
                })}
              >
                <Icon icon={`chevron-${row.isExpanded ? 'down' : 'right'}`} />
              </span>
            )
          } else {
            if (row.original?.exchange)
              return (
                <span>
                  <img
                    src={getLogo(row.original?.exchange)}
                    alt=""
                    width={22}
                  />
                </span>
              )
          }
        },
      },
      tableConstants(),
    ],
    []
  )

  return (
    <>
      <div className="card card-fluid">
        <div className="card-header">
          <div className="justify-content-between align-items-center">
            <div className="row align-items-center my-2 justify-content-between">
              <div className={`col-lg-5 `}>
                <span className="h6">Balances</span>
              </div>
              <div className="col-auto">
                <Search
                  onSearch={(value) => {
                    setSearch(value)
                  }}
                />
              </div>
            </div>
          </div>
          <div className="card-body p-0 mt-4" style={{ overflowY: 'auto' }}>
            <Table columns={columns} data={data} />
          </div>
        </div>
      </div>
    </>
  )
}

export default BalanceTable
