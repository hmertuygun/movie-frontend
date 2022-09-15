import { createAsyncThunk } from '@reduxjs/toolkit'
import httpClient from 'services/http'
import { API_URLS } from 'constants/config'
import {
  setTemplateDrawings,
  setTemplateDrawingsOpen,
  setAddTemplateModalOpen,
} from './TemplateSlice'

const updateTemplateDrawings = (data) => (dispatch) => {
  dispatch(setTemplateDrawings(data))
}
const updateTemplateDrawingsOpen = (data) => (dispatch) => {
  dispatch(setTemplateDrawingsOpen(data))
}
const updateAddTemplateModalOpen = (data) => (dispatch) => {
  dispatch(setAddTemplateModalOpen(data))
}

const templateUrl = `${API_URLS['chart']}/templates`
const saveChartTemplate = createAsyncThunk(
  'chart/saveTemplate',
  async (template) => {
    return await httpClient(templateUrl, 'POST', { data: template })
  }
)

const getChartTemplate = createAsyncThunk('chart/getTemplate', async () => {
  return await httpClient(templateUrl, 'GET')
})

const deleteChartTemplate = createAsyncThunk(
  'chart/deleteTemplate',
  async (tempId) => {
    return await httpClient(templateUrl, 'DELETE', { id: tempId })
  }
)

export {
  updateTemplateDrawings,
  updateTemplateDrawingsOpen,
  updateAddTemplateModalOpen,
  saveChartTemplate,
  getChartTemplate,
  deleteChartTemplate,
}
