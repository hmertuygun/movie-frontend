import React, { useState, useEffect } from 'react'

const QuickModal = ({ onClose, onSave, isLoading, isVisible }) => {
  const [secret, setSecret] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [exchange, setExchange] = useState('')
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    const isValid =
      secret.length > 1 && apiKey.length > 1 && exchange.length > 1
    setIsValid(isValid)
  }, [secret, apiKey, exchange])

  return (
    <div className="modal-open">
      <div
        className="modal fade show"
        tabindex="-1"
        role="dialog"
        aria-labelledby="exampleModalLabel"
        aria-modal="true"
        style={{ display: 'block' }}
      >
        <div
          className="modal-dialog modal-dialog-centered modal-lg"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                <i data-feather="key" style={{ marginRight: '15px' }}></i>
                Connect new exchange
              </h5>
              <button
                onClick={onClose}
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  onSave({ secret, exchange, apiKey })
                }}
              >
                <div className="form-group">
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text" id="basic-addon1">
                        Exchange
                      </span>
                    </div>
                    <input
                      type="text"
                      minLength="3"
                      required
                      className="form-control"
                      value={exchange}
                      onChange={(event) => setExchange(event.target.value)}
                      placeholder="Exchange"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text" id="basic-addon1">
                        Key
                      </span>
                    </div>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="API Key"
                      value={apiKey}
                      minLength="3"
                      onChange={(event) => setApiKey(event.target.value)}
                      required
                      aria-label="apikey"
                      aria-describedby="basic-addon1"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text" id="basic-addon1">
                        Secret
                      </span>
                    </div>
                    <input
                      type="text"
                      required
                      className="form-control"
                      value={secret}
                      minLength="3"
                      onChange={(event) => setSecret(event.target.value)}
                      placeholder="Exchange"
                    />
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-dismiss="modal"
                onClick={onClose}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuickModal
