import React, { Fragment, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import {
  getUserExchanges,
  addUserExchange,
  activateUserExchange,
  deleteUserExchange,
} from '../../api/api'
import QuickModal from './QuickModal'
// get our fontawesome imports
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Exchanges = () => {
  const queryClient = useQueryClient()
  const [isModalVisible, setIsModalVisible] = useState(false)

  const exchangeQuery = useQuery('exchanges', getUserExchanges)

  let exchanges = []

  if (exchangeQuery.data) {
    exchanges = exchangeQuery.data.data.apiKeys
  }

  const addExchangeMutation = useMutation(addUserExchange, {
    onSuccess: () => {
      queryClient.invalidateQueries('exchanges')
      setIsModalVisible(false)
    },
  })

  const onAddExchange = async ({ apiKey, exchange, secret }) => {
    try {
      await addExchangeMutation.mutate({
        apiKey,
        secret,
        exchange,
      })
    } catch (error) {
      console.error(error)
    }
  }

  const deleteExchangeMutation = useMutation(deleteUserExchange, {
    onSuccess: () => {
      queryClient.invalidateQueries('exchanges')
    },
  })

  const onDelete = async (name) => {
    await deleteExchangeMutation.mutate(name)
  }

  const setActiveMutation = useMutation(activateUserExchange, {
    onSuccess: () => {
      queryClient.invalidateQueries('exchanges')
    },
  })

  const setActive = async (name) => {
    try {
      await setActiveMutation.mutate(name)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <section className="slice slice-sm bg-section-secondary">
      {isModalVisible && (
        <QuickModal
          isLoading={addExchangeMutation.isLoading || exchangeQuery.isLoading}
          onClose={() => setIsModalVisible(false)}
          onSave={(formData) => {
            onAddExchange(formData)
          }}
        />
      )}

      <div className="container">
        <div className="justify-content-center">
          <div className="">
            <div>
              <div className="row align-items-center mb-3">
                <div className="col">
                  <h6 className="mb-0">Exchange Integrations</h6>
                </div>
                <div className="col-auto">
                  <button
                    type="button"
                    className="btn btn-xs btn-primary btn-icon rounded-pill"
                    onClick={() => {
                      setIsModalVisible(true)
                    }}
                  >
                    <span className="btn-inner--icon">
                      <FontAwesomeIcon icon={faPlus} />
                    </span>
                    <span className="btn-inner--text">
                      Connect New Exchange
                    </span>
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-0 mb-2 ml-3">
              <i data-feather="external-link" className="mr-1"></i>
              <label
                className="text-sm"
                htmlFor="billing_notification"
                style={{ textDecoration: 'underline' }}
              >
                How to connect your exchange?
              </label>
            </div>

            <div className="row">
              <div className="col-xl-12">
                <div className="card card-fluid">
                  <div className="card-body">
                    {!exchangeQuery.isLoading &&
                      exchanges &&
                      exchanges.map((row, index) => (
                        <ExhangeRow
                          key={index}
                          row={row}
                          index={index}
                          onDelete={() => onDelete(row.apiKeyName)}
                          setActive={() => setActive(row.apiKeyName)}
                          isLast={index === exchanges.length - 1}
                        />
                      ))}

                    {exchangeQuery.isLoading && <div>Fetching exchanges..</div>}

                    {!exchanges && <div>No exchange added yet.</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Exchanges

const ExhangeRow = ({ row, onDelete, setActive, index, isLast }) => {
  return (
    <Fragment>
      <div className="row align-items-center">
        <div className="col">
          <h6 className="text-sm mb-0">
            {row.exchange} - {row.apiKeyName}
          </h6>
        </div>

        {row.isActive && (
          <div className="col-auto">
            <span className="text-sm">Active</span>
          </div>
        )}

        <div className="col-auto">
          {!row.isActive && (
            <button
              className="btn btn-link text-sm text-warning"
              onClick={() => {
                setActive(index)
              }}
            >
              Activate
            </button>
          )}

          {!row.isActive && (
            <button className="btn btn-link" onClick={() => onDelete()}>
              <span className="text-sm text-danger">Delete</span>
            </button>
          )}
        </div>
      </div>

      {!isLast && <hr className="my-3" />}
    </Fragment>
  )
}
