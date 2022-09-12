import {
  getCollection,
  getCollectionDoc,
  getCollectionDocData,
  getCollectionData,
  getDoubleCollectionData,
} from 'services/firestore'

const getFirestoreDocumentData = async (collection, email) =>
  await getCollectionDocData(collection, email)

const getFirestoreCollectionData = async (collectionName, filter = false) =>
  getCollectionData(collectionName, filter)

const getSnapShotCollection = (collection) => getCollection(collection)

const getSnapShotDocument = (collection, email) =>
  getCollectionDoc(collection, email)

const getDoubleCollection = async (collectionOne, collectionTwo, email) =>
  await getDoubleCollectionData(collectionOne, collectionTwo, email)

export {
  getFirestoreDocumentData,
  getFirestoreCollectionData,
  getSnapShotCollection,
  getSnapShotDocument,
  getDoubleCollection,
}
