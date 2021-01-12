import React from 'react'
import AccordionContainer from '../Position/components/Accordion/AccordionContainer'
import { data, cols } from '../Position/utils/mock-data'

const Position = () => {
  return (
    <div className="container" style={{ paddingTop: '48px' }}>
      <AccordionContainer data={data} columns={cols} />
    </div>
  )
}

export default Position
