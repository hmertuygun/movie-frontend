import templateSlice from './TemplateSlice'

const { setTemplateDrawings, setTemplateDrawingsOpen } = templateSlice.actions

const updateTemplateDrawings = (value) => async (dispatch) => {
  dispatch(setTemplateDrawings(value))
}

const updateTemplateDrawingsOpen = (value) => async (dispatch) => {
  dispatch(setTemplateDrawingsOpen(value))
}

export { updateTemplateDrawings, updateTemplateDrawingsOpen }
