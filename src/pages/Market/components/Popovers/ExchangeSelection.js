import React, { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight } from 'react-feather'
import { useSelector } from 'react-redux'
import { Popover } from 'react-tiny-popover'
import { getAllowedExchanges } from 'utils/exchangeSelection'
import { EXCHANGES } from 'constants/Exchanges'
import styles from '../../css/WatchListPanel.module.css'

const ExchangeSelection = ({ selectedExchanges, setSelectedExchanges }) => {
  const [isExchangeFilterOpen, setIsExchangeFilterOpen] = useState(false)
  const { isCanaryUser } = useSelector((state) => state.users)

  const filteredExchanges = useMemo(() => {
    return Object.entries(EXCHANGES).filter(([exchangeName]) => {
      return getAllowedExchanges().some((item) => item.value === exchangeName)
    })
  }, [isCanaryUser])

  const getExchangeText = () => {
    if (selectedExchanges.length > 0) {
      const exchanges = [...selectedExchanges]
      if (exchanges.includes('all')) exchanges.splice(0, 1)
      return exchanges.toString().toUpperCase().replace(/,/g, ', ')
    } else return 'Select Exchange'
  }

  const updateExchangeFilter = (filter) => {
    let exchanges = [...selectedExchanges]
    if (filter === 'all') {
      const allExchanges = filteredExchanges.map(([exchange]) => exchange)
      exchanges = exchanges.includes(filter) ? [] : [filter, ...allExchanges]
    } else if (exchanges.includes(filter)) {
      if (exchanges.includes('all')) exchanges.splice(0, 1)
      const filterIndex = exchanges.indexOf(filter)
      exchanges.splice(filterIndex, 1)
    } else {
      if (exchanges.includes('all')) exchanges.splice(0, 1)
      exchanges.push(filter)
    }
    setSelectedExchanges(exchanges)
  }

  return (
    <Popover
      key="symbol-filter"
      isOpen={isExchangeFilterOpen}
      positions={['bottom', 'top', 'left']}
      align="start"
      padding={10}
      reposition={false}
      onClickOutside={() => setIsExchangeFilterOpen(false)}
      content={() => (
        <div className={styles.exchangeFilterPopover}>
          <div className="custom-control custom-checkbox" key="all">
            <input
              type="checkbox"
              className="custom-control-input"
              id="all"
              data-toggle="indeterminate"
              checked={selectedExchanges.includes('all')}
              onChange={() => updateExchangeFilter('all')}
            />
            <label className="custom-control-label" htmlFor="all">
              All
            </label>
          </div>
          {filteredExchanges.map(([exchangeName, exchange]) => {
            return (
              <div
                className="custom-control custom-checkbox"
                key={exchangeName}
              >
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id={exchangeName}
                  data-toggle="indeterminate"
                  checked={
                    selectedExchanges.includes(exchangeName) ||
                    selectedExchanges.includes('all')
                  }
                  onChange={() => updateExchangeFilter(exchangeName)}
                />
                <label className="custom-control-label" htmlFor={exchangeName}>
                  {exchangeName.toUpperCase()}
                </label>
              </div>
            )
          })}
        </div>
      )}
    >
      <div
        className={styles.exchangeSelectionText}
        onClick={() => setIsExchangeFilterOpen(!isExchangeFilterOpen)}
      >
        <p>{getExchangeText()}</p>
        {isExchangeFilterOpen ? (
          <ChevronRight size={20} className={styles.alignRight} />
        ) : (
          <ChevronDown size={20} className={styles.alignRight} />
        )}
      </div>
    </Popover>
  )
}

export default ExchangeSelection
