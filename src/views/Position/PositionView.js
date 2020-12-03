import React from 'react'
import AccordionContainer from './components/Accordion/AccordionContainer'
import { data, cols } from './utils/mock-data'

const Position = () => {

    return (
        <div className='container'>
            <AccordionContainer data={data} columns={cols} />
        </div>
    )
}

export default Position
 