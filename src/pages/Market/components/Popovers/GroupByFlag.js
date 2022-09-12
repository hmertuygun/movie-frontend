import { Popover } from 'react-tiny-popover'
import { MoreHorizontal } from 'react-feather'
import { DEFAULT_WATCHLIST } from 'constants/Trade'
import { useDispatch, useSelector } from 'react-redux'
import { notify } from 'reapop'
import MESSAGES from 'constants/Messages'
import { deleteWatchList, saveWatchList } from 'store/actions'
import { consoleLogger } from 'utils/logger'
import PropTypes from 'prop-types'
import { useState } from 'react'

const GroupByFlag = ({ styles, setGroupByFlag, isPaidUser }) => {
  const dispatch = useDispatch()
  const { isAnalyst } = useSelector((state) => state.users)
  const { watchLists, activeWatchList } = useSelector(
    (state) => state.watchlist
  )
  const [isOpen, setIsopen] = useState(false)
  const handleDelete = async () => {
    setIsopen(false)
    if (activeWatchList.watchListName === DEFAULT_WATCHLIST) {
      dispatch(notify(MESSAGES['delete-default-error'], 'error'))
      return
    }
    try {
      const { watchListName } = activeWatchList
      let updateList = JSON.parse(JSON.stringify(watchLists))
      delete updateList[watchListName]
      await dispatch(deleteWatchList({ watchListName: watchListName })).then(
        () => {
          dispatch(notify(MESSAGES['delete-list-success'], 'success'))
          dispatch(
            saveWatchList({
              activeList: Object.keys(updateList)[0] || DEFAULT_WATCHLIST,
            })
          )
        }
      )
    } catch (e) {
      consoleLogger(e)
    }
  }

  return (
    <Popover
      key="watchlist-option"
      isOpen={isOpen}
      positions={['bottom', 'top', 'right']}
      align="end"
      padding={10}
      reposition={false}
      onClickOutside={() => setIsopen(false)}
      content={({ position, nudgedLeft, nudgedTop }) => (
        <div className={styles.watchListModal}>
          {isAnalyst && (
            <div
              className={styles.watchListRow}
              onClick={() => {
                setGroupByFlag()
                setIsopen(false)
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
        onClick={() => setIsopen(true)}
      >
        <MoreHorizontal />
      </div>
    </Popover>
  )
}

GroupByFlag.propTypes = {
  styles: PropTypes.object,
  setGroupByFlag: PropTypes.func,
  isPaidUser: PropTypes.bool,
}

export default GroupByFlag
