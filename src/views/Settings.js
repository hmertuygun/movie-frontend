import React, { Fragment } from 'react'
import { TabNavigator } from '../components'
import Exchanges from '../Settings/Exchanges/Exchanges'
import Security from '../Settings/Security/Security'
import Notifications from '../Settings/Notifications'

const Settings = () => {
  return (
    <Fragment>
      <section
        className="pt-5 bg-section-secondary"
        style={{ height: 'calc(100vh - 71px)' }}
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-9">
              <div className="row align-items-center">
                <div className="col">
                  <span className="surtitle">Your account</span>

                  <h1 className="mb-0 h2">Settings</h1>
                </div>
              </div>

              <div className="mt-4 row align-items-center">
                <div className="col-12">
                  <TabNavigator
                    labelArray={['Exchanges', 'Security', 'Notifications']}
                    tabIndex={1}
                  >
                    <Exchanges />
                    <Security />
                    <Notifications />
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
