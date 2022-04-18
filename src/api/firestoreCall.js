import { firebase } from '../firebase/firebase'

const db = firebase.firestore()
const FieldValue = firebase.firestore.FieldValue

//Generic function to get document from firestore
export const getFirestoreDocumentData = async (collectionName, email) => {
  return await db.collection(collectionName).doc(email).get()
}

//Generic function to get collections from firestore
export const getFirestoreCollectionData = async (
  collectionName,
  filter = false
) => {
  return filter
    ? db.collection(collectionName).where('active', '==', true).get()
    : db.collection(collectionName).get()
}

export const getFireStoreDoubleCollectionData = async (
  collectionOne,
  collectionTwo,
  email,
  data
) => {
  return db
    .collection(collectionOne)
    .doc(email)
    .collection(collectionTwo)
    .add(data)
}

export const getSnapShotCollection = (collection) => {
  return db.collection(collection)
}

export const getSnapShotDocument = (collection, email) => {
  return db.collection(collection).doc(email)
}

export const updateTemplateDrawings = async (email, value) => {
  await db
    .collection('chart_shared')
    .doc(email)
    .set(
      {
        ...value,
      },
      { merge: true }
    )
}

export const updateLastSelectedValue = async (email, value) => {
  await db.collection('apiKeyIDs').doc(email).set(
    {
      activeLastSelected: value,
    },
    { merge: true }
  )
}

export const setWatchlistData = async (email, initState) => {
  await db.collection('watch_list').doc(email).set(initState, { merge: true })
}

export const setChartDrawings = async (email, drawings) => {
  await db.collection('chart_drawings').doc(email).set(
    {
      drawings,
    },
    { merge: true }
  )
}

export const createBackup = async (email, drawings) => {
  const id = new Date().toString()
  await db
    .collection('chart_drawings')
    .doc(email)
    .collection('backups')
    .doc(id)
    .set(
      {
        drawings,
      },
      { merge: true }
    )
}
