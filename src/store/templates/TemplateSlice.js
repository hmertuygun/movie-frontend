import { createSlice } from '@reduxjs/toolkit'

const templateSlice = createSlice({
  name: 'templates',
  initialState: {
    templateDrawings: false,
    templateDrawingsOpen: false,
  },
  reducers: {
    setTemplateDrawings: (state, action) => {
      state.templateDrawings = action.payload
    },
    setTemplateDrawingsOpen: (state, action) => {
      state.templateDrawingsOpen = action.payload
    },
  },
})

export default templateSlice
