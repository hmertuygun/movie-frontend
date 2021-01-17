import React, { useState } from 'react'
import Input from '../../Input/Input'

const Search = ({ onSearch }) => {
  const [search, setSearch] = useState('')

  const onInputChange = (value) => {
    setSearch(value)
    onSearch(value)
  }
  return (
    <Input
      type="text"
      placeholder="Search"
      value={search}
      onChange={(value) => onInputChange(value)}
    />
  )
}

export default Search
