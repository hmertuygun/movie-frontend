import React from 'react'

const OrderHistoryTableBody = ({ infiniteOrders }) => {
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
        history.pages.map((page) => (
          <React.Fragment key={page.nextId}>
            {page.map((row, index) => (
              <tr key={index}>
                {row.map((entry, index) => {
                  if (typeof entry === 'string') {
                    return <td key={entry + index}>{entry}</td>
                  }
                })}
              </tr>
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

export default OrderHistoryTableBody
