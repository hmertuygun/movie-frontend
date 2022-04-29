import { firebase } from 'services/firebase'

const getDB = () => firebase.firestore()

const getCollection = (collection) => getDB().collection(collection)

const getCollectionDoc = (collection, email) =>
  getDB().collection(collection).doc(email)

const getCollectionDocData = (collection, email) =>
  getDB().collection(collection).doc(email).get()

const updateCollection = async (collection, email, data) => {
  await getDB().collection(collection).doc(email).set(data, { merge: true })
}

const updateDoubleCollectionDoc = async (
  collection1,
  doc1,
  collection2,
  doc2,
  data
) => {
  await getDB()
    .collection(collection1)
    .doc(doc1)
    .collection(collection2)
    .doc(doc2)
    .set(
      {
        ...data,
      },
      { merge: true }
    )
}

const getCollectionData = async (collectionName, filter = false) =>
  filter
    ? getDB().collection(collectionName).where('active', '==', true).get()
    : getDB().collection(collectionName).get()

const addToDoubleCollection = async (collection1, collection2, email, data) =>
  getDB()
    .collection(collection1)
    .doc(email)
    .collection(collection2)
    .add(
      {
        ...data,
      },
      { merge: true }
    )

const deleteFromDoubleCollection = async (
  collection1,
  collection2,
  email,
  docId
) =>
  getDB()
    .collection(collection1)
    .doc(email)
    .collection(collection2)
    .doc(docId)
    .delete()

const getDoubleCollectionData = async (collection1, collection2, email) =>
  getDB().collection(collection1).doc(email).collection(collection2).get()

export {
  getCollection,
  getCollectionDoc,
  getCollectionDocData,
  updateCollection,
  getCollectionData,
  addToDoubleCollection,
  deleteFromDoubleCollection,
  updateDoubleCollectionDoc,
  getDoubleCollectionData,
}
