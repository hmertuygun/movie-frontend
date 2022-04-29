import {
  getCollection,
  getCollectionDoc,
  getCollectionDocData,
  updateCollection,
  getCollectionData,
  addToDoubleCollection,
  updateDoubleCollectionDoc,
  deleteFromDoubleCollection,
  getDoubleCollectionData,
} from 'services/firestore'

const getFirestoreDocumentData = async (collection, email) =>
  await getCollectionDocData(collection, email)

const getFirestoreCollectionData = async (collectionName, filter = false) =>
  getCollectionData(collectionName, filter)

const addDataToDoubleCollection = async (
  collectionOne,
  collectionTwo,
  email,
  data
) => await addToDoubleCollection(collectionOne, collectionTwo, email, data)

const getSnapShotCollection = (collection) => getCollection(collection)

const getSnapShotDocument = (collection, email) =>
  getCollectionDoc(collection, email)

const updateSingleValue = async (identifier, collection, value) => {
  await updateCollection(collection, identifier, {
    ...value,
  })
}

const getChartTemplates = async (email) =>
  await getDoubleCollectionData('chart_templates', 'templates', email)

const addTemplateToFirestore = async (email, data) =>
  await addToDoubleCollection('chart_templates', 'templates', email, data)

const deleteTemplateFromFirestore = async (email, templateId) =>
  await deleteFromDoubleCollection(
    'chart_templates',
    'templates',
    email,
    templateId
  )

const updateTemplateDrawings = async (email, value) => {
  await updateCollection('chart_shared', email, {
    ...value,
  })
}

const updateLastSelectedValue = async (email, value) => {
  await updateCollection('apiKeyIDs', email, {
    activeLastSelected: value,
  })
}

const setWatchlistData = async (email, initState) => {
  await updateCollection('watch_list', email, initState)
}

const setChartDrawings = async (email, drawings) => {
  await updateCollection('chart_drawings', email, {
    drawings,
  })
}

const initDrawingDocuments = async (email, drawings) => {
  await updateCollection('chart_drawings', email, {
    ...drawings,
  })
}

const initUserData = async (email, data) => {
  await updateCollection('user_data', email, {
    ...data,
  })
}

const createBackup = async (email, drawings) => {
  const id = new Date().toString()
  await updateDoubleCollectionDoc('chart_drawings', email, 'backups', id, {
    drawings,
  })
}

export {
  getFirestoreDocumentData,
  getFirestoreCollectionData,
  addDataToDoubleCollection,
  getSnapShotCollection,
  getSnapShotDocument,
  updateTemplateDrawings,
  updateLastSelectedValue,
  setWatchlistData,
  getChartTemplates,
  addTemplateToFirestore,
  deleteTemplateFromFirestore,
  setChartDrawings,
  initDrawingDocuments,
  initUserData,
  updateSingleValue,
  createBackup,
}
