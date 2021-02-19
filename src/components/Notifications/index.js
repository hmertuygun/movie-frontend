import { notification } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './index.css'
notification.config({
  placement: 'bottomRight',
  bottom: 50,
  duration: 5,
})

const defaultErrorConfig = { message: 'Error', description: '', className: "notification-danger", icon: <FontAwesomeIcon icon={["fas", "exclamation-triangle"]} color="#fff" /> }
const defaultWarningConfig = { message: 'Warning', description: '', className: "notification-warning", icon: <FontAwesomeIcon icon={["fas", "exclamation-triangle"]} color="#fff" /> }
const defaultInfoConfig = { message: 'Info', description: '', className: "notification-info", icon: <FontAwesomeIcon icon={["fas", "info-circle"]} color="#fff" /> }
const defaultSuccessConfig = { message: 'Success', description: '', className: "notification-success", icon: <FontAwesomeIcon icon={["fas", "check"]} color="#fff" /> }

export const errorNotification = {
  open: (config) => {
    notification.open({ ...defaultErrorConfig, ...config })
  },
  close: (key) => { notification.close(key) }
}
export const warningNotification = {
  open: (config) => {
    notification.open({ ...defaultWarningConfig, ...config })
  },
  close: (key) => { notification.close(key) }
}
export const infoNotification = {
  open: (config) => {
    notification.open({ ...defaultInfoConfig, ...config })
  },
  close: (key) => { notification.close(key) }
}
export const successNotification = {
  open: (config) => {
    notification.open({ ...defaultSuccessConfig, ...config })
  },
  close: (key) => { notification.close(key) }
}