import React, { Fragment, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { ExternalLink } from 'react-feather'
import {
  getUserExchanges,
  addUserExchange,
  activateUserExchange,
  deleteUserExchange,
} from '../../api/api'
import QuickModal from './QuickModal'
import { Icon } from '../../components'

const Exchanges = () => {
  const queryClient = useQueryClient()
  const [isModalVisible, setIsModalVisible] = useState(false)

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
                      <Icon icon="plus" />
                    </span>
                    <span className="btn-inner--text">
                      Connect New Exchange
                    </span>
                  </button>
                </div>
              </div>
            </div>
            <a
              className="mt-0 mb-2 ml-3"
              href="https://support.coinpanel.com/hc/en-us/articles/360018767359-Connecting-your-Binance-account-to-CoinPanel"
              target="_blank"
              rel="noreferrer"
              style={{ color: '#718096' }}
            >
              <ExternalLink size={16} className="mr-1" />
              <label
                className="text-sm"
                htmlFor="billing_notification"
                style={{ textDecoration: 'underline' }}
              >
                How to connect your exchange?
              </label>
            </a>

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

                    {!exchanges && !exchangeQuery.isLoading && (
                      <div>No exchange added yet.</div>
                    )}
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
        <div className="col-md-4">
          <h6 className="text-sm mb-0" style={{ textTransform: 'capitalize' }}>
            {row.exchange} - {row.apiKeyName}
          </h6>
        </div>

        <div className="col-md-4 text-center">
          <img
            src="img/svg/exchange/binance.svg"
            height="20px"
            alt="biance"
          ></img>
        </div>

        <div className="col-md-4 text-right">
          <a
            href="#"
            className="text-sm text-danger"
            onClick={() => onDelete()}
          >
            Delete
          </a>
        </div>
      </div>

      {!isLast && <hr className="my-3" />}
    </Fragment>
  )
}
