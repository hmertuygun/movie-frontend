import React from 'react'
import useIntersectionObserver from './useIntersectionObserver'

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
  useIntersectionObserver({
    target: loadMoreButtonRef,
    onIntersect: fetchNextPage,
    enabled: hasNextPage,
  })
  return (
    <tbody>
      {history &&
        history.pages.map((page, pageIndex) => (
          <React.Fragment key={pageIndex}>
            {page.map((order, index) => (
              <tr key={index}>
                <td></td>
                <td>{order.symbol}</td>
                <td>{order.type}</td>
                <td>{order.side}</td>
                <td>{order.price}</td>
                <td>{order.amount}</td>
                <td>{order.filled}</td>
                <td>{order.total}</td>
                <td>{order.trigger}</td>
                <td>{order.status}</td>
                <td>{order.update_time}</td>
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
