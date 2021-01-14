import React, { useState, useEffect } from 'react'

const QuickModal = ({ onClose, onSave, isLoading, isVisible }) => {
  const [exchange, setExchange] = useState('binance')
  const [apiName, setApiName] = useState('')
  const [apiKey, setApiKey] = useState('')

  const [secret, setSecret] = useState('')
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
        role="dialog"
        aria-labelledby="exampleModalLabel"
        aria-modal="true"
        style={{ display: 'block' }}
      >
        <form
          className="modal-dialog modal-dialog-centered modal-lg"
          role="document"
          onSubmit={(event) => {
            event.preventDefault()
            onSave({ secret, apiKey, exchange, name: apiName })
          }}
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
                    disabled
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
                      Name
                    </span>
                  </div>
                  <input
                    type="text"
                    minLength="3"
                    required
                    disabled={isLoading}
                    className="form-control"
                    value={apiName}
                    onChange={(event) => setApiName(event.target.value)}
                    placeholder="Name"
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
                    disabled={isLoading}
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
                    disabled={isLoading}
                    className="form-control"
                    value={secret}
                    minLength="3"
                    onChange={(event) => setSecret(event.target.value)}
                    placeholder="Secret"
                  />
                </div>
              </div>
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

              <button
                disabled={!isValid || isLoading}
                type="submit"
                className="btn btn-primary"
              >
                {!isLoading ? (
                  'Save'
                ) : (
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  />
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default QuickModal
