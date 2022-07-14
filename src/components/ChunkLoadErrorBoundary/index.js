import React, { Component } from 'react'
import { consoleLogger } from 'utils/logger'

export default class ChunkLoadErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error }
  }
  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    consoleLogger('Error Boundary Caught:', error, errorInfo)
  }
  render() {
    const { error, hasError } = this.state
    if (hasError) {
      // You can render any custom fallback UI
      return (
        <>
          {error.name === 'ChunkLoadError' ? (
            <div className="container">
              <div className="row mt-2">
                <div className="col-12">
                  <div className="alert alert-secondary text-center">
                    This application has been updated, please refresh your
                    browser to see the latest content.
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </>
      )
    }
    return this.props.children
  }
}
