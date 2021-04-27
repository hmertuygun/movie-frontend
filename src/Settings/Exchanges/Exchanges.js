import React, { Fragment, useState, useContext, useEffect } from 'react'
import { ExternalLink } from 'react-feather'
import { UserContext } from '../../contexts/UserContext'
import { useSymbolContext } from '../../Trade/context/SymbolContext'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { errorNotification, successNotification, infoNotification } from '../../components/Notifications'
import { analytics } from '../../firebase/firebase'
import { Event } from '../../Tracking'
import ExchangeRow from './ExchangeRow'
import {
  getUserExchanges,
  addUserExchange,
  activateUserExchange,
  updateLastSelectedAPIKey,
  deleteUserExchange,
  validateUser
} from '../../api/api'
import QuickModal from './QuickModal'
import DeletionModal from './DeletionModal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'

const Exchanges = () => {
  const { refreshExchanges } = useSymbolContext()
  const queryClient = useQueryClient()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const { loadApiKeys, setLoadApiKeys, totalExchanges, setTotalExchanges, activeExchange, setActiveExchange } = useContext(UserContext)
  const [isDeletionModalVisible, setIsDeletionModalVisible] = useState(false)
  const [selectedExchange, setSelectedExchange] = useState(null)
  let exchanges = []
  const exchangeQuery = useQuery('exchanges', getUserExchanges)

  useEffect(() => {
    exchangeQuery.refetch()
  }, [loadApiKeys])

  if (exchangeQuery.data) {
    exchanges = exchangeQuery.data.data.apiKeys
    setTotalExchanges(exchanges)
  } else {
    exchanges = false
  }

  const addExchangeMutation = useMutation(addUserExchange, {
    onSuccess: async (res, param) => {
      if (res.status !== 200) {
        errorNotification.open({ description: res.data.detail })
        return
      }
      queryClient.invalidateQueries('exchanges')
      setIsModalVisible(false)
      successNotification.open({ description: `API key added!` })
      analytics.logEvent('api_keys_added')
      Event('user', 'api_keys_added', 'user')
      refreshExchanges()
    },
    onError: () => {
      errorNotification.open({ description: `Couldn't add API key. Please try again later!` })
    }
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
    onSuccess: async (response, param) => {
      // check exchanges var here, its not the updated one tho
      if (exchanges && exchanges.length) {
        if (exchanges.length - 1 === 0) {
          setLoadApiKeys(false)
          sessionStorage.clear()
        }
        else {
          // What if we just deleted an active exchange key, set first one as active by default
          if (selectedExchange.apiKeyName === activeExchange.apiKeyName && selectedExchange.exchange === activeExchange.exchange) {
            sessionStorage.clear()
            // ignore the element that we just deleted
            let newActiveKey = exchanges.find(item => item.apiKeyName !== selectedExchange.apiKeyName)
            if (newActiveKey) {
              await refreshExchanges()
              await updateLastSelectedAPIKey({ ...newActiveKey })
              setActiveExchange({ ...newActiveKey, label: `${newActiveKey.exchange} - ${newActiveKey.apiKeyName}`, value: `${newActiveKey.exchange} - ${newActiveKey.apiKeyName}` })
            }
          }
        }
      }
      queryClient.invalidateQueries('exchanges')
      setSelectedExchange(null)
      setIsDeletionModalVisible(false)
      successNotification.open({ description: `API key deleted!` })
      refreshExchanges()
    },
    onError: () => {
      errorNotification.open({ description: `Couldn't delete API key. Please try again later!` })
    }
  })

  const onDelete = async (name, exchange) => {
    await deleteExchangeMutation.mutate({ name, exchange })
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
          onDelete={() => onDelete(selectedExchange.apiKeyName, selectedExchange.exchange)}
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
