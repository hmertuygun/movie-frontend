import React, { useState, useContext, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Subscriptions = () => {
  return (
    <section className="slice slice-sm bg-section-secondary">
      <div className="card card-fluid">
        <div className="card-body">
          <div className="row">
            <div className="col-md-8">
              <p className="mb-0">No subscription added yet!</p>
            </div>
            <div className="col-md-4 text-md-right">
              <button type="button" className="btn btn-primary btn-sm">
                Redirect to Stripe
                <FontAwesomeIcon
                  icon="external-link-alt"
                  color="#ffffff"
                  className="ml-1"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* <div class="card">
        <div class="card-body">
          <div class="row row-grid align-items-center">
            <div class="col-lg-8">
              <div class="media align-items-center">
                <span class="avatar bg-danger text-white rounded-circle mr-3">
                  <FontAwesomeIcon icon="times" color="#ffffff" size="2x" />
                </span>
                <div class="media-body">
                  <h5 class="mb-0">Renew subscription for $20/month</h5>
                  <p class="text-muted lh-150 text-sm mb-0">
                    Email: denigada@gmail.com
                  </p>
                  <p class="text-muted lh-150 text-sm mb-0">
                    Your subscription ended on January 10th, 2020
                  </p>
                </div>
              </div>
            </div>
            <div class="col-auto flex-fill mt-4 mt-sm-0 text-sm-right">
              <a href="#" class="btn btn-sm btn-neutral rounded-pill">
                Renew
              </a>
            </div>
          </div>
        </div>
      </div> */}
    </section>
  )
}
export default Subscriptions
