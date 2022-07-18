import marketSlice from './MarketSlice'
import { getSelectedExchange } from 'utils/exchangeSelection'
import { fetchTicker } from 'services/exchanges'
import { getFirestoreCollectionData } from 'services/api'

const {
  setMarketData,
  setShowMarketItems,
  setWatchListOpen,
  setProducts,
  clearProducts,
} = marketSlice.actions

const updateMarketData = (value) => async (dispatch) => {
  dispatch(setMarketData(value))
}

const updateShowMarketItems = (value) => async (dispatch) => {
  dispatch(setShowMarketItems(value))
}

const updateWatchListOpen = (value) => async (dispatch) => {
  dispatch(setWatchListOpen(value))
}

const updateProducts = (value) => async (dispatch) => {
  dispatch(setProducts(value))
}

const initMarketData = (symbol, activeExchange) => async (dispatch) => {
  let activeMarketData = {}
  await new Promise((resolve) => setTimeout(resolve, 1000))
  const exchange = await getSelectedExchange(activeExchange?.exchange)
  if (exchange) {
    try {
      activeMarketData = await fetchTicker(exchange, symbol)
      dispatch(updateMarketData(activeMarketData))
    } catch (error) {
      console.log(error)
    }
  }
}

const getProducts = () => async (dispatch) => {
  await getFirestoreCollectionData('stripe_plans', true).then(
    async (querySnapshot) => {
      dispatch(clearProducts())
      querySnapshot.forEach(async (doc) => {
        const priceSnap = await doc.ref
          .collection('prices')
          .where('active', '==', true)
          .orderBy('unit_amount')
          .get()
        const productData = doc.data()
        productData['id'] = doc.id
        productData['prices'] = []
        priceSnap.docs.forEach(async (doc) => {
          const priceId = doc.id
          const priceData = doc.data()

          productData.prices.push({
            price: (priceData.unit_amount / 100).toFixed(2),
            currency: priceData.currency,
            interval: priceData.interval,
            id: priceId,
          })
        })
        dispatch(updateProducts(productData))
      })
    }
  )
}

export {
  updateMarketData,
  updateShowMarketItems,
  updateWatchListOpen,
  updateProducts,
  initMarketData,
  getProducts,
}
