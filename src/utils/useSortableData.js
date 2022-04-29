import { useState, useMemo } from 'react'
import { storage } from 'services/storages'

const useSortableData = (items, config = null) => {
  const [sortConfig, setSortConfig] = useState(
    config || JSON.parse(storage.get('position_sort'))
  )
  const sortedItems = useMemo(() => {
    let sortableItems = items.map((item) => {
      return { ...item, ROE: Number(item?.ROE) }
    })

    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1
        }
        return 0
      })
    }
    return sortableItems
  }, [items, sortConfig])

  const requestSort = (key, direction = 'ascending') => {
    storage.set('position_sort', JSON.stringify({ key, direction }))
    setSortConfig({ key, direction })
  }

  return { items: sortedItems, requestSort, sortConfig }
}

export default useSortableData
