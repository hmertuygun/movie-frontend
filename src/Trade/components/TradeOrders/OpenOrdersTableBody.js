import React, { useState } from 'react'

const TableHeaderFields = [
  '',
  'Pair',
  'Type',
  'Side',
  'Price',
  'Amount',
  'Filled',
  'Total',
  'Trigger Condition',
  'Status',
  'Date',
  'Cancel',
]

const Expandable = ({ entry }) => {
  const [show, setShow] = useState(false)
  return (
    <>
      {entry.map((each, rowIndex) => (
        <tr
          className={rowIndex > 0 ? `collapse ${show ? 'show' : ''}` : ''}
          key={rowIndex}
          onClick={() => setShow(!show)}
        >
          {each.map((inner, index) => (
            <td
              key={index}
              style={
                rowIndex === 1 || (index === 0 && rowIndex !== 0)
                  ? { border: 0 }
                  : undefined
              }
            >
              {inner}
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

const OpenOrdersTableBody = ({ infiniteOrders }) => {
  const {
    status,
    data: history,
    error,
    isFetching,
    isFetchingNextPage,
    isFetchingPreviousPage,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
  } = infiniteOrders
  const loadMoreButtonRef = React.useRef()
  // useIntersectionObserver({
  //   target: loadMoreButtonRef,
  //   onIntersect: fetchNextPage,
  //   enabled: hasNextPage,
  // })
  return (
    <tbody>
      {history &&
        history.pages.map((page, index) => (
          <React.Fragment key={index}>
            {page.map((row, rowIndex) => (
              <React.Fragment key={rowIndex}>
                {row.map((entry) => {
                  return <Expandable entry={entry} />
                })}
              </React.Fragment>
            ))}
          </React.Fragment>
        ))}
      <button ref={loadMoreButtonRef} onClick={() => fetchNextPage()}>
        {isFetchingNextPage
          ? 'Loading more...'
          : hasNextPage
          ? 'Load Newer'
          : 'Nothing more to load'}
      </button>
    </tbody>
  )
}

export default OpenOrdersTableBody
