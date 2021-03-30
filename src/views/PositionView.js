import React from 'react'
import PositionCTXProvider from '../Position/context/PositionContext'
import { SymbolContextProvider } from '../Trade/context/SymbolContext'
import AccordionContainer from '../Position/components/Accordion/AccordionContainer'

const Position = () => {
  return (
    <PositionCTXProvider>
      <SymbolContextProvider>
        <div className="container" style={{ paddingTop: '48px' }}>
          <AccordionContainer />
        </div>
      </SymbolContextProvider>
    </PositionCTXProvider>
  )
}

export default Position
