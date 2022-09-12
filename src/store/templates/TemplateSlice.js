import { createSlice } from '@reduxjs/toolkit'
import {
  deleteChartTemplate,
  getChartTemplate,
  saveChartTemplate,
} from './TemplateActions'

const templateSlice = createSlice({
  name: 'templates',
  initialState: {
    templateDrawings: false,
    templateDrawingsOpen: false,
    templates: [],
  },
  reducers: {
    setTemplateDrawings: (state, action) => {
      state.templateDrawings = action.payload
    },
    setTemplateDrawingsOpen: (state, action) => {
      state.templateDrawingsOpen = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getChartTemplate.fulfilled, (state, action) => {
      const res = action.payload?.data?.data
      if (res) {
        state.templates = res.map((template, id) => {
          const key = Object.keys(template)[0]
          let { data } = template[key]
          data = { ...JSON.parse(data), refId: key }
          return data
        })
      } else state.templates = []
    })
    builder.addCase(saveChartTemplate.fulfilled, (state, action) => {})
    builder.addCase(deleteChartTemplate.fulfilled, (state, action) => {})
  },
})

export const { setTemplateDrawings, setTemplateDrawingsOpen } =
  templateSlice.actions
export default templateSlice.reducer
