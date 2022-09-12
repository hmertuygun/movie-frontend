import React, { useEffect, useMemo, useState } from 'react'
import { notify } from 'reapop'
import { capitalize } from 'lodash'
import { HelpCircle, X } from 'react-feather'
import { Tooltip } from 'components'
import { AddTemplate } from '../components/Modals'

import { useDispatch, useSelector } from 'react-redux'
import {
  deleteChartTemplate,
  getChartTemplate,
  saveChartTemplate,
  updateActiveDrawing,
  updateAddedDrawing,
} from 'store/actions'
import { consoleLogger } from 'utils/logger'
import MESSAGES from 'constants/Messages'

const TemplatesList = () => {
  const { activeDrawingId, activeDrawing } = useSelector(
    (state) => state.charts
  )
  const { templates } = useSelector((state) => state.templates)
  const dispatch = useDispatch()
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [infoShow, setInfoShow] = useState(false)
  const addTemplate = async ({ templateName }, template = null) => {
    try {
      const templateData = template ? template : activeDrawing
      const isSame = templates.some((element) => element.id === templateData.id)
      if (isSame) {
        return dispatch(notify(MESSAGES['duplicate-template'], 'error'))
      }
      await dispatch(
        saveChartTemplate(
          JSON.stringify({ ...templateData, tempName: templateName })
        )
      )
    } catch (error) {
      consoleLogger(error)
    } finally {
      initChartTemplate()
      setAddModalOpen(false)
      dispatch(updateActiveDrawing(null))
    }
  }
  ///chart_drawings/hmert.uygun@hotmail.com
  const removeTemplate = async (e, templateId) => {
    e.stopPropagation()
    try {
      await dispatch(deleteChartTemplate(templateId))
    } catch (error) {
      consoleLogger(error)
    } finally {
      initChartTemplate()
    }
  }

  const initChartTemplate = async () => {
    dispatch(getChartTemplate())
  }

  const addToChart = (template) => {
    dispatch(updateAddedDrawing(template))
  }

  const templateName = useMemo(() => {
    return activeDrawing?.name
      ? capitalize(activeDrawing.name.replace('_', ' '))
      : null
  }, [activeDrawing])

  useEffect(() => {
    initChartTemplate()
  }, [])

  return (
    <div className="mt-4 ml-3">
      <div className="row mb-2">
        <div className="col-auto align-item-end justify-content-right">
          <span
            className="badge badge-primary masonry-filter"
            isdisabled={activeDrawing?.id}
            onClick={() => {
              if (activeDrawing) setAddModalOpen(true)
            }}
            data-for={`add-template`}
            data-tip={
              !activeDrawingId
                ? 'Click on drawing that you want to add a template for.'
                : null
            }
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
              <p className="mb-2">
                This feature is still on Beta. You can add your own drawing
                templates and use them. Give us feedback from{' '}
                <a href="mailto:support@coinpanel.com">here</a>.
              </p>
            </div>
          )}
        </div>
      </div>
      <div style={{ height: '54.8vh', overflow: 'auto' }} className="row">
        <div className="col-11">
          <div className="list-group">
            {templates.length ? (
              templates.map((template) => (
                <span
                  key={`template-${template.id}-${Math.random() * 1000}`}
                  className="list-group-item list-group-item-action masonry-filter d-flex justify-content-between"
                  onClick={() => {
                    addToChart(template)
                  }}
                >
                  <span className="text-muted">{template.tempName}</span>
                  <span className="badge badge-danger badge-circle">
                    <X
                      size={15}
                      onClick={(e) => removeTemplate(e, template.refId)}
                      style={{ zIndex: 999 }}
                    />
                  </span>
                </span>
              ))
            ) : (
              <p className="p-2">
                You don't have any drawing templates. Try it out!
              </p>
            )}
          </div>
        </div>
      </div>
      {addModalOpen && (
        <AddTemplate
          onClose={() => setAddModalOpen(false)}
          onSave={(name) => addTemplate(name)}
          name={activeDrawing?.name}
        />
      )}
    </div>
  )
}

export default TemplatesList
