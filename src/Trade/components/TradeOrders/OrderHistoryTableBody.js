import React from 'react'
import useIntersectionObserver from './useIntersectionObserver'

const OrderHistoryTableBody = ({ infiniteOrders }) => {
  const {
    data: history,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
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
                <td style={{ color: order.side === 'BUY' ? 'green' : 'red' }}>
                  {order.side}
                </td>
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
      <tr ref={loadMoreButtonRef}>
        <td colSpan="12">
          {isFetchingNextPage
            ? 'Loading more...'
            : hasNextPage
            ? 'Load Newer'
            : 'Nothing more to load'}
        </td>
      </tr>
    </tbody>
  )
}

export default OrderHistoryTableBody
