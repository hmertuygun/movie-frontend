import React, { Fragment } from 'react'

const Settings = () => {
  return (
    <Fragment>
      <section class="pt-5 bg-section-secondary">
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-lg-9">
              <div class="row align-items-center">
                <div class="col">
                  <span class="surtitle">Your account</span>

                  <h1 class="h2 mb-0">Settings</h1>
                </div>
              </div>
              <div class="row align-items-center mt-4">
                <div class="col">
                  <ul class="nav nav-tabs overflow-x">
                    <li class="nav-item">
                      <a href="exchanges.html" class="nav-link active">
                        Exchanges
                      </a>
                    </li>
                    <li class="nav-item">
                      <a href="subcsription.html" class="nav-link ">
                        Subscription &amp; Billing
                      </a>
                    </li>

                    <li class="nav-item">
                      <a href="security.html" class="nav-link">
                        Security
                      </a>
                    </li>

                    <li class="nav-item">
                      <a href="notifications.html" class="nav-link">
                        Notifications
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="slice slice-sm bg-section-secondary">
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-lg-9">
              <div>
                <div class="row align-items-center mb-3">
                  <div class="col">
                    <h6 class="mb-0">Exchange Integrations</h6>
                  </div>
                  <div class="col-auto">
                    <button
                      type="button"
                      class="btn btn-xs btn-primary btn-icon rounded-pill"
                      data-toggle="modal"
                      data-target="#exampleModal"
                    >
                      <span class="btn-inner--icon">
                        <i class="fas fa-plus"></i>
                      </span>
                      <span class="btn-inner--text">Connect New Exchange</span>
                    </button>

                    <div
                      class="modal fade"
                      id="exampleModal"
                      tabindex="-1"
                      role="dialog"
                      aria-labelledby="exampleModalLabel"
                      aria-hidden="true"
                    >
                      <div
                        class="modal-dialog modal-dialog-centered modal-lg"
                        role="document"
                      >
                        <div class="modal-content">
                          <div class="modal-header">
                            <h5 class="modal-title" id="exampleModalLabel">
                              <i
                                data-feather="key"
                                style={{ marginRight: '15px' }}
                              ></i>
                              Connect new exchange
                            </h5>
                            <button
                              type="button"
                              class="close"
                              data-dismiss="modal"
                              aria-label="Close"
                            >
                              <span aria-hidden="true">&times;</span>
                            </button>
                          </div>
                          <div class="modal-body">
                            <div class="mb-3">
                              <a
                                class=""
                                style={{ textDecoration: 'underline' }}
                              >
                                How to find my API keys?
                              </a>
                            </div>
                            <div class="dropdown mb-3">
                              <button
                                class="btn btn-secondary dropdown-toggle"
                                type="button"
                                id="dropdownMenuButton"
                                data-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="false"
                              >
                                Choose Exchange
                              </button>
                              <div
                                class="dropdown-menu"
                                aria-labelledby="dropdownMenuButton"
                              >
                                <a class="dropdown-item" href="#">
                                  Action
                                </a>
                                <a class="dropdown-item" href="#">
                                  Another action
                                </a>
                                <a class="dropdown-item" href="#">
                                  Something else here
                                </a>
                              </div>
                            </div>
                            <div class="form-group">
                              <div class="input-group">
                                <div class="input-group-prepend">
                                  <span
                                    class="input-group-text"
                                    id="basic-addon1"
                                  >
                                    Key
                                  </span>
                                </div>
                                <input
                                  type="text"
                                  class="form-control"
                                  placeholder="Username"
                                  aria-label="Username"
                                  aria-describedby="basic-addon1"
                                />
                              </div>
                            </div>
                            <div class="form-group">
                              <div class="input-group">
                                <div class="input-group-prepend">
                                  <span
                                    class="input-group-text"
                                    id="basic-addon1"
                                  >
                                    Secret
                                  </span>
                                </div>
                                <input
                                  type="text"
                                  class="form-control"
                                  placeholder="Username"
                                  aria-label="Username"
                                  aria-describedby="basic-addon1"
                                />
                              </div>
                            </div>
                          </div>
                          <div class="modal-footer">
                            <button
                              type="button"
                              class="btn btn-secondary"
                              data-dismiss="modal"
                            >
                              Cancel
                            </button>
                            <button type="button" class="btn btn-primary">
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="mt-0 mb-2 ml-3">
                <i data-feather="external-link" class="mr-1"></i>
                <label
                  class="text-sm"
                  for="billing_notification"
                  style={{ textDecoration: 'underline' }}
                >
                  How to connect your exchange?
                </label>
              </div>

              <div class="row">
                <div class="col-xl-12">
                  <div class="card card-fluid">
                    <div class="card-body">
                      <div class="row align-items-center">
                        <div class="col">
                          <h6 class="text-sm mb-0">Binance 1</h6>
                        </div>
                        <div class="col-auto">
                          <span class="text-sm text-danger">Delete</span>
                        </div>
                      </div>
                      <hr class="my-3" />

                      <div class="row align-items-center">
                        <div class="col">
                          <h6 class="text-sm mb-0">Binance 2</h6>
                        </div>
                        <div class="col-auto">
                          <a href="#" class="text-sm">
                            Reconnect
                          </a>
                        </div>
                      </div>

                      <hr class="my-3" />

                      <div class="row align-items-center">
                        <div class="col">
                          <h6 class="text-sm mb-0">Bittrex 2</h6>
                        </div>
                        <div class="col-auto">
                          <span class="text-sm text-danger">Delete</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Fragment>
  )
}

export default Settings
