import React from 'react'
import AccordionHeader from './AccordionHeader'
import useSortableData from '../../utils/useSortableData'
import Accordion from './Accordion'

const AccordionContainer = (props) => {
  const { items, requestSort } = useSortableData(props.data)

  let rows = items.map((item, idx) => {
    return <Accordion key={idx} {...item} />
  })

  return (
    <>
      <AccordionHeader requestSort={requestSort} />

      <div className="row mx-0 align-items-center flex-wrap flex-lg-nowrap pr-md-6 d-none d-lg-block">
        <div className="card-body d-flex align-items-center flex-wrap flex-lg-nowrap py-0 pr-0 font-weight-bold">
          <div
            className="col-auto col-lg-2 align-items-center pr-0 pt-3 pt-lg-0 zindex-100 mr-3"
            style={{ paddingLeft: '1.85rem' }}
          >
            Market
          </div>
          <div className="col-lg-1 col-auto pl-0 px-md-0 ml-md-0 ml-2 px-0 pt-3 pt-lg-0">
            <div
              className="align-items-center mb-0 text-center"
              data-toggle="tooltip"
              data-placement="top"
              title="Return on Equity"
            >
              <span className="text-md font-weight-bold">ROE %</span>
            </div>
          </div>
          <div className="col-lg-2 col-auto pl-0 pl-md-2 ml-md-0 ml-2 px-0 pt-3 pt-lg-0">
            <div
              className="align-items-center mb-0 text-center"
              data-toggle="tooltip"
              data-placement="top"
              title="Profit & Loss"
            >
              <span className="text-md font-weight-bold">PNL</span>
            </div>
          </div>
          <div className="col-12 col-lg-7 d-flex align-items-center position-static py-3 py-lg-3 px-0">
            <div className="col col-lg-12 position-static px-0 text-lg-center">
              <div className="d-flex flex-wrap flex-lg-nowrap align-items-center">
                <div className="col-12 col-lg-3 px-0 position-static">
                  <span id="value">Entry Price</span>
                </div>
                <div className="col-12 col-lg-3 px-0 position-static">
                  <span id="value">Current Price</span>
                </div>
                <div className="col-12 col-lg-3 px-0 position-static">
                  <span id="value">Units</span>
                </div>
                <div className="col-12 col-lg-3 px-0 position-static text-muted">
                  <span id="value">Date Opened</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="accordion" className="accordion accordion-spaced">
        {rows}
      </div>
    </>
  )
}

export default AccordionContainer
