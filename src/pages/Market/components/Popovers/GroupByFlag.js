import { Popover } from 'react-tiny-popover'
import { MoreHorizontal } from 'react-feather'

const GroupByFlag = ({
  styles,
  isOpen,
  setPopoverOpen,
  isAnalyst,
  handleDelete,
  setGroupByFlag,
  isPaidUser,
}) => {
  return (
    <Popover
      key="watchlist-option"
      isOpen={isOpen}
      positions={['bottom', 'top', 'right']}
      align="end"
      padding={10}
      reposition={false}
      onClickOutside={() => setPopoverOpen(false)}
      content={({ position, nudgedLeft, nudgedTop }) => (
        <div className={styles.watchListModal}>
          {isAnalyst && (
            <div
              className={styles.watchListRow}
              onClick={() => {
                setGroupByFlag()
                setPopoverOpen(false)
              }}
            >
              Group by flag
            </div>
          )}
          {!isPaidUser && (
            <div className={styles.watchListRow} onClick={() => handleDelete()}>
              Delete this list
            </div>
          )}
        </div>
      )}
    >
      <div
        className={`${styles.watchListOption} ${styles.watchListControl} ${
          isOpen ? styles.watchListControlSelected : ''
        } ${isPaidUser ? styles.groupMore : ''}`}
        onClick={() => setPopoverOpen(true)}
      >
        <MoreHorizontal />
      </div>
    </Popover>
  )
}

export default GroupByFlag
