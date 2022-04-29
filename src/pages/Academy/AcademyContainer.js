import React, { useState } from 'react'

function AcademyContainer() {
  const [isReady] = useState(false)

  return (
    <>
      {isReady ? (
        <section class="slice py-5 bg-section-secondary">
          <div class="container">
            <div class="row">
              <div class="col-md-3">
                <div class="mb-4">
                  <h5 class="mb-0 mb-md-3">Categories</h5>
                  <ul class="nav nav-menu overflow-x flex-nowrap flex-md-column mx-n2">
                    <li class="nav-item px-2">
                      <a href="#" class="nav-link">
                        Accounting
                      </a>
                    </li>
                    <li class="nav-item px-2">
                      <a href="# " class="nav-link">
                        Communication
                      </a>
                    </li>
                    <li class="nav-item px-2">
                      <a href="#" class="nav-link">
                        Finance
                      </a>
                    </li>
                    <li class="nav-item px-2">
                      <a href="#" class="nav-link">
                        CRM and Sales
                      </a>
                    </li>
                    <li class="nav-item px-2">
                      <a href="#" class="nav-link">
                        Customer support
                      </a>
                    </li>
                    <li class="nav-item px-2">
                      <a href="#" class="nav-link">
                        Design and Creativity
                      </a>
                    </li>
                    <li class="nav-item px-2">
                      <a href="#" class="nav-link">
                        E-commerce and Shopping
                      </a>
                    </li>
                    <li class="nav-item px-2">
                      <a href="#" class="nav-link">
                        File sharing
                      </a>
                    </li>
                    <li class="nav-item px-2">
                      <a href="#" class="nav-link">
                        Developer tools
                      </a>
                    </li>
                    <li class="nav-item px-2">
                      <a href="#" class="nav-link">
                        Legal and HR
                      </a>
                    </li>
                    <li class="nav-item px-2">
                      <a href="#" class="nav-link">
                        Marketing and Analitycs
                      </a>
                    </li>
                    <li class="nav-item px-2">
                      <a href="#" class="nav-link">
                        Music and Art
                      </a>
                    </li>
                    <li class="nav-item px-2">
                      <a href="#" class="nav-link">
                        Video and Entertainment
                      </a>
                    </li>
                    <li class="nav-item px-2">
                      <a href="#" class="nav-link">
                        News and Politics
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="col-md-9">
                <div class="row align-items-center mb-4">
                  <div class="col">
                    <h1 class="h5 mb-0">Videos</h1>
                  </div>
                  <div class="col-auto">
                    <button
                      type="button"
                      class="btn btn-sm btn-warning btn-icon"
                    >
                      <span class="btn-inner--text">Search</span>{' '}
                      <span class="btn-inner--icon">
                        <i data-feather="plus"></i>
                      </span>
                    </button>
                  </div>
                </div>
                <div class="row mx-n2">
                  <div class="col-sm-6 col-lg-6 px-2">
                    <div class="card hover-translate-y-n3 hover-shadow-lg overflow-hidden">
                      <div class="position-relative overflow-hidden">
                        <a href="#" class="d-block">
                          <img
                            alt="Image placeholder"
                            src="https://preview.webpixels.io/quick-website-ui-kit/assets/img/theme/light/blog-2-800x600.jpg"
                            class="card-img-top"
                          />
                        </a>
                      </div>
                      <div class="card-body py-4">
                        <small class="d-block text-sm mb-2">
                          25 April, 2020
                        </small>
                        <a href="#" class="h5 stretched-link lh-150">
                          How to find the right design for your specific product
                        </a>
                        <p class="mt-3 mb-0 lh-170">
                          No matter what he does, every person on earth plays a
                          central role in the history.
                        </p>
                      </div>
                      <div class="card-footer border-0 delimiter-top">
                        <div class="row align-items-center">
                          <div class="col-auto">
                            <span class="avatar avatar-sm bg-primary rounded-circle">
                              JD
                            </span>
                            <span class="text-sm mb-0 avatar-content">
                              David Wally
                            </span>
                          </div>
                          <div class="col text-right text-right">
                            <div class="actions">
                              <a href="#" class="action-item">
                                <i data-feather="heart" class="mr-1"></i> 50
                                like
                              </a>
                              <a href="#" class="action-item">
                                <i data-feather="eye" class=" mr-1"></i> 250
                                comment
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-sm-6 col-lg-6 px-2">
                    <div class="card hover-translate-y-n3 hover-shadow-lg overflow-hidden">
                      <div class="position-relative overflow-hidden">
                        <a href="#" class="d-block">
                          <img
                            alt="Image placeholder"
                            src="https://preview.webpixels.io/quick-website-ui-kit/assets/img/theme/light/blog-2-800x600.jpg"
                            class="card-img-top"
                          />
                        </a>
                      </div>
                      <div class="card-body py-4">
                        <small class="d-block text-sm mb-2">
                          25 April, 2020
                        </small>
                        <a href="#" class="h5 stretched-link lh-150">
                          How to find the right design for your specific product
                        </a>
                        <p class="mt-3 mb-0 lh-170">
                          No matter what he does, every person on earth plays a
                          central role in the history.
                        </p>
                      </div>
                      <div class="card-footer border-0 delimiter-top">
                        <div class="row align-items-center">
                          <div class="col-auto">
                            <span class="avatar avatar-sm bg-primary rounded-circle">
                              JD
                            </span>
                            <span class="text-sm mb-0 avatar-content">
                              David Wally
                            </span>
                          </div>
                          <div class="col text-right text-right">
                            <div class="actions">
                              <a href="#" class="action-item">
                                <i data-feather="heart" class="mr-1"></i> 50
                              </a>
                              <a href="#" class="action-item">
                                <i data-feather="eye" class=" mr-1"></i> 250
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-sm-6 col-lg-6 px-2">
                    <div class="card hover-translate-y-n3 hover-shadow-lg overflow-hidden">
                      <div class="position-relative overflow-hidden">
                        <a href="#" class="d-block">
                          <img
                            alt="Image placeholder"
                            src="https://preview.webpixels.io/quick-website-ui-kit/assets/img/theme/light/blog-2-800x600.jpg"
                            class="card-img-top"
                          />
                        </a>
                      </div>
                      <div class="card-body py-4">
                        <small class="d-block text-sm mb-2">
                          25 April, 2020
                        </small>
                        <a href="#" class="h5 stretched-link lh-150">
                          How to find the right design for your specific product
                        </a>
                        <p class="mt-3 mb-0 lh-170">
                          No matter what he does, every person on earth plays a
                          central role in the history.
                        </p>
                      </div>
                      <div class="card-footer border-0 delimiter-top">
                        <div class="row align-items-center">
                          <div class="col-auto">
                            <span class="avatar avatar-sm bg-primary rounded-circle">
                              JD
                            </span>
                            <span class="text-sm mb-0 avatar-content">
                              David Wally
                            </span>
                          </div>
                          <div class="col text-right text-right">
                            <div class="actions">
                              <a href="#" class="action-item">
                                <i data-feather="heart" class="mr-1"></i> 50
                              </a>
                              <a href="#" class="action-item">
                                <i data-feather="eye" class=" mr-1"></i> 250
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-sm-6 col-lg-6 px-2">
                    <div class="card hover-translate-y-n3 hover-shadow-lg overflow-hidden">
                      <div class="position-relative overflow-hidden">
                        <a href="#" class="d-block">
                          <img
                            alt="Image placeholder"
                            src="https://preview.webpixels.io/quick-website-ui-kit/assets/img/theme/light/blog-2-800x600.jpg"
                            class="card-img-top"
                          />
                        </a>
                      </div>
                      <div class="card-body py-4">
                        <small class="d-block text-sm mb-2">
                          25 April, 2020
                        </small>
                        <a href="#" class="h5 stretched-link lh-150">
                          How to find the right design for your specific product
                        </a>
                        <p class="mt-3 mb-0 lh-170">
                          No matter what he does, every person on earth plays a
                          central role in the history.
                        </p>
                      </div>
                      <div class="card-footer border-0 delimiter-top">
                        <div class="row align-items-center">
                          <div class="col-auto">
                            <span class="avatar avatar-sm bg-primary rounded-circle">
                              JD
                            </span>
                            <span class="text-sm mb-0 avatar-content">
                              David Wally
                            </span>
                          </div>
                          <div class="col text-right text-right">
                            <div class="actions">
                              <a href="#" class="action-item">
                                <i data-feather="heart" class="mr-1"></i> 50
                              </a>
                              <a href="#" class="action-item">
                                <i data-feather="eye" class=" mr-1"></i> 250
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-sm-6 col-lg-6 px-2">
                    <div class="card hover-translate-y-n3 hover-shadow-lg overflow-hidden">
                      <div class="position-relative overflow-hidden">
                        <a href="#" class="d-block">
                          <img
                            alt="Image placeholder"
                            src="https://preview.webpixels.io/quick-website-ui-kit/assets/img/theme/light/blog-2-800x600.jpg"
                            class="card-img-top"
                          />
                        </a>
                      </div>
                      <div class="card-body py-4">
                        <small class="d-block text-sm mb-2">
                          25 April, 2020
                        </small>
                        <a href="#" class="h5 stretched-link lh-150">
                          How to find the right design for your specific product
                        </a>
                        <p class="mt-3 mb-0 lh-170">
                          No matter what he does, every person on earth plays a
                          central role in the history.
                        </p>
                      </div>
                      <div class="card-footer border-0 delimiter-top">
                        <div class="row align-items-center">
                          <div class="col-auto">
                            <span class="avatar avatar-sm bg-primary rounded-circle">
                              JD
                            </span>
                            <span class="text-sm mb-0 avatar-content">
                              David Wally
                            </span>
                          </div>
                          <div class="col text-right text-right">
                            <div class="actions">
                              <a href="#" class="action-item">
                                <i data-feather="heart" class="mr-1"></i> 50
                              </a>
                              <a href="#" class="action-item">
                                <i data-feather="eye" class=" mr-1"></i> 250
                              </a>
                            </div>
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
      ) : (
        <div className="row">
          <div className="col-lg-12">
            <div className="text-center m-6">
              <p className="h1">Academy is Coming Soon...</p>
              <p class="lead">
                Stay tuned, the new Cryptocurrency Academy will be in CoinPanel.
              </p>
              <p class="lead">
                Reach out to{' '}
                <a href="mailto:james@coinpanel.com">james@coinpanel.com</a> for
                more info…
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AcademyContainer
