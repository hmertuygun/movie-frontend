import { createAsyncThunk } from '@reduxjs/toolkit'
import MESSAGES from 'constants/Messages'
import dayjs from 'dayjs'
import { notify } from 'reapop'
import {
  fetchAllAnalysts,
  fetchAnalystAllDrawings,
  fetchAnalystDrawings,
  fetchAnalystFlags,
  updateAnalystDrawings,
  updateAnalystFlags,
} from 'services/api'
import {
  setAllAnalysts,
  setIsAnalyst,
  setEmojis,
  setSelectEmojiPopoverOpen,
} from './AnalystsSlice'

const getAnalysts = createAsyncThunk('analysts/getAllAnalysts', async () => {
  return await fetchAllAnalysts()
})

const getAnalystDrawing = createAsyncThunk(
  'analysts/getAnalystDrawing',
  async (email) => {
    return await fetchAnalystDrawings(email)
  }
)

const getAnalystAllDrawings = createAsyncThunk(
  'analysts/getAnalystAllDrawings',
  async () => {
    return await fetchAnalystAllDrawings()
  }
)

const saveAnalystDrawing = createAsyncThunk(
  'analysts/saveAnalystDrawing',
  async (email, value) => {
    return await updateAnalystDrawings(email, {
      ...value,
      lastUpdated: dayjs().toISOString(),
    })
  }
)

const getAnalystFlags = createAsyncThunk(
  'analysts/getAnalystFlags',
  async (email) => {
    return await fetchAnalystFlags(email)
  }
)

const saveAnalystFlags = createAsyncThunk(
  'analysts/saveAnalystFlags',
  async (email, emojis, thunkAPI) => {
    const res = await updateAnalystFlags(email, {
      flags: emojis,
    })

    if (res.payload.status === 200)
      thunkAPI.dispatch(notify(MESSAGES['emoji-saved'], 'success'))
    else thunkAPI.dispatch(notify(MESSAGES['emoji-save-failed'], 'error'))
    return res
  }
)

const updateEmojis = (emojis) => async (dispatch) => {
  dispatch(setEmojis(emojis))
}

const updateSelectEmojiPopoverOpen = (value) => async (dispatch) => {
  dispatch(setSelectEmojiPopoverOpen(value))
}

const fetchAnalysts = (userData) => async (dispatch) => {
  try {
    let snapshot = await dispatch(getAnalysts())
    snapshot = snapshot.payload.data.data
    let chart_snapshot = await dispatch(getAnalystAllDrawings())
    chart_snapshot = chart_snapshot.payload.data
    const analysts = snapshot.map((doc) => {
      const key = Object.keys(doc)[0]
      if (doc[key].enabled) {
        const docItem = chart_snapshot.find(
          (item) => Object.keys(item)[0] === key
        )
        const chartKey = Object.keys(docItem)[0]
        if (docItem) {
          return {
            ...doc[key],
            id: key,
            lastUpdated: docItem[chartKey].lastUpdated,
          }
        }
      }

      return null
    })
    dispatch(setAllAnalysts(analysts))
    const checkAnalyst = analysts.find((analyst) => {
      return analyst.id === userData.email
    })
    dispatch(setIsAnalyst(!!checkAnalyst))
  } catch (error) {
    console.log(error)
  }
}

export {
  fetchAnalysts,
  getAnalysts,
  getAnalystAllDrawings,
  getAnalystDrawing,
  saveAnalystDrawing,
  getAnalystFlags,
  saveAnalystFlags,
  updateEmojis,
  updateSelectEmojiPopoverOpen,
}
