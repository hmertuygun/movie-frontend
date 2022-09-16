import React, { useEffect, useMemo, useState } from 'react'
import { capitalize } from 'lodash'
import { HelpCircle } from 'react-feather'
import { Tooltip } from 'components'
import { AddTemplate } from '../components/Modals'
import TemplateItem from './TemplateItem'
import { useDispatch, useSelector } from 'react-redux'
import { getChartTemplate, updateAddTemplateModalOpen } from 'store/actions'

import CONTENTS from 'constants/Contents'

const TemplatesList = () => {
  const { activeDrawingId, activeDrawing } = useSelector(
    (state) => state.charts
  )
  const { addTemplateModalOpen } = useSelector((state) => state.templates)
  const dispatch = useDispatch()
  const [infoShow, setInfoShow] = useState(false)

  const templateName = useMemo(() => {
    return activeDrawing?.name
      ? capitalize(activeDrawing.name.replace('_', ' '))
      : null
  }, [activeDrawing])

  useEffect(() => {
    dispatch(getChartTemplate())
  }, [])

  return (
    <div className="mt-4 ml-3">
      <div className="row mb-2">
        <div className="col-auto align-item-end justify-content-right">
          <span
            className="badge badge-primary masonry-filter"
            isdisabled={activeDrawing?.id}
            onClick={() => {
              if (activeDrawing) dispatch(updateAddTemplateModalOpen(true))
            }}
            data-for={`add-template`}
            data-tip={!activeDrawingId ? CONTENTS['add-drawing-info'] : null}
          >
            Add
          </span>
          <Tooltip id={`add-template`} style={{ maxWidth: '1rem' }} />
        </div>
        {activeDrawing && (
          <span className="badge badge-dot">
            <i className="bg-success"></i>
            {templateName}
          </span>
        )}
        <div
          className={`tab-info-wrapper ${infoShow ? 'show' : ''}`}
          onMouseEnter={() => setInfoShow(true)}
          onMouseLeave={() => setInfoShow(false)}
        >
          <span className="h6 ml-3 "></span> <HelpCircle size={18} />
          {infoShow && (
            <div style={{ zIndex: '1000' }} className="tab-info">
              <p className="mb-2">{CONTENTS['template-beta']}</p>
            </div>
          )}
        </div>
      </div>
      <div style={{ height: '54.8vh', overflow: 'auto' }} className="row">
        <div className="col-11">
          <TemplateItem />
        </div>
      </div>
      {addTemplateModalOpen && <AddTemplate name={activeDrawing?.name} />}
    </div>
  )
}

export default TemplatesList
