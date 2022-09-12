import React, { useState, useContext, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ExternalLink } from 'react-feather'
import { notify } from 'reapop'
import { ThemeContext } from 'contexts/ThemeContext'
import { useMutation, useQueryClient } from 'react-query'
import { analytics } from 'services/firebase'
import { trackEvent } from 'services/tracking'
import ExchangeRow from './ExchangeRow'
import {
  addUserExchange,
  activateUserExchange,
  deleteUserExchange,
  updateUserExchange,
} from 'services/api'
import QuickModal from './QuickModal'
import DeletionModal from './DeletionModal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { sortExchangesData } from 'utils/apiKeys'
import { Tooltip } from 'components'
import { session } from 'services/storages'
import {
  updateExchanges,
  refreshExchanges,
  updateLoadApiKeys,
  updateActiveExchange,
  updateTotalExchanges,
  getApiKeys,
  saveApiKeys,
} from 'store/actions'
import { consoleLogger } from 'utils/logger'
import MESSAGES from 'constants/Messages'
import { UserContext } from 'contexts/UserContext'

const Exchanges = () => {
  const { userData, userState } = useSelector((state) => state.users)
  const { exchanges, activeExchange } = useSelector((state) => state.exchanges)
  const { loadApiKeys } = useSelector((state) => state.apiKeys)
  const dispatch = useDispatch()

  const { theme } = useContext(ThemeContext)
  const queryClient = useQueryClient()
  const [isDeletionModalVisible, setIsDeletionModalVisible] = useState(false)
  const [selectedExchange, setSelectedExchange] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const { isLoggedIn } = useContext(UserContext)

  const getExchanges = async () => {
    setIsLoading(true)
    try {
      let apiKey = await dispatch(getApiKeys())
      apiKey = apiKey.payload.data
      setIsLoading(false)
      if (apiKey) {
        const apiKeys = sortExchangesData(apiKey)
        if (apiKeys.length !== 0) {
          dispatch(updateTotalExchanges(exchanges))
        }
      }
    } catch (e) {
      consoleLogger(e)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isLoggedIn) getExchanges()
  }, [loadApiKeys, isLoggedIn])

  const addExchange = async (formData) => {
    try {
      setIsLoading(true)
      const res = await addUserExchange(formData)
      if (res.status !== 200) {
        dispatch(notify(res.data.detail, 'error'))
        return
      }
      setIsModalVisible(false)
      setIsLoading(false)
      dispatch(notify(MESSAGES['api-key-added'], 'success'))
      analytics.logEvent('api_keys_added')
      trackEvent('user', 'api_keys_added', 'user')
      dispatch(refreshExchanges(userData))
    } catch (error) {
      consoleLogger(error)
      dispatch(notify(MESSAGES['api-key-failed'], 'error'))
    } finally {
      setIsModalVisible(false)
      setIsLoading(false)
    }
  }

  const updateExchange = async (formData) => {
    try {
      setIsLoading(true)
      const res = await updateUserExchange(formData)
      if (res.status !== 200) {
        dispatch(notify(res.data.detail, 'error'))
        return
      }
      dispatch(notify(MESSAGES['api-key-updated'], 'success'))
      analytics.logEvent('api_keys_added')
      trackEvent('user', 'api_keys_added', 'user')
      dispatch(refreshExchanges(userData))
    } catch (error) {
      dispatch(notify(MESSAGES['api-key-updated-failed'], 'error'))
    } finally {
      setIsUpdateModalVisible(false)
      setIsLoading(false)
    }
  }

  const deleteExchange = async (data) => {
    try {
      setIsLoading(true)
      const res = await deleteUserExchange(data)
      if (res.status !== 200) {
        dispatch(notify(res.data.detail, 'error'))
        setIsLoading(false)
        setIsDeletionModalVisible(false)
        return
      }
      if (exchanges && exchanges.length) {
        if (exchanges.length - 1 === 0) {
          updateLoadApiKeys(false)
          session.clear()
          dispatch(updateExchanges([]))
        } else {
          // What if we just deleted an active exchange key, set first one as active by default
          if (
            selectedExchange.apiKeyName === activeExchange.apiKeyName &&
            selectedExchange.exchange === activeExchange.exchange
          ) {
            session.clear()
            // ignore the element that we just deleted
            let newActiveKey = exchanges.find(
              (item) => item.apiKeyName !== selectedExchange.apiKeyName
            )
            if (newActiveKey) {
              dispatch(refreshExchanges(userData))
              let value = `${newActiveKey.apiKeyName}-${newActiveKey.exchange}`
              await saveApiKeys({
                activeLastSelected: value,
              })
              dispatch(
                updateActiveExchange({
                  ...newActiveKey,
                  label: `${newActiveKey.exchange} - ${newActiveKey.apiKeyName}`,
                  value: `${newActiveKey.exchange} - ${newActiveKey.apiKeyName}`,
                })
              )
            }
          }
        }
      }
      queryClient.invalidateQueries('exchanges')
      setSelectedExchange(null)
      dispatch(notify(MESSAGES['api-key-deleted'], 'success'))
      dispatch(refreshExchanges(userData))
    } catch (error) {
      consoleLogger(error)
      dispatch(notify(MESSAGES['api-key-delete-failed'], 'error'))
    } finally {
      setIsDeletionModalVisible(false)
      setIsLoading(false)
    }
  }

  const onAddExchange = async (formData) => {
    try {
      await addExchange(formData)
    } catch (error) {
      consoleLogger(error)
    }
  }

  const onUpdateExchange = async (formData) => {
    try {
      await updateExchange(formData)
    } catch (error) {
      consoleLogger(error)
    }
  }

  const onDelete = async (name, exchange) => {
    try {
      await deleteExchange({ name, exchange })
    } catch (error) {
      consoleLogger(error)
    }
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
      consoleLogger(error)
    }
  }

  return (
    <section className="slice slice-sm bg-section-secondary">
      {isModalVisible && (
        <QuickModal
          isLoading={isLoading}
          onClose={() => setIsModalVisible(false)}
          onSave={(formData) => {
            onAddExchange(formData)
          }}
        />
      )}
      {isDeletionModalVisible && (
        <DeletionModal
          isLoading={isLoading}
          onClose={() => {
            setSelectedExchange(null)
            setIsDeletionModalVisible(false)
          }}
          onDelete={() =>
            onDelete(selectedExchange.apiKeyName, selectedExchange.exchange)
          }
        />
      )}
      {isUpdateModalVisible && (
        <QuickModal
          onClose={() => {
            setSelectedExchange(null)
            setIsUpdateModalVisible(false)
          }}
          isLoading={isLoading}
          isUpdate={true}
          selectedExchange={selectedExchange}
          onSave={(formData) => {
            onUpdateExchange(formData)
          }}
        />
      )}

      <div>
        <div>
          <div className="row align-items-center mb-3">
            <div className="col">
              <h6 className="mb-0">Exchange Integrations</h6>
            </div>
            <div
              className="col-auto"
              data-for="integrate-button"
              data-tip="You need to add 2FA"
            >
              {!userState.has2FADetails ? (
                <Tooltip id="integrate-button" place="top" />
              ) : null}
              <button
                type="button"
                className={`btn btn-xs ${
                  !userState.has2FADetails ? 'btn-secondary' : 'btn-primary'
                } btn-icon rounded-pill`}
                onClick={() => {
                  setIsModalVisible(true)
                }}
                disabled={!userState.has2FADetails}
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
            style={{ color: theme === 'LIGHT' ? '#718096' : '#c0ccda' }}
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
                {!isLoading &&
                  exchanges &&
                  [...exchanges]
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
                        onUpdateClick={() => {
                          setIsUpdateModalVisible(true)
                          setSelectedExchange(row)
                        }}
                        setActive={() => setActive(row.apiKeyName)}
                        isLast={index === exchanges.length - 1}
                      />
                    ))}

                {isLoading && <div>Fetching exchanges..</div>}

                {!exchanges && !isLoading && <div>No exchange added yet.</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Exchanges
