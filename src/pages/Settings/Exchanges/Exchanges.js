import React, { useState, useContext, useEffect } from 'react'
import { ExternalLink } from 'react-feather'
import { useNotifications } from 'reapop'
import { ThemeContext } from 'contexts/ThemeContext'
import { UserContext } from 'contexts/UserContext'
import { useSymbolContext } from 'contexts/SymbolContext'
import { useMutation, useQueryClient } from 'react-query'
import { analytics } from 'services/firebase'
import { trackEvent } from 'services/tracking'
import ExchangeRow from './ExchangeRow'
import {
  addUserExchange,
  activateUserExchange,
  deleteUserExchange,
  updateUserExchange,
  getFirestoreDocumentData,
  updateLastSelectedValue,
} from 'services/api'
import QuickModal from './QuickModal'
import DeletionModal from './DeletionModal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { sortExchangesData } from 'utils/apiKeys'
import { Tooltip } from 'components'
import { session } from 'services/storages'

const Exchanges = () => {
  const { refreshExchanges, exchanges, setExchanges } = useSymbolContext()
  const {
    loadApiKeys,
    setLoadApiKeys,
    setTotalExchanges,
    activeExchange,
    setActiveExchange,
    userData,
    state,
  } = useContext(UserContext)
  const { theme } = useContext(ThemeContext)
  const queryClient = useQueryClient()
  const { notify } = useNotifications()
  const [isDeletionModalVisible, setIsDeletionModalVisible] = useState(false)
  const [selectedExchange, setSelectedExchange] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)

  const getExchanges = () => {
    setIsLoading(true)
    try {
      getFirestoreDocumentData('apiKeyIDs', userData.email).then(
        (apiKey) => {
          setIsLoading(false)
          if (apiKey.data()) {
            let apiKeys = sortExchangesData(apiKey.data())
            if (apiKeys.length !== 0) {
              setTotalExchanges(exchanges)
            }
          }
        },
        (error) => {
          console.log(error)
          setIsLoading(false)
        }
      )
    } catch (e) {
      console.log(e)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getExchanges()
  }, [loadApiKeys])

  const addExchange = async (formData) => {
    try {
      setIsLoading(true)
      const res = await addUserExchange(formData)
      if (res.status !== 200) {
        notify({
          status: 'error',
          title: 'Error',
          message: res.data.detail,
        })
        return
      }
      setIsModalVisible(false)
      setIsLoading(false)
      notify({
        status: 'success',
        title: 'Success',
        message: 'API key added!',
      })
      analytics.logEvent('api_keys_added')
      trackEvent('user', 'api_keys_added', 'user')
      refreshExchanges()
    } catch (error) {
      console.log(error)
      notify({
        status: 'error',
        title: 'Error',
        message: "Couldn't add API key. Please try again later!",
      })
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
        notify({
          status: 'error',
          title: 'Error',
          message: res.data.detail,
        })
        return
      }
      notify({
        status: 'success',
        title: 'Success',
        message: 'API key updated!',
      })
      analytics.logEvent('api_keys_added')
      trackEvent('user', 'api_keys_added', 'user')
      refreshExchanges()
    } catch (error) {
      notify({
        status: 'error',
        title: 'Error',
        message: "Couldn't update API key. Please try again later!",
      })
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
        notify({
          status: 'error',
          title: 'Error',
          message: res.data.detail,
        })
        setIsLoading(false)
        setIsDeletionModalVisible(false)
        return
      }
      if (exchanges && exchanges.length) {
        if (exchanges.length - 1 === 0) {
          setLoadApiKeys(false)
          session.clear()
          setExchanges([])
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
              await refreshExchanges()
              let value = `${newActiveKey.apiKeyName}__${newActiveKey.exchange}`
              await updateLastSelectedValue(userData.email, value)
              setActiveExchange({
                ...newActiveKey,
                label: `${newActiveKey.exchange} - ${newActiveKey.apiKeyName}`,
                value: `${newActiveKey.exchange} - ${newActiveKey.apiKeyName}`,
              })
            }
          }
        }
      }
      queryClient.invalidateQueries('exchanges')
      setSelectedExchange(null)
      notify({
        status: 'success',
        title: 'Success',
        message: 'API key deleted!',
      })
      refreshExchanges()
    } catch (error) {
      console.log(error)
      notify({
        status: 'error',
        title: 'Error',
        message: "Couldn't delete API key. Please try again later!",
      })
    } finally {
      setIsDeletionModalVisible(false)
      setIsLoading(false)
    }
  }

  const onAddExchange = async (formData) => {
    try {
      await addExchange(formData)
    } catch (error) {
      console.error(error)
    }
  }

  const onUpdateExchange = async (formData) => {
    try {
      await updateExchange(formData)
    } catch (error) {
      console.error(error)
    }
  }

  const onDelete = async (name, exchange) => {
    try {
      await deleteExchange({ name, exchange })
    } catch (error) {
      console.error(error)
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
      console.error(error)
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
              {!state.has2FADetails ? (
                <Tooltip id="integrate-button" place="top" />
              ) : null}
              <button
                type="button"
                className={`btn btn-xs ${
                  !state.has2FADetails ? 'btn-secondary' : 'btn-primary'
                } btn-icon rounded-pill`}
                onClick={() => {
                  setIsModalVisible(true)
                }}
                disabled={!state.has2FADetails}
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