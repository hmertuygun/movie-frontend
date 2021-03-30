import React from 'react'
import PositionCTXProvider from '../Position/context/PositionContext'
import AccordionContainer from '../Position/components/Accordion/AccordionContainer'

const Position = () => {
  return (
    <PositionCTXProvider>
      <div className="container" style={{ paddingTop: '48px' }}>
        <AccordionContainer />
      </div>
    </PositionCTXProvider>
  )
}

export default Position
