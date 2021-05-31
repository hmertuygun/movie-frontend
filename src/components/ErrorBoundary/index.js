import React, { Component } from 'react'
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
    console.log(`Error in component: ${this.props.componentName}`)
    console.log(error)
    console.log(errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='container'>
          <div className='row mt-2'>
            <div className='col-8'>
              <div className='alert alert-info text-center'>
                Please make sure your internet connection is stable. Then refresh the page.
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