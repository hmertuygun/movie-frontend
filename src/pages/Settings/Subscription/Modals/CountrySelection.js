import React from 'react'
import { Modal } from 'components'
import { AlertTriangle } from 'react-feather'

const CountrySelectionModal = ({
  handleClickConfirm,
  handleClickCancel,
  isLoading,
}) => {
  return (
    <Modal>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-body">
            <div className="pt-5 text-center">
              <div className="icon text-warning custom-icon-container">
                <AlertTriangle size={16} strokeWidth={3} />
              </div>
              <h4 className="h5 mt-2 mb-3">Attention CoinPaneler</h4>
              <h4 className="h5 mb-2">Your country of residency</h4>
              <p>
                For regulatory purposes we must ask you to register your country
                of residency. Please make sure to choose correctly, as it is not
                possible to change. Are you sure?
              </p>
            </div>
          </div>
          <div className="modal-footer">
            <button
              onClick={handleClickConfirm}
              type="button"
              className="btn btn-sm btn-link text-warning btn-zoom--hover font-weight-600"
            >
              {isLoading ? (
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                />
              ) : (
                'Yes'
              )}
            </button>
            <button
              type="button"
              className="btn btn-sm "
              onClick={handleClickCancel}
            >
              No
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default CountrySelectionModal
