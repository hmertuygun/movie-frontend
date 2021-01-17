import React from 'react'
import useIntersectionObserver from './useIntersectionObserver'
import Moment from 'react-moment'

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
                <td style={{ color: order.side === 'Buy' ? 'green' : 'red' }}>
                  {order.side}
                </td>
                <td>{order.price}</td>
                <td>{order.amount}</td>
                <td>{order.filled}</td>
                <td>{order.total}</td>
                <td>{order.trigger}</td>
                <td>{order.status}</td>
                <td><Moment unix format="YYYY-MM-DD hh:mm:ss">{order.update_time/1000}</Moment></td>
              </tr>
            ))}
          </React.Fragment>
        ))}
      <tr ref={loadMoreButtonRef}>
        <td colSpan="12">
          {isFetchingNextPage
            ? 'Loading more...'
            : hasNextPage
            ? 'Load Older'
            : 'Nothing more to load'}
        </td>
      </tr>
    </tbody>
  )
}

export default OrderHistoryTableBody
