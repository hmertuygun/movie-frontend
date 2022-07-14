import React, { Component } from 'react'
import { consoleLogger } from 'utils/logger'
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    consoleLogger(`Error in component: ${this.props.componentName}`)
    consoleLogger(error)
    consoleLogger(errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container">
          <div className="row mt-2">
            <div className="col-8">
              <div className="alert alert-secondary text-center">
                Please make sure your internet connection is stable. Then
                refresh the page.
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
export default ErrorBoundary
