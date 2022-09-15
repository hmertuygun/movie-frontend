import React, { useState, useMemo } from 'react'
import capitalize from 'utils/capitalizeFirstLetter'
import { Modal } from 'components'
import { useDispatch, useSelector } from 'react-redux'
import { notify } from 'reapop'
import MESSAGES from 'constants/Messages'
import {
  getChartTemplate,
  saveChartTemplate,
  updateActiveDrawing,
  updateAddTemplateModalOpen,
} from 'store/actions'
import { consoleLogger } from 'utils/logger'

const AddTemplate = () => {
  const [templateName, setTemplateName] = useState('')
  const [error, setError] = useState('')
  const { activeDrawing } = useSelector((state) => state.charts)
  const { templates } = useSelector((state) => state.templates)

  const dispatch = useDispatch()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!templateName) {
      setError('Name is required.')
    }
    addTemplate({ templateName })
  }

  const onClose = () => {
    dispatch(updateAddTemplateModalOpen(false))
  }

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
      dispatch(notify(MESSAGES['template-added'], 'success'))
    } catch (error) {
      consoleLogger(error)
    } finally {
      dispatch(getChartTemplate())
      dispatch(updateAddTemplateModalOpen(false))
      dispatch(updateActiveDrawing(null))
    }
  }

  const editName = useMemo(() => {
    return capitalize(activeDrawing?.name.replace('_', ' '))
  }, [activeDrawing?.name])

  return (
    <Modal>
      <form
        className="modal-dialog modal-dialog-centered modal-sm"
        onSubmit={handleSubmit}
      >
        <div className="modal-content">
          <div className="modal-header">
            <div className="modal-title">Create: {editName}</div>
            <button
              onClick={onClose}
              type="button"
              className="close"
              data-dismiss="modal"
              aria-label="Close"
            >
              <span className="modal-cross" aria-hidden="true">
                &times;
              </span>
            </button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <div className="input-group">
                <div className="input-group-prepend">
                  <span className="input-group-text">Name</span>
                </div>
                <input
                  type="text"
                  className="form-control"
                  name="watchListName"
                  value={templateName}
                  onChange={(event) => {
                    setTemplateName(event.target.value)
                  }}
                />
              </div>
              <div
                style={{
                  marginTop: '5px',
                  color: 'var(--trade-text-danger-color)',
                }}
              >
                {error}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary">
              Create As Template
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

export default AddTemplate
