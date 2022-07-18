import { configureStore } from '@reduxjs/toolkit'
import storage from 'redux-persist/lib/storage'
import { persistReducer } from 'redux-persist'
import thunk from 'redux-thunk'
import logger from 'redux-logger'
import reducers from './combinedReducers'

const persistConfig = {
  key: 'root',
  storage, //It defines which are the reducers do not want to save in the persistence storage.
  blacklist: ['subscriptions', 'appFlow', 'users'],
}

const persistedReducer = persistReducer(persistConfig, reducers)
let middleware = [thunk]
if (process.env.NODE_ENV !== 'production') middleware = [...middleware, logger]
const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== 'production',
  middleware: [...middleware],
})

export default store
