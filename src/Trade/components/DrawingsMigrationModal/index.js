import React from 'react'
import { Modal } from '../../../components'
import { encryptData } from '../../../helpers/secureData'
import Button from '../../../components/Button/Button'
import { DownloadCloud, UploadCloud } from 'react-feather'

const DrawingsMigrationModal = ({
  chartDrawings,
  handleFileUpload,
  fileDrop,
  fileName,
  handleModalClose,
  uploadedDrawings,
  handleProceedDrawings,
  dragEnter,
  dragOver,
  dragLeave,
}) => {
  return (
    <Modal>
      <div className="modal-dialog modal-dialog-centered modal-md">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">
              Import / Export Drawings
            </h5>
          </div>
          <div className="modal-body">
            <div className="pt-2 text-center">
              <p className="pb-2 text-left">
                Export your Chart Drawings, by clicking the below button
              </p>
              <a
                href={`data:text/json;charset=utf-8,${encodeURIComponent(
                  JSON.stringify({
                    data: encryptData(chartDrawings, 'key'),
                  })
                )}`}
                download="drawings.json"
                disabled={!chartDrawings}
              >
                <Button
                  className="btn btn-primary btn-icon rounded-pill"
                  disabled={!chartDrawings}
                >
                  Export Drawings{' '}
                  <DownloadCloud className="ml-2" size="26" strokeWidth="3" />
                </Button>
              </a>
              <p className="or-text my-4">or</p>
              <input
                type="file"
                onChange={handleFileUpload}
                id="json-file-upload"
                style={{ display: 'none' }}
              />
              <p className="text-left">
                Import your Chart Drawings by upload the file below
              </p>
              <div
                className="upload-cover"
                onDrop={fileDrop}
                onDragEnter={dragEnter}
                onDragOver={dragOver}
                onDragLeave={dragLeave}
              >
                <UploadCloud size="50" strokeWidth="1" />
                <p>
                  Drag and drop, or{' '}
                  <label htmlFor="json-file-upload">Browse</label> your files
                </p>
              </div>
              {fileName && (
                <>
                  <p className=" mb-0">
                    <span className="text-primary">{fileName}</span> uploaded
                    successfully.
                  </p>
                  <p className="text-warning text-sm mb-0">
                    Warning! Clicking Proceed will overwrite your exisiting
                    chart drawings with the uploaded drawings
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button
              onClick={handleProceedDrawings}
              type="button"
              disabled={!uploadedDrawings}
              className="btn btn-sm btn-link text-primary btn-zoom--hover font-weight-600"
            >
              Proceed
            </button>
            <button
              type="button"
              className="btn btn-sm "
              onClick={handleModalClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default DrawingsMigrationModal
