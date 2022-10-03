import React, { useMemo, useCallback, useEffect, useContext } from 'react'
import { Modal } from 'components'
import { useDispatch, useSelector } from 'react-redux'
import {
  updateSetShowThemeWarning,
  updateSetChartNeedsThemeUpdate,
} from 'store/actions'
import { storage } from 'services/storages'
import { ThemeContext } from 'contexts/ThemeContext'

const ThemeWarning = ({ currentTheme }) => {
  const { setTheme } = useContext(ThemeContext)
  const dispatch = useDispatch()

  const onClose = useCallback(() => {
    dispatch(updateSetShowThemeWarning(false))
  }, [dispatch])

  const getNextTheme = useMemo(() => {
    if (currentTheme === 'LIGHT') return 'Dark'
    return 'Light'
  }, [currentTheme])

  const toggleTheme = () => {
    setTheme((theme) => {
      let newTheme = ''
      switch (theme) {
        case 'LIGHT':
          newTheme = 'DARK'
          break
        case 'DARK':
          newTheme = 'LIGHT'
          break
        default:
          newTheme = 'LIGHT'
          break
      }
      storage.set('theme', newTheme)
      addDarkClassToBody(newTheme)
      onClose()
      return newTheme
    })
  }

  const addDarkClassToBody = useCallback((theme) => {
    const element = document.body
    switch (theme) {
      case 'LIGHT':
        element.classList.remove('dark')
        break
      case 'DARK':
        element.classList.add('dark')
        break
      default:
        break
    }
  }, [])

  const submitDecision = useCallback(
    (value) => {
      dispatch(updateSetChartNeedsThemeUpdate(value))
      toggleTheme()
    },
    [toggleTheme, updateSetChartNeedsThemeUpdate, dispatch]
  )

  return (
    <Modal>
      <div className="modal-content" style={{ maxWidth: '30rem' }}>
        <div className="modal-header">
          <h5 className="modal-title" id="exampleModalLabel">
            Are you sure?
          </h5>
          <button
            type="button"
            className="close"
            data-dismiss="modal"
            aria-label="Close"
            onClick={onClose}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div className="modal-body">
          You're changing the user interface to the {getNextTheme} theme. Would
          you like to switch the chart template's theme too?
        </div>
        <div className="modal-footer">
          <button
            type="button"
            onClick={() => submitDecision(false)}
            className="btn btn-secondary"
            data-dismiss="modal"
          >
            Keep the chart's config
          </button>
          <button
            type="button"
            onClick={() => submitDecision(true)}
            className="btn btn-primary"
          >
            Set as default
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ThemeWarning
