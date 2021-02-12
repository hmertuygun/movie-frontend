import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { ExternalLink } from 'react-feather'
import { analytics } from '../../firebase/firebase'
import ExchangeRow from './ExchangeRow'
import {
  getUserExchanges,
  addUserExchange,
  activateUserExchange,
  deleteUserExchange,
} from '../../api/api'
import QuickModal from './QuickModal'
import DeletionModal from './DeletionModal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'

const Exchanges = () => {
  const queryClient = useQueryClient()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isDeletionModalVisible, setIsDeletionModalVisible] = useState(false)
  const [selectedExchange, setSelectedExchange] = useState(null)

  const exchangeQuery = useQuery('exchanges', getUserExchanges)

  let exchanges = []

  if (exchangeQuery.data) {
    exchanges = exchangeQuery.data.data.apiKeys
  } else {
    exchanges = false
  }

  const addExchangeMutation = useMutation(addUserExchange, {
    onSuccess: () => {
      queryClient.invalidateQueries('exchanges')
      setIsModalVisible(false)
      analytics.logEvent('api_keys_added')
    },
  })

  const onAddExchange = async ({ name, apiKey, exchange, secret }) => {
    try {
      await addExchangeMutation.mutate({
        apiKey,
        name,
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
      setSelectedExchange(null)
      setIsDeletionModalVisible(false)
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
          isLoading={addExchangeMutation.isLoading}
          onClose={() => setIsModalVisible(false)}
          onSave={(formData) => {
            onAddExchange(formData)
          }}
        />
      )}
      {isDeletionModalVisible && (
        <DeletionModal
          isLoading={deleteExchangeMutation.isLoading}
          onClose={() => {
            setSelectedExchange(null)
            setIsDeletionModalVisible(false)
          }}
          onDelete={() => onDelete(selectedExchange.apiKeyName)}
        />
      )}

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
                <span className="btn-inner--text">Connect New Exchange</span>
              </button>
            </div>
          </div>
        </div>
        <p className="mb-2">
          <a
            className="mt-0 ml-3"
            href="https://support.coinpanel.com/hc/en-us/articles/360018767359-Connecting-your-Binance-account-to-CoinPanel"
            target="_blank"
            rel="noreferrer"
            style={{ color: '#718096' }}
          >
            <ExternalLink size={16} className="mr-1" />
            <label
              className="text-sm"
              htmlFor="billing_notification"
              style={{ textDecoration: 'underline', cursor: 'pointer' }}
            >
              How to connect your exchange?
            </label>
          </a>
        </p>

        <div className="row">
          <div className="col-xl-12">
            <div className="card card-fluid">
              <div className="card-body">
                {!exchangeQuery.isLoading &&
                  exchanges &&
                  exchanges
                    .sort((a, b) => {
                      if (a.apiKeyName < b.apiKeyName) {
                        return -1
                      }
                      if (a.apiKeyName > b.apiKeyName) {
                        return 1
                      }
                      return 0
                    })
                    .map((row, index) => (
                      <ExchangeRow
                        key={index}
                        row={row}
                        index={index}
                        onDeleteClick={() => {
                          setSelectedExchange(row)
                          setIsDeletionModalVisible(true)
                        }}
                        setActive={() => setActive(row.apiKeyName)}
                        isLast={index === exchanges.length - 1}
                      />
                    ))}

                {exchangeQuery.isLoading && <div>Fetching exchanges..</div>}

                {!exchanges && !exchangeQuery.isLoading && (
                  <div>No exchange added yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Exchanges
