import React, { useContext, useEffect, useMemo, useState } from 'react'
import { UserContext } from '../../../contexts/UserContext'
import { getFirestoreDocumentData } from '../../../api/firestoreCall'
import { firebase } from '../../../firebase/firebase'
import AddTemplateModal from './AddTemplateModal'
import { HelpCircle, X } from 'react-feather'
import Tooltip from '../../../components/Tooltip'
import { capitalize } from 'lodash'
import { useNotifications } from 'reapop'

const db = firebase.firestore()

const TemplatesList = () => {
  const {
    activeDrawingId,
    setActiveDrawing,
    activeDrawing,
    userData,
    setAddedDrawing,
  } = useContext(UserContext)
  const { notify } = useNotifications()
  const [templates, setTemplates] = useState([])
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [infoShow, setInfoShow] = useState(false)

  const addTemplate = ({ templateName }) => {
    try {
      const isSame = templates.some(
        (element) => element.id === activeDrawing.id
      )
      if (isSame) {
        return notify({
          status: 'error',
          title: 'Error',
          message: `You cannot add the same template.`,
        })
      }
      db.collection('chart_drawings')
        .doc(userData.email)
        .set(
          {
            templates: JSON.stringify([
              ...templates,
              { ...activeDrawing, tempName: templateName },
            ]),
          },
          { merge: true }
        )
      setActiveDrawing(null)
    } catch (error) {
      console.log(error)
    } finally {
      setAddModalOpen(false)
      getInitialData()
    }
  }

  const removeTemplate = (e, templateId) => {
    e.stopPropagation()
    let template = templates.filter((template) => template.id !== templateId)
    try {
      db.collection('chart_drawings')
        .doc(userData.email)
        .set(
          {
            templates: JSON.stringify(template),
          },
          { merge: true }
        )
    } catch (error) {
      console.log(error)
    } finally {
      getInitialData()
    }
  }

  const getInitialData = () => {
    getFirestoreDocumentData('chart_drawings', userData.email)
      .then((apiKey) => {
        const { templates } = apiKey.data()
        if (templates) setTemplates(JSON.parse(templates))
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const addToChart = (template) => {
    setAddedDrawing(template)
  }

  const templateName = useMemo(() => {
    return activeDrawing?.name
      ? capitalize(activeDrawing.name.replace('_', ' '))
      : null
  }, [activeDrawing])

  useEffect(() => {
    getInitialData()
  }, [])

  return (
    <div className="mt-4 ml-3">
      <div className="row mb-2">
        <div className="col-auto align-item-end justify-content-right">
          <span
            className="badge badge-primary masonry-filter"
            isDisabled={activeDrawing}
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
          <span class="badge badge-dot">
            <i class="bg-success"></i>
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
            <div className="tab-info">
              <p className="mb-2">
                This feature is still on Beta. You can add your own drawing
                templates and use them. Give us feedback from{' '}
                <a href="mailto:support@coinpanel.com">here</a>.
              </p>
            </div>
          )}
        </div>
      </div>
      <div
        style={{ height: 'calc(100vh - 320px)', overflow: 'auto' }}
        className="row"
      >
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
                  {template.tempName}
                  <span className="badge badge-danger badge-circle">
                    <X
                      size={15}
                      onClick={(e) => removeTemplate(e, template.id)}
                      style={{ zIndex: 999 }}
                    />
                  </span>
                </span>
              ))
            ) : (
              <p className="p-2">
                You don't have any drawing templates. Try out!
              </p>
            )}
          </div>
        </div>
      </div>
      {addModalOpen && (
        <AddTemplateModal
          onClose={() => setAddModalOpen(false)}
          onSave={(name) => addTemplate(name)}
          name={activeDrawing.name}
        />
      )}
    </div>
  )
}

export default TemplatesList
