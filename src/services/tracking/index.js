import ReactGA from 'react-ga'

const isProduction = process.env.NODE_ENV === 'production'

const initTracking = (trackingID) => {
  if (isProduction) ReactGA.initialize(trackingID)
}

const trackPageView = () => {
  if (isProduction)
    ReactGA.pageview(window.location.pathname + window.location.search)
}

const trackEvent = (category, action, label) => {
  if (isProduction)
    ReactGA.event({
      category: category,
      action: action,
      label: label,
    })
}

//Facebook pixel tracking
const fbPixelTracking = (label) => {
  if (isProduction) window.fbq('track', label)
}

export { initTracking, trackPageView, trackEvent, fbPixelTracking }
