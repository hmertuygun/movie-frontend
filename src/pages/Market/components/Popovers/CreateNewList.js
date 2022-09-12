import { Popover } from 'react-tiny-popover'
import { ChevronDown } from 'react-feather'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import { saveWatchList, updateActiveWatchLists } from 'store/actions'
import { useState } from 'react'

const CreateNewList = ({ styles, openWatchListModal }) => {
  const { templateDrawingsOpen } = useSelector((state) => state.templates)
  const [isOpen, setIsOpen] = useState(false)
  const { activeWatchList, watchLists } = useSelector(
    (state) => state.watchlist
  )
  const dispatch = useDispatch()
  const handleWatchListItemClick = async (watchListName) => {
    if (watchListName !== activeWatchList.watchListName)
      if (!templateDrawingsOpen) {
        let data = {
          activeList: watchListName,
        }
        dispatch(saveWatchList(data))
      } else {
        dispatch(updateActiveWatchLists(watchLists[watchListName]))
      }
    setIsOpen(false)
  }

  return (
    <Popover
      key="watchlist-select-popover"
      isOpen={isOpen}
      positions={['bottom', 'top', 'right']}
      align="start"
      padding={10}
      reposition={false}
      onClickOutside={() => setIsOpen(false)}
      content={({ position, nudgedLeft, nudgedTop }) => (
        <div className={styles.watchListModal}>
          {!templateDrawingsOpen && (
            <>
              <div
                className={styles.watchListRow}
                onClick={() => {
                  setIsOpen(false)
                  openWatchListModal(true)
                }}
              >
                Create new list...
              </div>
            </>
          )}
          {Object.keys(watchLists).map((list) => {
            return (
              <div
                key={list}
                className={styles.watchListRow}
                onClick={() => handleWatchListItemClick(list)}
              >
                {list}
              </div>
            )
          })}
        </div>
      )}
    >
      <div
        className={`${styles.watchListDropdown} ${styles.watchListControl} ${
          isOpen ? styles.watchListControlSelected : ''
        }`}
        onClick={() => setIsOpen(true)}
      >
        <span>{activeWatchList?.watchListName}</span>
        <ChevronDown size={15} style={{ marginLeft: '5px' }} />
      </div>
    </Popover>
  )
}

CreateNewList.propTypes = {
  styles: PropTypes.object,
  openWatchListModal: PropTypes.func,
}

export default CreateNewList
