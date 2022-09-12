import React, { useContext, useState, useEffect } from 'react'
import './style.css'
import { useHistory } from 'react-router-dom'
import { UserContext } from 'contexts/UserContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { notify } from 'reapop'
import { dismissNotice } from 'services/api'
import dayjs from 'dayjs'
import { useDispatch, useSelector } from 'react-redux'
import { consoleLogger } from 'utils/logger'
import MESSAGES from 'constants/Messages'
import { getPlatformMessages, getUserNotices } from 'store/actions'

const WarningAlert = () => {
  const history = useHistory()
  const { isLoggedIn } = useContext(UserContext)
  const [notices, setNotices] = useState([])
  const [finalNotices] = useState([])
  const { subscriptionData } = useSelector((state) => state.subscriptions)
  const { platformMessages, userNotices } = useSelector(
    (state) => state.appFlow
  )
  const dispatch = useDispatch()

  useEffect(() => {
    if (platformMessages) {
      let allNotices = platformMessages
      if (userNotices) {
        allNotices = allNotices.filter((item) => !userNotices.includes(item.id))
      }
      const filteredNotices = allNotices.filter((message) => {
        const isAfterPublish = dayjs().isAfter(dayjs(message.publishDate))
        if (!isAfterPublish) return true

        if (!message.isActive) return true

        if (message.status === 'all') return true

        if (message?.status === subscriptionData.subscription.status) {
          return true
        }
        return false
      })
      setNotices(filteredNotices)
    }
  }, [platformMessages, userNotices])

  useEffect(async () => {
    if (subscriptionData) {
      await dispatch(getUserNotices())
      dispatch(getPlatformMessages())
    }
  }, [subscriptionData])

  const getAction = (param) => {
    if (param === 'payment') {
      history.push('/settings#subscription')
    } else if (param === 'huobi') {
      window.open('https://bit.ly/3GGX17Y')
    } else if (param === 'gomarket') {
      window.open('https://bit.ly/3I1DReA')
    }
  }

  const removeNotice = async (item, index) => {
    try {
      setNotices((prev) => {
        return prev.filter((element) => element.id !== item)
      })
      await dismissNotice(item)
    } catch (e) {
      dispatch(notify(MESSAGES['dismiss-notice-error'], 'error'))
      consoleLogger(e)
    }
  }

  if (isLoggedIn) {
    if (notices.length > 0)
      return (
        <div className="px-4 m-3" role="alert">
          <div
            className={`${finalNotices.length ? 'alert-messages' : ''}`}
            style={{ margin: '0' }}
          >
            {notices.map((item, index) => (
              <div
                style={{ padding: '10px' }}
                className={`text-center my-1 alert alert-${
                  item.noticeType || 'primary'
                }`}
                key={`notice-${index}`}
              >
                <FontAwesomeIcon
                  color="white"
                  icon={`${
                    item.noticeType === 'danger'
                      ? 'times-circle'
                      : item.noticeType === 'warning'
                      ? 'exclamation-triangle'
                      : item.noticeType === 'info'
                      ? 'exclamation-circle'
                      : 'exclamation-circle'
                  }`}
                />{' '}
                {item.message}
                {item.button?.text && (
                  <span
                    className="ml-2 badge badge-primary"
                    style={{ cursor: 'pointer' }}
                    onClick={() => getAction(item.button.type)}
                  >
                    {item.button.text}
                  </span>
                )}
                {item.isDismissable && (
                  <button
                    type="button"
                    className="close"
                    onClick={() => removeNotice(item.id, index)}
                  >
                    <span>&times;</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )
  }
  return null
}

export default WarningAlert
