import React, { Fragment } from 'react'
import { TabNavigator } from '../components'
import Exchanges from '../Settings/Exchanges/Exchanges'
import Security from '../Settings/Security/Security'

const Settings = () => {
  return (
    <Fragment>
      <section className="pt-5 bg-section-secondary">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-9">
              <div className="row align-items-center">
                <div className="col">
                  <span className="surtitle">Your account</span>

                  <h1 className="h2 mb-0">Settings</h1>
                </div>
              </div>

              <div className="row align-items-center mt-4">
                <div className="col-12">
                  <TabNavigator
                    labelArray={[
                      'Exchanges',
                      'Subscription & Billing',
                      'Security',
                      'Notifcations',
                    ]}
                    tabIndex={1}
                  >
                    <Exchanges />
                    <div>Not available</div>
                    <Security />
                    <div>Not available</div>
                    <div>Not available</div>
                  </TabNavigator>
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
