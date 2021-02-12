import { notification } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './index.css'
notification.config({
  placement: 'bottomRight',
  bottom: 50,
  duration: 0,
})

const defaultErrorConfig = { message: 'Error', className: "notification-danger", icon: <FontAwesomeIcon icon={["fas", "exclamation-triangle"]} /> }
const defaultWarningConfig = { message: 'Warning', className: "notification-warning", icon: <FontAwesomeIcon icon={["fas", "exclamation-triangle"]} /> }
const defaultInfoConfig = { message: 'Info', className: "notification-info", icon: <FontAwesomeIcon icon={["fas", "info-circle"]} /> }
const defaultSuccessConfig = { message: 'Success', className: "notification-success", icon: <FontAwesomeIcon icon={["fas", "check"]} /> }

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