import React, { useContext, useEffect, useMemo, useState } from 'react'
import { UserContext } from '../../../contexts/UserContext'
import {
  getFirestoreDocumentData,
  getSnapShotDocument,
} from '../../../api/firestoreCall'
import { firebase } from '../../../firebase/firebase'
import AddTemplateModal from './AddTemplateModal'
import { HelpCircle, X } from 'react-feather'
import Tooltip from '../../../components/Tooltip'
import { capitalize } from 'lodash'
import { useNotifications } from 'reapop'

const db = firebase.firestore()
const FieldValue = firebase.firestore.FieldValue

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

  const addTemplate = async ({ templateName }, template = null) => {
    try {
      const templateData = template ? template : activeDrawing
      const isSame = templates.some((element) => element.id === templateData.id)
      if (isSame) {
        return notify({
          status: 'error',
          title: 'Error',
          message: `You cannot add the same template.`,
        })
      }

      await db
        .collection('chart_templates')
        .doc(userData.email)
        .collection('templates')
        .add(
          {
            data: JSON.stringify({ ...templateData, tempName: templateName }),
          },
          { merge: true }
        )
        .then(function (docRef) {
          setTemplates((prevState) => {
            return [
              ...prevState,
              { fsDd: docRef.id, ...templateData, tempName: templateName },
            ]
          })
        })
    } catch (error) {
      console.log(error)
    } finally {
      setAddModalOpen(false)
      setActiveDrawing(null)
    }
  }
  ///chart_drawings/hmert.uygun@hotmail.com
  const removeTemplate = (e, templateId) => {
    e.stopPropagation()
    try {
      db.collection('chart_templates')
        .doc(userData.email)
        .collection('templates')
        .doc(templateId)
        .delete()
        .then(() => {
          setTemplates((prevState) => {
            return prevState.filter((template) => template.fsId !== templateId)
          })
        })

        .catch((error) => {
          console.error('Error removing document: ', error)
        })
    } catch (error) {
      console.log(error)
    } finally {
      getInitialData()
    }
  }

  const getInitialData = async () => {
    const sfRef = await getSnapShotDocument('chart_templates', userData.email)
      .collection('templates')
      .get()
    const check = await db
      .collection('chart_templates')
      .doc(userData.email)
      .collection('templates')
      .get()

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
              console.log(err)
            })
        }
      }
    )
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
        <AddTemplateModal
          onClose={() => setAddModalOpen(false)}
          onSave={(name) => addTemplate(name)}
          name={activeDrawing?.name}
        />
      )}
    </div>
  )
}

export default TemplatesList
