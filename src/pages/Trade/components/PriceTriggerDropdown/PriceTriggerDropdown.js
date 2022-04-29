import React from 'react'
import Dropdown from 'react-dropdown'
import 'react-dropdown/style.css'
import './PriceTriggerDropdown.css'

function PriceTriggerDropdown({ options, value, onSelect }) {
  return (
    <Dropdown
      className="priceTriggerDropdown"
      controlClassName="priceTriggerDropdownControl"
      placeholderClassName="priceTriggerDropdownPlaceholder"
      menuClassName="priceTriggerDropdownMenu"
      options={options}
      onChange={onSelect}
      value={value}
      placeholder="Select an option"
    />
  )
}

export default PriceTriggerDropdown
