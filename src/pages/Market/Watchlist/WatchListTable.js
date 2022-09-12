import { orderBy } from 'lodash'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import sortTemplate from 'utils/sortTemplate'
import WatchListItem from './WatchListItem'

const WatchListTable = ({
  styles,
  isGroupByFlag,
  getWatchSymbolsList,
  loading,
}) => {
  const { templateDrawingsOpen } = useSelector((state) => state.templates)
  const { isAnalyst } = useSelector((state) => state.users)
  const { emojis } = useSelector((state) => state.analysts)
  const { symbolsList } = useSelector((state) => state.watchlist)
  const [orderSetting, setOrderSetting] = useState({
    label: 'asc',
  })
  const orderedSymbolsList = orderBy(
    symbolsList,
    [Object.keys(orderSetting)],
    [Object.values(orderSetting)]
  )
  let unassignedList = orderedSymbolsList.filter((lists) => lists.flag === 0)

  const handleOrderChange = (orderItem) => {
    setOrderSetting((setting) => {
      switch (orderItem) {
        case 'label':
          return {
            label: setting.label === 'asc' ? 'desc' : 'asc',
          }

        case 'percentage':
          return {
            percentage: setting.percentage === 'asc' ? 'desc' : 'asc',
          }

        default:
          break
      }
    })
  }

  return (
    <>
      <div className={styles.contentHeader}>
        <div
          onClick={() => handleOrderChange('label')}
          className={styles.labelColumn}
        >
          Symbol {sortTemplate(orderSetting.label)}
        </div>
        <div>Last</div>
        <div onClick={() => handleOrderChange('percentage')}>
          Chg% {sortTemplate(orderSetting.label)}
        </div>
      </div>
      <div
        className={`${
          templateDrawingsOpen ? styles.watchLists2 : styles.watchLists
        } enlarged-watch-lists
        `}
      >
        {!Object.keys(getWatchSymbolsList()).length && !loading ? (
          <div className="pt-5 text-center">
            <div className="text-primary" role="status">
              <span className="">Your watchlist is empty!</span>
            </div>
          </div>
        ) : (
          <>
            {(templateDrawingsOpen && isGroupByFlag) ||
            (isAnalyst && isGroupByFlag) ? (
              <>
                {emojis &&
                  emojis.map((emoji) => {
                    let list = orderedSymbolsList.filter(
                      (lists) => lists.flag === emoji.id
                    )
                    if (emoji.emoji) {
                      return (
                        <>
                          <div className={styles.groupEmojiWrapper}>
                            <span className={styles.groupEmoji}>
                              {emoji.emoji}
                            </span>
                            {list.length ? (
                              list.map((symbol) => (
                                <WatchListItem
                                  key={symbol.value}
                                  symbol={symbol}
                                  group={true}
                                />
                              ))
                            ) : (
                              <p className="text-center">
                                No market assigned to this flag
                              </p>
                            )}
                          </div>
                        </>
                      )
                    }
                  })}
                {unassignedList && unassignedList.length > 0 && (
                  <div className={styles.groupEmojiWrapper}>
                    <span className={styles.groupEmoji}>Unassigned</span>
                    {unassignedList.map((symbol) => (
                      <WatchListItem
                        key={symbol.value}
                        symbol={symbol}
                        group={true}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              orderedSymbolsList.map((symbol) => (
                <WatchListItem key={symbol.value} symbol={symbol} />
              ))
            )}
          </>
        )}
      </div>
    </>
  )
}

export default WatchListTable
