import { getSelectedExchange } from 'utils/exchangeSelection'
import { fetchTicker } from 'services/exchanges'
import { getStripeplans } from 'store/actions'
import { deleteWatchLists, fetchWatchList, updateWatchList } from 'services/api'

import {
  setMarketData,
  setShowMarketItems,
  setWatchListOpen,
  setProducts,
  clearProducts,
} from './MarketSlice'

import { createAsyncThunk } from '@reduxjs/toolkit'

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

const getWatchList = createAsyncThunk(
  'watchlist/getWatchList',
  async (email) => {
    return await fetchWatchList(email)
  }
)

const saveWatchList = createAsyncThunk(
  'watchlist/saveWatchList',
  async (data) => {
    return await updateWatchList({ data })
  }
)

const deleteWatchList = createAsyncThunk(
  'watchlist/deleteWatchList',
  async (data) => {
    return await deleteWatchLists(data)
  }
)

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
  await dispatch(getStripeplans()).then((res) => {
    dispatch(clearProducts())
    const products = []
    res.payload.data.forEach((data) => {
      const product = Object.values(data)[0]
      const id = Object.keys(data)[0]
      if (product.active) {
        product['id'] = id
        const prices = []
        if (product?.prices) {
          product.prices.forEach((values) => {
            const price = Object.values(values)[0]
            const priceId = Object.keys(values)[0]
            prices.push({
              price: parseFloat((price.unit_amount / 100).toFixed(2)),
              currency: price.currency,
              interval: price.interval,
              id: priceId,
            })
          })
          product.prices = prices
        }
        products.push(product)
      }
    })
    dispatch(updateProducts(products))
  })
}

export {
  updateMarketData,
  updateShowMarketItems,
  updateWatchListOpen,
  updateProducts,
  initMarketData,
  getProducts,
  getWatchList,
  saveWatchList,
  deleteWatchList,
}
