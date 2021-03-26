import React from 'react'
import Dropdown from 'react-dropdown'
import 'react-dropdown/style.css'
import './PriceTriggerDropdown.css'

const options = [
  { value: 'b', label: 'Bid' },
  { value: 'a', label: 'Ask' },
  { value: 'p', label: 'Last' },
]

const defaultOption = { value: 'p', label: 'Last' }

function PriceTriggerDropdown({ onSelect }) {
  return (
    <Dropdown
      className="priceTriggerDropdown"
      controlClassName="priceTriggerDropdownControl"
      placeholderClassName="priceTriggerDropdownPlaceholder"
      menuClassName="priceTriggerDropdownMenu"
      options={options}
      onChange={onSelect}
      value={defaultOption}
      placeholder="Select an option"
    />
  )
}

export default PriceTriggerDropdown
