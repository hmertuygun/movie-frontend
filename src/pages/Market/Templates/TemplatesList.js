import React, { useEffect, useMemo, useState } from 'react'
import { notify } from 'reapop'
import { capitalize } from 'lodash'
import { HelpCircle, X } from 'react-feather'
import { Tooltip } from 'components'
import { AddTemplate } from '../components/Modals'

import {
  addTemplateToFirestore,
  deleteTemplateFromFirestore,
  getChartTemplates,
  getFirestoreDocumentData,
  getSnapShotDocument,
} from 'services/api'
import { firebase } from 'services/firebase'
import { useDispatch, useSelector } from 'react-redux'
import { updateActiveDrawing, updateAddedDrawing } from 'store/actions'
import { consoleLogger } from 'utils/logger'
import MESSAGES from 'constants/Messages'

const FieldValue = firebase.firestore.FieldValue

const TemplatesList = () => {
  const { userData } = useSelector((state) => state.users)
  const { activeDrawingId, activeDrawing } = useSelector(
    (state) => state.charts
  )
  const dispatch = useDispatch()
  const [templates, setTemplates] = useState([])
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [infoShow, setInfoShow] = useState(false)
  const addTemplate = async ({ templateName }, template = null) => {
    try {
      const templateData = template ? template : activeDrawing
      const isSame = templates.some((element) => element.id === templateData.id)
      if (isSame) {
        return dispatch(notify(MESSAGES['duplicate-template'], 'error'))
      }
      addTemplateToFirestore(userData.email, {
        data: JSON.stringify({ ...templateData, tempName: templateName }),
      }).then(function (docRef) {
        setTemplates((prevState) => {
          return [
            ...prevState,
            { fsDd: docRef.id, ...templateData, tempName: templateName },
          ]
        })
      })
    } catch (error) {
      consoleLogger(error)
    } finally {
      setAddModalOpen(false)
      dispatch(updateActiveDrawing(null))
    }
  }
  ///chart_drawings/hmert.uygun@hotmail.com
  const removeTemplate = (e, templateId) => {
    e.stopPropagation()
    try {
      deleteTemplateFromFirestore(userData.email, templateId)
        .then(() => {
          setTemplates((prevState) => {
            return prevState.filter((template) => template.fsId !== templateId)
          })
        })

        .catch((error) => {
          consoleLogger('Error removing document: ', error)
        })
    } catch (error) {
      consoleLogger(error)
    } finally {
      getInitialData()
    }
  }

  const getInitialData = async () => {
    const sfRef = await getSnapShotDocument('chart_templates', userData.email)
      .collection('templates')
      .get()
    const check = await getChartTemplates(userData.email)

    if (check.empty) {
      getDataFromAnotherCollection()
      return
    }
    const { docs } = sfRef
    const templates = docs.map((doc) => {
      const { data } = doc.data()
      if (!data) return null
      return { ...JSON.parse(data), fsId: doc.id }
    })
    setTemplates(templates)
  }

  const getDataFromAnotherCollection = () => {
    getFirestoreDocumentData('chart_drawings', userData.email).then(
      (snapshot) => {
        const { templates } = snapshot.data()
        if (!templates) {
          setTemplates([])
        } else {
          const data = JSON.parse(templates)

          const promises = data.map(async (template) => {
            await addTemplate({ templateName: template.tempName }, template)
          })
          Promise.all(promises)
            .then(async () => {
              const ref = await getSnapShotDocument(
                'chart_drawings',
                userData.email
              )
              await ref.update({
                templates: FieldValue.delete(),
              })
            })
            .catch((err) => {
              consoleLogger(err)
            })
        }
      }
    )
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
    getInitialData()
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
                      onClick={(e) => removeTemplate(e, template.fsId)}
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
