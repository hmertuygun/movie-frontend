import ReactGA from 'react-ga'

export const initGA = (trackingID) => {
  if (process.env.NODE_ENV === 'production') {
    ReactGA.initialize(trackingID)
  }
}

export const PageView = () => {
  if (process.env.NODE_ENV === 'production') {
    ReactGA.pageview(window.location.pathname + window.location.search)
  }
}

/**
 * Event - Add custom tracking event.
 * @param {string} category
 * @param {string} action
 * @param {string} label
 */
export const Event = (category, action, label) => {
  if (process.env.NODE_ENV === 'production') {
    ReactGA.event({
      category: category,
      action: action,
      label: label,
    })
  }
}
