import { Popover } from 'react-tiny-popover'
import { ChevronDown } from 'react-feather'

const CreateNewList = ({
  styles,
  isOpen,
  setWatchListOpen,
  openWatchListModal,
  isTemplateDrawingsOpen,
  watchLists,
  handleWatchListItemClick,
  activeWatchList,
}) => {
  return (
    <Popover
      key="watchlist-select-popover"
      isOpen={isOpen}
      positions={['bottom', 'top', 'right']}
      align="start"
      padding={10}
      reposition={false}
      onClickOutside={() => setWatchListOpen(false)}
      content={({ position, nudgedLeft, nudgedTop }) => (
        <div className={styles.watchListModal}>
          {!isTemplateDrawingsOpen && (
            <>
              <div
                className={styles.watchListRow}
                onClick={() => {
                  setWatchListOpen(false)
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
        onClick={() => setWatchListOpen(true)}
      >
        <span>{activeWatchList?.watchListName}</span>
        <ChevronDown size={15} style={{ marginLeft: '5px' }} />
      </div>
    </Popover>
  )
}

export default CreateNewList
