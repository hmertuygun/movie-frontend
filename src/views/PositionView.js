import React from 'react'
import PositionCTXProvider from '../Position/context/PositionContext'
import { SymbolContextProvider } from '../Trade/context/SymbolContext'
import AccordionContainer from '../Position/components/Accordion/AccordionContainer'

const Position = () => {
  return (
    <PositionCTXProvider>
      <SymbolContextProvider>
        <AccordionContainer />
      </SymbolContextProvider>
    </PositionCTXProvider>
  )
}

export default Position
