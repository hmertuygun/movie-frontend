import CONTENTS from 'constants/Contents'
import MESSAGES from 'constants/Messages'
import React from 'react'
import { X } from 'react-feather'
import { useDispatch, useSelector } from 'react-redux'
import { notify } from 'reapop'
import {
  deleteChartTemplate,
  getChartTemplate,
  updateAddedDrawing,
} from 'store/actions'
import { consoleLogger } from 'utils/logger'

const TemplateItem = () => {
  const { templates } = useSelector((state) => state.templates)
  const dispatch = useDispatch()

  const removeTemplate = async (e, templateId) => {
    e.stopPropagation()
    try {
      await dispatch(deleteChartTemplate(templateId))
      dispatch(notify(MESSAGES['template-deleted'], 'success'))
    } catch (error) {
      consoleLogger(error)
    } finally {
      dispatch(getChartTemplate())
    }
  }

  return (
    <div className="list-group">
      {templates?.length ? (
        templates.map((template) => (
          <span
            key={`template-${template.id}-${Math.random() * 1000}`}
            className="list-group-item list-group-item-action masonry-filter d-flex justify-content-between"
            onClick={() => {
              dispatch(updateAddedDrawing(template))
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
        <p className="p-2">{CONTENTS['no-templates']}</p>
      )}
    </div>
  )
}

export default TemplateItem
