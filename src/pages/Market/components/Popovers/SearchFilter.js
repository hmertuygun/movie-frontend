import React, { useState } from 'react'
import { Filter } from 'react-feather'
import { Popover } from 'react-tiny-popover'
import styles from '../../css/WatchListPanel.module.css'

const SearchFilter = ({ filteredItem, setFilteredItem, QuoteAssets }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const updateFilter = (filter) => {
    if (filteredItem.includes(filter)) {
      const filterIndex = filteredItem.indexOf(filter)
      const newFilter = [...filteredItem]
      newFilter.splice(filterIndex, 1)
      setFilteredItem(newFilter)
    } else {
      setFilteredItem([...filteredItem, filter])
    }
  }

  return (
    <Popover
      key="symbol-filter"
      isOpen={isFilterOpen}
      positions={['bottom', 'top', 'right']}
      align="end"
      padding={10}
      reposition={false}
      onClickOutside={() => setIsFilterOpen(false)}
      content={() => (
        <div className={styles.filterPopover}>
          {QuoteAssets.map((asset) => (
            <div className="custom-control custom-checkbox" key={asset}>
              <input
                type="checkbox"
                className="custom-control-input"
                id={asset}
                data-toggle="indeterminate"
                checked={filteredItem.includes(asset)}
                onChange={() => updateFilter(asset)}
              />
              <label className="custom-control-label" htmlFor={asset}>
                {asset}
              </label>
            </div>
          ))}
        </div>
      )}
    >
      <Filter onClick={() => setIsFilterOpen(true)} />
    </Popover>
  )
}

export default SearchFilter
