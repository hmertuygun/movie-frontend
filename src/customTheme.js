import { baseTheme } from 'reapop'

const lineHeight$2 = 1.428571429
let _colorPerStatus

const STATUSES = Object.freeze({
  none: 'none',
  info: 'info',
  success: 'success',
  loading: 'loading',
  warning: 'warning',
  error: 'error',
})

const colorPerStatus =
  ((_colorPerStatus = {}),
  (_colorPerStatus[STATUSES.none] = '#5cc9a7'),
  (_colorPerStatus[STATUSES.info] = '#008aff'),
  (_colorPerStatus[STATUSES.loading] = '#007bff'),
  (_colorPerStatus[STATUSES.success] = '#5cc9a7'),
  (_colorPerStatus[STATUSES.warning] = '#ffbe3d'),
  (_colorPerStatus[STATUSES.error] = '#f25767'),
  _colorPerStatus)

export const customTheme = {
  ...baseTheme,
  notification: function notification(_notification) {
    return {
      display: 'flex',
      width: '400px',
      height: '100%',
      position: 'relative',
      borderRadius: '6px',
      border: '1px solid rgba(0,0,0,.1)',
      boxShadow: '0 0.25rem 0.75rem rgba(0,0,0,.1)',
      zIndex: 999,
      backgroundColor: colorPerStatus[_notification.status],
      color: '#fff',
      marginBottom: '50px',
      cursor:
        _notification.dismissible && !_notification.showDismissButton
          ? 'pointer'
          : '',
    }
  },
  notificationIcon: function notificationIcon(notification) {
    return {
      display: notification.image ? 'none' : 'flex',
      width: '20px',
      height: '20px',
      boxSizing: 'border-box',
      margin: '10px 0 10px 15px',
      alignSelf: 'flex-start',
      flexShrink: 0,
      color: 'white',
    }
  },
  notificationDismissIcon: function notificationDismissIcon() {
    return {
      width: '12px',
      height: '12px',
      margin: '14px 10px',
      cursor: 'pointer',
      color: 'white',
      flexShrink: 0,
    }
  },
  notificationMeta: function notificationMeta() {
    return {
      verticalAlign: 'top',
      boxSizing: 'border-box',
      width: '100%',
      padding: '10px 20px',
    }
  },
  notificationTitle: function notificationTitle(notification) {
    return {
      margin: notification.message ? '0 0 10px' : 0,
      fontSize: '16px',
      color: 'white',
      fontWeight: 700,
      lineHeight: lineHeight$2,
    }
  },
  notificationMessage: function notificationMessage() {
    return {
      margin: 0,
      fontSize: '14px',
      color: 'white',
      lineHeight: lineHeight$2,
    }
  },
  notificationImageContainer: function notificationImageContainer() {
    return {
      boxSizing: 'border-box',
      padding: '10px 0 10px 15px',
    }
  },
  notificationImage: function notificationImage() {
    return {
      display: 'inline-flex',
      borderRadius: '40px',
      width: '40px',
      height: '40px',
      backgroundSize: 'cover',
    }
  },
  notificationButtons: function notificationButtons() {
    return {}
  },
  notificationButton: function notificationButton(
    notification,
    position,
    state
  ) {
    return {
      display: 'block',
      width: '100%',
      height: 100 / notification.buttons.length + '%',
      minHeight: '40px',
      boxSizing: 'border-box',
      padding: 0,
      background: 'none',
      border: 'none',
      borderRadius: 0,
      borderLeft: '1px solid rgba(0,0,0,.1)',
      outline: 'none',
      textAlign: 'center',
      color: state.isHovered || state.isActive ? '#007bff' : '#212529',
      cursor: 'pointer',
      borderTop: position === 1 ? '1px solid rgba(0, 0, 0, 0.09)' : 'none',
    }
  },
  notificationButtonText: function notificationButtonText() {
    return {
      display: 'block',
      height: '25px',
      padding: '0 15px',
      minWidth: '90px',
      maxWidth: '150px',
      width: 'auto',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      margin: '0 auto',
      textOverflow: 'ellipsis',
      textAlign: 'center',
      fontSize: '14px',
      lineHeight: '25px',
    }
  },
}
